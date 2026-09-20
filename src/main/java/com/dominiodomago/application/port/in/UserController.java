package com.dominiodomago.application.port.in;

import com.dominiodomago.domain.service.AuraCalculatorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

import com.dominiodomago.domain.model.User;
import com.dominiodomago.domain.model.UserRepository;
import com.dominiodomago.domain.service.tools.Tripo3dService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final AuraCalculatorService auraCalculatorService;
    private final Tripo3dService tripo3dService;
    private final UserRepository userRepository;

    public UserController(AuraCalculatorService auraCalculatorService,
                          Tripo3dService tripo3dService,
                          UserRepository userRepository) {
        this.auraCalculatorService = auraCalculatorService;
        this.tripo3dService = tripo3dService;
        this.userRepository = userRepository;
    }

    // DTO de Resposta do Dashboard
    public record DashboardResponse(
            int arcanoLevel,
            int globalXp,
            double auraRadius,
            int fireElement,
            int waterElement,
            int earthElement,
            int airElement,
            String avatarGlbUrl,
            int hp,
            int energy
    ) {}

    @GetMapping("/me/dashboard")
    public ResponseEntity<DashboardResponse> getUserDashboard() {
        // Extrai o usuário logado do contexto de segurança e recarrega os dados mais recentes do banco
        User principal = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findById(principal.getId()).orElse(principal);

        // Calculamos a Aura com base no XP Global
        double calculatedRadius = auraCalculatorService.calculateAuraRadius(user.getTotalTrophyPoints());

        DashboardResponse response = new DashboardResponse(
                user.getArcaneLevel(),
                user.getTotalTrophyPoints() != null ? user.getTotalTrophyPoints() : 0,
                calculatedRadius,
                user.getFireXp() != null ? user.getFireXp() : 78,
                user.getWaterXp() != null ? user.getWaterXp() : 45,
                user.getEarthXp() != null ? user.getEarthXp() : 92,
                user.getAirXp() != null ? user.getAirXp() : 60,
                user.getAvatarGlbUrl(),
                user.getHp() != null ? user.getHp() : 100,
                user.getEnergy() != null ? user.getEnergy() : 100
        );

        return ResponseEntity.ok(response);
    }

    public record AvatarResponse(String message, String avatarUrl) {}

    @PostMapping("/me/avatar")
    public ResponseEntity<?> generateAvatar(@RequestParam("images") List<MultipartFile> images) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        try {
            // Gera o avatar via API real da Tripo3D
            String glbUrl = tripo3dService.generateAvatarFromImages(images);

            // Atualiza a URL no banco de dados para o usuário autenticado
            user.setAvatarGlbUrl(glbUrl);
            userRepository.save(user);

            return ResponseEntity.ok(new AvatarResponse("Avatar forjado com sucesso!", glbUrl));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }
}
