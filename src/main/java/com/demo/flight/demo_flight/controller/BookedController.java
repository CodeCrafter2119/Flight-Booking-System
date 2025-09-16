package com.demo.flight.demo_flight.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.demo.flight.demo_flight.FlightBooked;
import com.demo.flight.demo_flight.services.FlightBookedService;
import com.demo.flight.demo_flight.services.RequestDTO;

@RestController
@RequestMapping("/flights")
public class BookedController {

	@Autowired
	private FlightBookedService service;
	
	
	
	@PostMapping("/booking")
	public ResponseEntity<FlightBooked> bookingTicket(@RequestBody RequestDTO booked){
		FlightBooked flightbook= service.flightbooking(booked);
		return ResponseEntity.status(HttpStatus.CREATED).body(flightbook);
	}
	
	
	
	@DeleteMapping("/ticket/{id}")
	public void deleteTicket(@PathVariable Long id) {
		service.deleteFlightBooking(id);
	}
	
	@GetMapping("/ticket/{id}")
	public ResponseEntity<ResponseEntity<FlightBooked>> showTicket(@PathVariable Long id){
		ResponseEntity<FlightBooked> booked= service.showTicket(id);
		return ResponseEntity.ok(booked);
	}
	
	@GetMapping("/bookings")
	public ResponseEntity<List<FlightBooked>> getAllBookings() {
		return ResponseEntity.ok(service.getAllBookings());
	}
	
	@GetMapping("/bookings/{id}")
	public ResponseEntity<FlightBooked> getBookingById(@PathVariable Long id){
		return ResponseEntity.ok(service.getBookingById(id));
	}
}

