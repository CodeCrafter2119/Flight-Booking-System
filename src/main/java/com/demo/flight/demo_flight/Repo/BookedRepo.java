package com.demo.flight.demo_flight.Repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.demo.flight.demo_flight.FlightBooked;
@Repository
public interface BookedRepo extends JpaRepository<FlightBooked, Long> {

	List<FlightBooked> findByFlight_Id(Long id); 

}
