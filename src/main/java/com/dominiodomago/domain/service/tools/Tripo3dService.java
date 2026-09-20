package com.dominiodomago.domain.service.tools;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class Tripo3dService {

    private static final Logger log = LoggerFactory.getLogger(Tripo3dService.class);

    private static final String TRIPO_UPLOAD_URL = "https://api.tripo3d.ai/v2/openapi/upload";
    private static final String TRIPO_TASK_URL = "https://api.tripo3d.ai/v2/openapi/task";

    @Value("${tripo3d.api-key}")
    private String apiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public Tripo3dService(ObjectMapper objectMapper) {
        this.restTemplate = new RestTemplate();
        this.objectMapper = objectMapper;
    }

    /**
     * Submete as fotos do usuário para a API da Tripo3D, cria a tarefa image_to_model,
     * aguarda via polling a conclusão e retorna a URL real do modelo .glb gerado.
     *
     * @param images Lista de imagens recebidas do usuário
     * @return URL pública do arquivo .glb gerado pela Tripo3D
     */
    public String generateAvatarFromImages(List<MultipartFile> images) {
        if (images == null || images.isEmpty()) {
            throw new IllegalArgumentException("Nenhuma imagem fornecida para a Forja do Avatar.");
        }

        if (apiKey == null || apiKey.isBlank() || apiKey.contains("mock_key")) {
            throw new IllegalStateException("Chave da API Tripo3D (tripo3d.api-key) não configurada ou inválida.");
        }

        MultipartFile primaryImage = images.get(0);
        log.info("Iniciando upload de imagem ({}, {} bytes) para Tripo3D...",
                primaryImage.getOriginalFilename(), primaryImage.getSize());

        // 1. Upload da imagem para obter o token de arquivo
        String fileToken = uploadImageToTripo(primaryImage);
        log.info("Upload concluído com sucesso. Token da imagem no Tripo3D: {}", fileToken);

        // 2. Criar a tarefa de geração 3D (image_to_model)
        String taskId = createTaskInTripo(fileToken, getFileExtension(primaryImage.getOriginalFilename()));
        log.info("Tarefa de geração 3D criada com sucesso. Task ID: {}. Iniciando polling...", taskId);

        // 3. Polling assíncrono para acompanhar a geração até o status 'success'
        String glbModelUrl = pollTaskUntilComplete(taskId);
        log.info("Modelo 3D gerado com sucesso pela Tripo3D! URL: {}", glbModelUrl);

        return glbModelUrl;
    }

    private String uploadImageToTripo(MultipartFile file) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(apiKey.trim());
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename() != null ? file.getOriginalFilename() : "avatar.jpg";
                }
            };
            body.add("file", fileResource);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            ResponseEntity<JsonNode> response = restTemplate.postForEntity(TRIPO_UPLOAD_URL, requestEntity, JsonNode.class);

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new RuntimeException("Falha no upload para Tripo3D. HTTP Status: " + response.getStatusCode());
            }

            JsonNode root = response.getBody();
            int code = root.path("code").asInt(-1);
            if (code != 0) {
                String message = root.path("message").asText("Erro desconhecido no upload");
                throw new RuntimeException(String.format("Erro Tripo3D Upload (código %d): %s", code, message));
            }

            JsonNode data = root.path("data");
            if (data.has("image_token") && !data.path("image_token").asText().isBlank()) {
                return data.path("image_token").asText();
            }
            if (data.has("file_token") && !data.path("file_token").asText().isBlank()) {
                return data.path("file_token").asText();
            }

            throw new RuntimeException("Resposta da Tripo3D não continha image_token ou file_token: " + root);
        } catch (HttpStatusCodeException e) {
            String errorDetails = parseErrorResponseBody(e.getResponseBodyAsString());
            log.error("Erro HTTP no upload para Tripo3D: {} - {}", e.getStatusCode(), errorDetails);
            throw new RuntimeException("Erro ao enviar imagem para Tripo3D: " + errorDetails, e);
        } catch (Exception e) {
            log.error("Falha inesperada no upload para Tripo3D: {}", e.getMessage(), e);
            throw new RuntimeException("Falha no upload da foto para a Tripo3D: " + e.getMessage(), e);
        }
    }

    private String createTaskInTripo(String fileToken, String fileType) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(apiKey.trim());
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> payload = new HashMap<>();
            payload.put("type", "image_to_model");

            Map<String, Object> fileObj = new HashMap<>();
            fileObj.put("type", fileType);
            fileObj.put("file_token", fileToken);
            payload.put("file", fileObj);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(payload, headers);
            ResponseEntity<JsonNode> response = restTemplate.postForEntity(TRIPO_TASK_URL, requestEntity, JsonNode.class);

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new RuntimeException("Falha ao criar tarefa no Tripo3D. HTTP Status: " + response.getStatusCode());
            }

            JsonNode root = response.getBody();
            int code = root.path("code").asInt(-1);
            if (code != 0) {
                String message = root.path("message").asText("Erro ao criar tarefa");
                String suggestion = root.path("suggestion").asText("");
                throw new RuntimeException(String.format("Tripo3D (código %d): %s %s",
                        code, message, suggestion.isBlank() ? "" : "(" + suggestion + ")"));
            }

            String taskId = root.path("data").path("task_id").asText();
            if (taskId == null || taskId.isBlank()) {
                throw new RuntimeException("Tripo3D não retornou task_id válido: " + root);
            }

            return taskId;
        } catch (HttpStatusCodeException e) {
            String errorDetails = parseErrorResponseBody(e.getResponseBodyAsString());
            log.error("Erro HTTP ao criar tarefa na Tripo3D: {} - {}", e.getStatusCode(), errorDetails);
            throw new RuntimeException("Erro ao iniciar tarefa na Tripo3D: " + errorDetails, e);
        } catch (Exception e) {
            log.error("Falha inesperada ao criar tarefa na Tripo3D: {}", e.getMessage(), e);
            throw new RuntimeException("Falha ao criar tarefa 3D na Tripo3D: " + e.getMessage(), e);
        }
    }

    private String pollTaskUntilComplete(String taskId) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey.trim());
        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

        String pollUrl = TRIPO_TASK_URL + "/" + taskId;

        // Poll a cada 2 segundos por até 60 iterações (~2 minutos)
        for (int attempt = 1; attempt <= 60; attempt++) {
            try {
                Thread.sleep(2000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("Processamento de avatar interrompido.", e);
            }

            try {
                ResponseEntity<JsonNode> response = restTemplate.exchange(pollUrl, HttpMethod.GET, requestEntity, JsonNode.class);
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    JsonNode dataNode = response.getBody().path("data");
                    String status = dataNode.path("status").asText();
                    int progress = dataNode.path("progress").asInt(0);

                    log.info("Tripo3D polling tarefa {}: {}% (status: {})", taskId, progress, status);

                    if ("success".equalsIgnoreCase(status)) {
                        JsonNode output = dataNode.path("output");
                        if (output.has("pbr_model") && !output.path("pbr_model").asText().isBlank()) {
                            return output.path("pbr_model").asText();
                        }
                        if (output.has("model") && !output.path("model").asText().isBlank()) {
                            return output.path("model").asText();
                        }
                        if (output.has("model_url") && !output.path("model_url").asText().isBlank()) {
                            return output.path("model_url").asText();
                        }
                        throw new RuntimeException("Tarefa concluída com sucesso, mas nenhum link de modelo .glb foi retornado.");
                    }

                    if ("failed".equalsIgnoreCase(status) || "cancelled".equalsIgnoreCase(status)) {
                        String failReason = dataNode.path("message").asText("Sem detalhes");
                        throw new RuntimeException(String.format("Geração 3D falhou no Tripo3D (status: %s, motivo: %s)", status, failReason));
                    }
                }
            } catch (HttpStatusCodeException e) {
                log.warn("Tentativa {}/60: Erro temporário ao consultar status da tarefa {}: {}", attempt, taskId, e.getMessage());
            }
        }

        throw new RuntimeException("Tempo limite excedido (~2 min) aguardando a geração do modelo 3D no Tripo3D.");
    }

    private String parseErrorResponseBody(String responseBody) {
        if (responseBody == null || responseBody.isBlank()) {
            return "Sem detalhes na resposta do servidor.";
        }
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            String msg = root.path("message").asText("");
            String suggestion = root.path("suggestion").asText("");
            int code = root.path("code").asInt(0);

            if (!msg.isBlank()) {
                return String.format("%s (código: %d)%s", msg, code, suggestion.isBlank() ? "" : " - " + suggestion);
            }
        } catch (Exception ignored) {
        }
        return responseBody;
    }

    private String getFileExtension(String filename) {
        if (filename != null && filename.contains(".")) {
            String ext = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
            if (ext.equals("png") || ext.equals("jpeg") || ext.equals("jpg") || ext.equals("webp")) {
                return ext.equals("jpeg") ? "jpg" : ext;
            }
        }
        return "jpg";
    }
}
