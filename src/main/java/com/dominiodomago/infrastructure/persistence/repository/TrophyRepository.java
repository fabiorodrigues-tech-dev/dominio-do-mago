package com.dominiodomago.infrastructure.persistence.repository;

import com.dominiodomago.infrastructure.persistence.entity.TrophyEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TrophyRepository extends JpaRepository<TrophyEntity, UUID> {

    @Query("SELECT t FROM TrophyEntity t WHERE t.user.id = :userId ORDER BY t.unlockedAt DESC")
    List<TrophyEntity> findByUserIdOrderByUnlockedAtDesc(@Param("userId") UUID userId);

    @Query("SELECT CASE WHEN COUNT(t) > 0 THEN true ELSE false END FROM TrophyEntity t WHERE t.user.id = :userId AND t.title = :title")
    boolean existsByUserIdAndTitle(@Param("userId") UUID userId, @Param("title") String title);
}
