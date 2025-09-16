package com.demo.flight.demo_flight;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Entity
public class UserClass {
	
	@Id
	@GeneratedValue
	private long id;
 
	private String username;
	
	private String password;
	
	private String email;
}
