package com.demo.flight.demo_flight.security;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import com.demo.flight.demo_flight.UserClass;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.demo.flight.demo_flight.Repo.UserRepo;

@Service
public class CustomUserDetailsManager implements UserDetailsService{

    @Autowired
    private UserRepo userRepo;
    
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Optional<UserClass> user = userRepo.findByEmail(email);
        
        
        return User.builder()
                .username(user.get().getEmail())
                .password(user.get().getPassword())
                .build();
    }
}
