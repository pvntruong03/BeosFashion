package com.uniqlo.clone.security;

import com.uniqlo.clone.entity.Employee;
import com.uniqlo.clone.entity.User;
import com.uniqlo.clone.repository.EmployeeRepository;
import com.uniqlo.clone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        Long storeId = null;
        String storeName = null;

        if (user.getRole().name().startsWith("ROLE_STAFF")) {
            Employee employee = employeeRepository.findByUserId(user.getId()).orElse(null);
            if (employee != null && employee.getStore() != null) {
                storeId = employee.getStore().getId();
                storeName = employee.getStore().getName();
            }
        }

        return UserPrincipal.create(user, storeId, storeName);
    }
}
