package com.demo.flight.demo_flight.Repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.demo.flight.demo_flight.Flight;

@Repository
public interface FlightRepositorym extends JpaRepository<Flight, Long>{

	 List<Flight> findByDepartureFromAndArrivalTo(String departureFrom, String arrivalTo);
	 List<Flight> findByDepartureFrom(String departureFrom);
	 List<Flight> findByarrivalTo(String arrivalTo);
}
