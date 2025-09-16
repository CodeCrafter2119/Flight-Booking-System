package com.demo.flight.demo_flight.Repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.demo.flight.demo_flight.UserClass;

@Repository
public interface UserRepo extends JpaRepository<UserClass, Long> {

	boolean existsByEmail(String email);
	
	Optional<UserClass> findByEmail(String email); 
}
