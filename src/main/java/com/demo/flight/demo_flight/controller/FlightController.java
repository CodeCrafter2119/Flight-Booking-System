package com.demo.flight.demo_flight.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.demo.flight.demo_flight.Flight;
import com.demo.flight.demo_flight.FlightBooked;
import com.demo.flight.demo_flight.services.FlightsServices;

@RestController
@RequestMapping("/flights")
public class FlightController {

	private FlightsServices flightsServices;
	
	FlightController(FlightsServices flightsServices) {
		this.flightsServices= flightsServices;
	}
	
	@GetMapping
	public List<Flight> getALLFlightsData(){
		return flightsServices.getAllFlights();
	}
	
	@GetMapping("/{id}")
	public Optional<Flight> FindById(@PathVariable Long id){
		return flightsServices.findbyId(id);
	}
	
//	@GetMapping("place/{placeName}/{placeTo}")
//	public List<Flight> findByDepartureFrom(@PathVariable String placeName,@PathVariable String placeTo){
//		return flightsServices.findBydepartureFrom(placeName,placeTo);
//	}
	
	// Spring Boot example
	 @GetMapping("/place/{placeFrom}/{placeTo}")
	    public ResponseEntity<List<Flight>> getFlightsFromTo(
	            @PathVariable String placeFrom,
	            @PathVariable String placeTo) {
	        return flightsServices.findByDepartureFromAndArrivalTo(placeFrom, placeTo);
	    }
	
	@PostMapping("/add")
	public Flight addFlightDestination(@RequestBody Flight flightclass ) {
		Flight FlightClass=flightsServices.AddFlightDestination(flightclass);
		System.out.println("Flights>>>>>>>>>>");
		return FlightClass;
	}
	
	@PutMapping("/update/{id}")
	public Flight updateFlightDestination(@PathVariable Long id,  @RequestBody Flight flight) {
	    return flightsServices.UpdateFlightDEstination(id, flight);
	}
	
	@DeleteMapping("delete/{id}")
	public void DeleteFlight(@PathVariable Long id) {
		flightsServices.DeleteFlight(id);
	}
	
	@GetMapping("bookingByFlight/{id}")
	public List<FlightBooked> getBookingsByFlightId(@PathVariable Long id){
		
		List<FlightBooked> flight= flightsServices.findAllBookingsByFlightId(id);
		
		return flight;
	}
}
