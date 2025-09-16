package com.demo.flight.demo_flight.Repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.demo.flight.demo_flight.Admin;

@Repository
public interface AdminRespository extends JpaRepository<Admin, Long> {

	// Method to find a user by username
	Optional<Admin> findByUsername(String username);

	// Method to check if a user exists by username
	boolean existsByUsername(String username);

	// Method to delete a user by username
	void deleteByUsername(String username);

}
