package com.demo.flight.demo_flight.security;

import java.security.KeyPair;

import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPublicKey;
import java.util.UUID;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.oauth2.server.resource.OAuth2ResourceServerConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;


@Configuration
@EnableWebSecurity
public class SecurityConfig {

	@Bean
	public WebMvcConfigurer corsConfigurer() {
	    return new WebMvcConfigurer() {
	        @Override
	        public void addCorsMappings(CorsRegistry registry) {
	            registry.addMapping("/**")
	                    .allowedOrigins("http://flight-admin.s3-website.ap-south-1.amazonaws.com"
	                    		        ,"http://flight-frontend2.s3-website.ap-south-1.amazonaws.com") // Your React app URL
	                    .allowedMethods("*") 
	                    .allowedHeaders("*");
	        }
	    };
	}
	
	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception{
		
		http.authorizeHttpRequests (auth -> auth
				
//				.requestMatchers("/flights/**","/assist/**").permitAll()
				.requestMatchers(
						"/authenticate",
						"/authenticate/user",
						"/register",
						"/register/user",
						"/flights/**",
						"/reserve-seat",
						"/release-seat",
						"/sendMessage",
						"/topic/**",
						"/ws/**",
						"/flights/booking/payment",
						"/payment/**",
						"/assist/**",
						"/flights/place/**"
						).permitAll()
//				.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
				.anyRequest().authenticated());
		http.sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            );
    	http.oauth2ResourceServer(OAuth2ResourceServerConfigurer::jwt);
		
    	http.cors(Customizer.withDefaults());
    	http.csrf(csrf -> csrf.disable());
		
		return http.build();
	}
	
	@Bean
	public BCryptPasswordEncoder PasswordEncoder() {
		return new BCryptPasswordEncoder();
	}
	//creating jWT 
	@Bean
	public KeyPair keyPair(){
		try {
			
			var KeyPairgenerator = KeyPairGenerator.getInstance("RSA");
			KeyPairgenerator.initialize(2048);
			return KeyPairgenerator.generateKeyPair();
		}catch(Exception ex) {
			   throw new RuntimeException(ex);
		}
	}
	
	@Bean
	public RSAKey rsaKey(KeyPair keyPair) {
		
		return new RSAKey.Builder((RSAPublicKey) keyPair.getPublic())
				.privateKey(keyPair.getPrivate())
				.keyID(UUID.randomUUID().toString())
				.build();
				
	}
	
	@Bean
	public JWKSource<SecurityContext> jwkSource(RSAKey rsaKey){
		var jwkSet =new JWKSet(rsaKey);
		
		return (jwkSelector, context) -> jwkSelector.select(jwkSet);
	}
	
	@Bean
	public JwtDecoder jwtDecoder(RSAKey rsaKey) throws JOSEException {
		return NimbusJwtDecoder.withPublicKey(rsaKey.toRSAPublicKey()).build();
	}
	
	@Bean
	public JwtEncoder jwtEncoder(JWKSource<SecurityContext> jwkSource) {
		return new NimbusJwtEncoder(jwkSource);
	}
}
