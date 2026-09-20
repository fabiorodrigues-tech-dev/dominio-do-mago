package org.springframework.ai.google.gemini;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "spring.ai.google.gemini")
public class GoogleGeminiChatProperties {

    private String apiKey;
    private Chat chat = new Chat();

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public Chat getChat() {
        return chat;
    }

    public void setChat(Chat chat) {
        this.chat = chat;
    }

    public static class Chat {
        private Options options = new Options();

        public Options getOptions() {
            return options;
        }

        public void setOptions(Options options) {
            this.options = options;
        }
    }

    public static class Options {
        private String model = "gemini-1.5-flash";

        public String getModel() {
            return model;
        }

        public void setModel(String model) {
            this.model = model;
        }
    }
}
