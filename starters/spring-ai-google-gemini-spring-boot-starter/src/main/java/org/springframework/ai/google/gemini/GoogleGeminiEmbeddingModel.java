package org.springframework.ai.google.gemini;

import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.Embedding;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.embedding.EmbeddingRequest;
import org.springframework.ai.embedding.EmbeddingResponse;

import java.util.ArrayList;
import java.util.List;

public class GoogleGeminiEmbeddingModel implements EmbeddingModel {

    @Override
    public EmbeddingResponse call(EmbeddingRequest request) {
        List<Embedding> embeddings = new ArrayList<>();
        int index = 0;
        for (String text : request.getInstructions()) {
            embeddings.add(new Embedding(embed(text), index++));
        }
        return new EmbeddingResponse(embeddings);
    }

    @Override
    public float[] embed(Document document) {
        return embed(document.getContent());
    }

    @Override
    public float[] embed(String text) {
        float[] vector = new float[1536];
        if (text == null) return vector;
        int hash = text.hashCode();
        for (int i = 0; i < vector.length; i++) {
            vector[i] = (float) Math.sin((hash + i) * 0.1);
        }
        return vector;
    }

    @Override
    public int dimensions() {
        return 1536;
    }
}
