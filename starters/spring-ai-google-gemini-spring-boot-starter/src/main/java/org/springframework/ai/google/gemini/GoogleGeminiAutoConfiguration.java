package org.springframework.ai.google.gemini;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;

@AutoConfiguration
@EnableConfigurationProperties(GoogleGeminiChatProperties.class)
public class GoogleGeminiAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean(ChatModel.class)
    public GoogleGeminiChatModel googleGeminiChatModel(GoogleGeminiChatProperties properties) {
        return new GoogleGeminiChatModel(properties);
    }

    @Bean
    @ConditionalOnMissingBean(EmbeddingModel.class)
    public GoogleGeminiEmbeddingModel googleGeminiEmbeddingModel() {
        return new GoogleGeminiEmbeddingModel();
    }

    @Bean
    @ConditionalOnMissingBean(ChatClient.Builder.class)
    public ChatClient.Builder chatClientBuilder(ChatModel chatModel) {
        return ChatClient.builder(chatModel);
    }
}
