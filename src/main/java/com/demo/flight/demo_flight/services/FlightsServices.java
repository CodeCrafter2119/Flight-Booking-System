package com.demo.flight.demo_flight.services;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.demo.flight.demo_flight.Flight;
import com.demo.flight.demo_flight.FlightBooked;
import com.demo.flight.demo_flight.Repo.BookedRepo;
import com.demo.flight.demo_flight.Repo.FlightRepositorym;


@Service
public class FlightsServices {
	
	private FlightRepositorym flightRepositorym;
	
	
	private BookedRepo bookedRepo;
	
	FlightsServices(FlightRepositorym flightRepositorym,BookedRepo bookedRepo){
		this.flightRepositorym= flightRepositorym;
		this.bookedRepo= bookedRepo;
	}

	public List<Flight> getAllFlights(){
		return flightRepositorym.findAll();
	}
	
	public Flight AddFlightDestination( Flight flight) {
		Flight newFlight= flightRepositorym.save(flight);
		
		return newFlight;
	}
	
	public Flight UpdateFlightDEstination(Long id,Flight flight) {
		 Flight newUpdate= flightRepositorym.findById(id).orElseThrow(() -> new RuntimeException("Student not found with id: " + id));;
		 newUpdate.setDeparture(flight.getDeparture());
		 newUpdate.setDepartureFrom(flight.getDepartureFrom());
		 newUpdate.setArrivalTo(flight.getArrivalTo());
		 newUpdate.setDepartureTime(flight.getDepartureTime());
		 newUpdate.setReturnDate(flight.getReturnDate());
		 newUpdate.setSeatsAvailable(flight.getSeatsAvailable());
		 newUpdate.setBookings(flight.getBookings());
		 newUpdate.setPrice(flight.getPrice());
		 return flightRepositorym.save(newUpdate);
		
	}
	
	public Optional<Flight> findbyId(Long id){
		return flightRepositorym.findById(id);
	}
	
	public void DeleteFlight(Long id) {
		flightRepositorym.deleteById(id);
	}
	
	public List<Flight> findByArrivalTo(String placeTo) {
		if(flightRepositorym.findByarrivalTo(placeTo).isEmpty()) {
			return (List<Flight>) new RuntimeException("Not Found");
		}
		return flightRepositorym.findByarrivalTo(placeTo);
	}
	
	public ResponseEntity<List<Flight>> findByDepartureFromAndArrivalTo(
            String placeFrom, 
            String placeTo) {
        
        List<Flight> flights;
        
        if ("any".equalsIgnoreCase(placeFrom)) {
            flights = flightRepositorym.findByarrivalTo(placeTo);
        } 
        else if ("any".equalsIgnoreCase(placeTo)) {
            flights = flightRepositorym.findByDepartureFrom(placeFrom);
        } 
        else {
            flights = flightRepositorym.findByDepartureFromAndArrivalTo(placeFrom, placeTo);
        }
        
        if (flights.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        
        return ResponseEntity.ok(flights);
    }

	public List<Flight> findBydepartureFrom(String placeFrom) {
		if(flightRepositorym.findByDepartureFrom(placeFrom).isEmpty()) {
			return (List<Flight>) new RuntimeException("Not Found");
		}
		return flightRepositorym.findByDepartureFrom(placeFrom);
	}
	
	public List<FlightBooked> findAllBookingsByFlightId(Long id){
		List<FlightBooked> flight = bookedRepo.findByFlight_Id(id);
		 
		return flight;
	 
		 
	}
}
