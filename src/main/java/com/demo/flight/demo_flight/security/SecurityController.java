package com.demo.flight.demo_flight.security;

import java.time.Instant;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.demo.flight.demo_flight.Admin;
import com.demo.flight.demo_flight.UserClass;
import com.demo.flight.demo_flight.Repo.AdminRespository;
import com.demo.flight.demo_flight.Repo.UserRepo;

@RestController
public class SecurityController {
	@Autowired
	private AuthenticationManager authenticationManager;
	@Autowired
    private JwtEncoder jwtEncoder;
	@Autowired
	private AdminRespository adminRespository;
	@Autowired
	private UserRepo userRepo;
	@Autowired
	private PasswordEncoder encoder;

	@GetMapping("/security")
	public String security() {
		return "Security is enabled";
	}
	
	@PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (adminRespository.existsByUsername(request.username())) {
            return ResponseEntity.badRequest().body("Username already exists");
        }
        
        Admin user = new Admin();
        user.setUsername(request.username());
        user.setPassword(encoder.encode(request.password()));
        user.setRole("ROLE_ADMIN"); // Default role
        
        adminRespository.save(user);
        
        return ResponseEntity.ok(user);
    }
	
	@PostMapping("/authenticate")
	public ResponseEntity<JWTResponse> authenticate(@RequestBody AuthRequest authcontext){
		Authentication authentication=authenticationManager.authenticate(
				new UsernamePasswordAuthenticationToken(
						authcontext.username(), 
						authcontext.password()
						)
				);
		String token = createToken(authentication);
		return ResponseEntity.ok(new JWTResponse(token));
	}
	
	@PostMapping("/register/user")
	public ResponseEntity<?> userRegister(@RequestBody RegisterUser register){
		if(userRepo.existsByEmail(register.email())) {
			return ResponseEntity.badRequest().body("User is already exists");
		}
		
		UserClass user = new UserClass();
		user.setUsername(register.username());
		user.setPassword(encoder.encode(register.password()));
		user.setEmail(register.email());
		
		userRepo.save(user);
		
		return ResponseEntity.ok(user);
	}
	
	@PostMapping("/authenticate/user")
	public ResponseEntity<JWTResponse> userAuthenticate(@RequestBody UserRequest userauth){
		Authentication authentication=authenticationManager.authenticate(
				new UsernamePasswordAuthenticationToken(
						userauth.email(),
						userauth.password()
						)
				);
		String token = createToken(authentication);
		return ResponseEntity.ok(new JWTResponse(token));
	}
	
	
	
	
	
	private String createToken(Authentication authentication) {
		var claims = JwtClaimsSet.builder()
				.issuer("self")
				.issuedAt(Instant.now())
				.expiresAt(Instant.now()
				.plusSeconds(60 * 30))
				.subject(authentication.getName())
				.claim("scope", createScope(authentication))
				.claim("roles", authentication.getAuthorities().stream()
	                    .map(GrantedAuthority::getAuthority)
	                    .collect(Collectors.toList())) // Add roles claim
				.build();

		JwtEncoderParameters encoderParameters= JwtEncoderParameters.from(claims);
		
		return jwtEncoder.encode(encoderParameters).getTokenValue();
	}
	private String createScope(Authentication authentication) {
		
		return authentication.getAuthorities().stream()
				.map(a -> a.getAuthority())
				.collect(Collectors.joining(" "));
	}
}

record AuthRequest(Long id,String username, String password) {}
record UserRequest(Long id,String email, String password) {}

record JWTResponse(String token) {}
record RegisterRequest(String username,String password,String role) {}
record RegisterUser(String username,String password,String email) {}