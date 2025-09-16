package com.demo.flight.demo_flight.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AuthenticationConfig {

	@Bean
	public AuthenticationManager authenticationManager(
			CustomAdminDetailsManager customAdminDetailsManager,
			PasswordEncoder encoder
			) {
       DaoAuthenticationProvider provider =new DaoAuthenticationProvider();
       provider.setUserDetailsService(customAdminDetailsManager);
       provider.setPasswordEncoder(encoder);
       return new ProviderManager(provider);
	}
	
	@Bean
	@Primary
	public AuthenticationManager authenticationManager2(
			CustomUserDetailsManager customUserDetailsManager,
			PasswordEncoder encoder
			) {
       DaoAuthenticationProvider provider =new DaoAuthenticationProvider();
       provider.setUserDetailsService(customUserDetailsManager);
       provider.setPasswordEncoder(encoder);
       return new ProviderManager(provider);
	}
}
