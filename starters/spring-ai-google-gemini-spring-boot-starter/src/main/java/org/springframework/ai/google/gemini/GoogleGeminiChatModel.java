package org.springframework.ai.google.gemini;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.model.Generation;
import org.springframework.ai.chat.prompt.ChatOptions;
import org.springframework.ai.chat.prompt.Prompt;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class GoogleGeminiChatModel implements ChatModel {

    private static final Logger log = LoggerFactory.getLogger(GoogleGeminiChatModel.class);
    private final GoogleGeminiChatProperties properties;
    private final HttpClient httpClient;

    public GoogleGeminiChatModel(GoogleGeminiChatProperties properties) {
        this.properties = properties;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();
    }

    @Override
    public ChatResponse call(Prompt prompt) {
        String apiKey = resolveApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("GEMINI_API_KEY não configurada no ambiente ou no ficheiro .env.");
        }

        String userText = prompt.getContents();
        if (userText == null || userText.isBlank()) {
            StringBuilder sb = new StringBuilder();
            for (Message msg : prompt.getInstructions()) {
                sb.append(msg.getContent()).append("\n");
            }
            userText = sb.toString();
        }

        String targetModel = properties.getChat() != null && properties.getChat().getOptions() != null
                ? properties.getChat().getOptions().getModel()
                : "gemini-3.8-flash";

        String[] modelCandidates = new String[] { targetModel, "gemini-3.8-flash", "gemini-3.6-flash", "gemini-flash-latest" };

        String generatedText = null;
        Exception lastException = null;

        for (String modelName : modelCandidates) {
            try {
                generatedText = callGeminiApi(modelName, apiKey, userText);
                if (generatedText != null && !generatedText.isBlank()) {
                    break;
                }
            } catch (Exception e) {
                lastException = e;
                log.warn("Tentativa de chamada com modelo {} falhou: {}. Tentando próximo modelo...", modelName, e.getMessage());
            }
        }

        if (generatedText == null) {
            if (lastException != null) {
                throw new RuntimeException("Falha ao comunicar com a API do Google Gemini: " + lastException.getMessage(), lastException);
            }
            throw new RuntimeException("Não foi possível obter resposta do Gemini.");
        }

        Generation generation = new Generation(generatedText);
        return new ChatResponse(List.of(generation));
    }

    private String resolveApiKey() {
        String key = properties != null ? properties.getApiKey() : null;
        if (key != null && !key.isBlank() && !key.startsWith("${")) {
            return key.trim();
        }
        key = System.getenv("GEMINI_API_KEY");
        if (key != null && !key.isBlank() && !key.startsWith("${")) {
            return key.trim();
        }
        key = readKeyFromEnvFile(".env");
        if (key != null && !key.isBlank()) {
            return key.trim();
        }
        key = readKeyFromEnvFile("src/main/resources/.env");
        if (key != null && !key.isBlank()) {
            return key.trim();
        }
        return null;
    }

    private String readKeyFromEnvFile(String path) {
        try {
            java.nio.file.Path p = java.nio.file.Path.of(path);
            if (java.nio.file.Files.exists(p)) {
                for (String line : java.nio.file.Files.readAllLines(p)) {
                    line = line.trim();
                    if (line.startsWith("GEMINI_API_KEY=")) {
                        String val = line.substring("GEMINI_API_KEY=".length()).trim();
                        if ((val.startsWith("\"") && val.endsWith("\"")) || (val.startsWith("'") && val.endsWith("'"))) {
                            val = val.substring(1, val.length() - 1);
                        }
                        if (!val.isBlank() && !val.startsWith("${")) {
                            return val;
                        }
                    }
                }
            }
        } catch (Exception ignored) {}
        return null;
    }

    private String callGeminiApi(String modelName, String apiKey, String userText) throws Exception {
        String escapedText = escapeJson(userText);
        String requestJson = String.format("{\"contents\":[{\"parts\":[{\"text\":\"%s\"}]}]}", escapedText);

        String encodedKey = java.net.URLEncoder.encode(apiKey, java.nio.charset.StandardCharsets.UTF_8);
        String url = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                modelName, encodedKey);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(20))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestJson))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("HTTP " + response.statusCode() + ": " + response.body());
        }

        return extractTextFromResponse(response.body());
    }

    private String extractTextFromResponse(String responseBody) {
        Pattern pattern = Pattern.compile("\"text\"\\s*:\\s*\"((?:\\\\.|[^\"\\\\])*)\"");
        Matcher matcher = pattern.matcher(responseBody);
        if (matcher.find()) {
            return unescapeJson(matcher.group(1));
        }
        return responseBody;
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\b", "\\b")
                .replace("\f", "\\f")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    private String unescapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\n", "\n")
                .replace("\\r", "\r")
                .replace("\\t", "\t")
                .replace("\\\"", "\"")
                .replace("\\\\", "\\");
    }

    @Override
    public ChatOptions getDefaultOptions() {
        return null;
    }
}
