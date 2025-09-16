package com.demo.flight.demo_flight.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.demo.flight.demo_flight.Admin;
import com.demo.flight.demo_flight.Repo.AdminRespository;

@Service
public class CustomAdminDetailsManager implements UserDetailsService {

    @Autowired
    private AdminRespository adminRepository;
    
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Admin admin = adminRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        
        return User.builder()
                .username(admin.getUsername())
                .password(admin.getPassword())
                .roles(admin.getRole().substring(4)) // Let Spring add the ROLE_ prefix
                .build();
    }
}
 

