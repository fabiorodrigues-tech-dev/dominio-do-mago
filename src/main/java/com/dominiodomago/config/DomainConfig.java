package com.dominiodomago.config;

import com.dominiodomago.domain.service.GachaAlgorithmService;
import com.dominiodomago.domain.service.PityWeightCalculator;
import com.dominiodomago.domain.service.StreakDomainService;
import java.time.Clock;
import java.util.random.RandomGenerator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DomainConfig {

    @Bean
    public Clock clock() {
        // Centraliza o fuso horário do sistema; troque por ZoneId fixo se preferir
        // consistência entre servidores (ex: Clock.system(ZoneId.of("America/Sao_Paulo"))).
        return Clock.systemDefaultZone();
    }

    @Bean
    public RandomGenerator randomGenerator() {
        return RandomGenerator.getDefault();
    }

    @Bean
    public StreakDomainService streakDomainService(Clock clock) {
        return new StreakDomainService(clock);
    }

    @Bean
    public GachaAlgorithmService gachaAlgorithmService(RandomGenerator randomGenerator) {
        return new GachaAlgorithmService(randomGenerator);
    }

    @Bean
    public PityWeightCalculator pityWeightCalculator(
        Clock clock,
        @Value("${nexuslife.gacha.pity.growth-per-day:0.15}") double growthPerDay,
        @Value("${nexuslife.gacha.pity.max-multiplier:5.0}") double maxMultiplier
    ) {
        return new PityWeightCalculator(clock, growthPerDay, maxMultiplier);
    }
}
