package com.uniqlo.clone.service;

import com.uniqlo.clone.dto.AuthRequest;
import com.uniqlo.clone.dto.AuthResponse;
import com.uniqlo.clone.dto.RegisterRequest;
import com.uniqlo.clone.entity.Employee;
import com.uniqlo.clone.entity.Role;
import com.uniqlo.clone.entity.User;
import com.uniqlo.clone.exception.BadRequestException;
import com.uniqlo.clone.exception.ResourceNotFoundException;
import com.uniqlo.clone.repository.EmployeeRepository;
import com.uniqlo.clone.repository.UserRepository;
import com.uniqlo.clone.security.JwtTokenProvider;
import com.uniqlo.clone.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        return buildAuthResponse(jwt, userPrincipal.getId());
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .address(request.getAddress())
                .city(request.getCity())
                .role(Role.ROLE_CUSTOMER)
                .enabled(true)
                .build();

        user = userRepository.save(user);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String jwt = tokenProvider.generateToken(authentication);

        return buildAuthResponse(jwt, user.getId());
    }

    @Transactional(readOnly = true)
    public AuthResponse.UserProfileDto getCurrentUserProfile(UserPrincipal principal) {
        if (principal == null) {
            throw new BadRequestException("User is not authenticated");
        }
        return buildUserProfile(principal.getId());
    }

    private AuthResponse buildAuthResponse(String jwt, Long userId) {
        return AuthResponse.builder()
                .token(jwt)
                .tokenType("Bearer")
                .expiresIn(jwtExpirationMs / 1000)
                .user(buildUserProfile(userId))
                .build();
    }

    private AuthResponse.UserProfileDto buildUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Long storeId = null;
        String storeName = null;
        String storeCode = null;
        String position = null;

        if (user.getRole().name().startsWith("ROLE_STAFF")) {
            Employee employee = employeeRepository.findByUserId(user.getId()).orElse(null);
            if (employee != null && employee.getStore() != null) {
                storeId = employee.getStore().getId();
                storeName = employee.getStore().getName();
                storeCode = employee.getStore().getCode();
                position = employee.getPosition();
            }
        }

        return AuthResponse.UserProfileDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .address(user.getAddress())
                .city(user.getCity())
                .role(user.getRole())
                .avatar(user.getAvatar())
                .storeId(storeId)
                .storeName(storeName)
                .storeCode(storeCode)
                .position(position)
                .build();
    }
}
