package com.dominiodomago.application.port.in;

import com.dominiodomago.domain.model.User;
import com.dominiodomago.domain.model.UserRepository;
import com.dominiodomago.infrastructure.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authenticationManager,
                          UserDetailsService userDetailsService,
                          JwtUtil jwtUtil,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public record LoginRequest(String email, String password) {}
    public record RegisterRequest(String username, String email, String password) {}
    public record AuthResponse(String token, UUID userId, String username) {}
    public record MessageResponse(String message) {}

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password())
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Credenciais inválidas."));
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(request.email());
        Optional<User> userOpt = userRepository.findByEmail(request.email());
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            final String jwt = jwtUtil.generateToken(userDetails, user.getId());
            return ResponseEntity.ok(new AuthResponse(jwt, user.getId(), user.getUsername()));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Erro interno na validação."));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            if (userRepository.findByEmail(request.email()).isPresent()) {
                return ResponseEntity.badRequest().body(new MessageResponse("O email já foi forjado em um Grimório."));
            }

            if (userRepository.findByUsername(request.username()).isPresent()) {
                return ResponseEntity.badRequest().body(new MessageResponse("O Mago já possui um nome reconhecido."));
            }

            User user = new User();
            user.setUsername(request.username());
            user.setEmail(request.email());
            user.setPasswordHash(passwordEncoder.encode(request.password()));
            userRepository.save(user);

            return ResponseEntity.ok(new MessageResponse("Aliança forjada com sucesso. Acesse seu Grimório."));
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new MessageResponse("Erro de integridade de dados. Provavelmente este nome ou e-mail já existe no banco."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new MessageResponse("Erro detalhado do backend: " + e.getMessage()));
        }
    }
}
