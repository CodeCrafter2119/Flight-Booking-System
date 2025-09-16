package com.demo.flight.demo_flight.services;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.demo.flight.demo_flight.Flight;
import com.demo.flight.demo_flight.FlightBooked;
import com.demo.flight.demo_flight.FlightBooked.BookingStatus;
import com.demo.flight.demo_flight.Repo.BookedRepo;
import com.demo.flight.demo_flight.Repo.FlightRepositorym;

import jakarta.transaction.Transactional;

@Service
public class FlightBookedService {

	private BookedRepo bookedRepo;
	
	private FlightRepositorym flightRepo;
	
	
	FlightBookedService(BookedRepo bookedRepo,FlightRepositorym flightRepo){
		this.bookedRepo=bookedRepo;
		this.flightRepo=flightRepo;
	}
	
	@Transactional
	public FlightBooked flightbooking(RequestDTO booked) {
	    
	    Flight flight = flightRepo.findById(booked.getFlightId())
	    		.orElseThrow(() -> new RuntimeException("Flight Not Found"));
	    
		
	    if (flight.getSeatsAvailable() < booked.getPassenger()) {
	        throw new RuntimeException("Not enough seats available. Only " + 
	            flight.getSeatsAvailable() + " seats remaining");
	    }
	    
	    // 3. Create and populate the booking
	    FlightBooked flightBooked = new FlightBooked();
	    flightBooked.setFlight(flight);
	    flightBooked.setStatus(flightBooked.getStatus());
	    flightBooked.setPassenger(booked.getPassenger());
	    flightBooked.setPassengerName(booked.getPassengerName());
	    flightBooked.setPassengerName2(booked.getPassengerName2());
	    flightBooked.setPassengerAdult(booked.getPassengerAdult());
	    flightBooked.setPassengerAdult2(booked.getPassengerAdult2());
	    flightBooked.setDateOfBirth(booked.getDateOfBirth());
	    flightBooked.setDateOfBirth2(booked.getDateOfBirth2());
	    flightBooked.setContactNo(booked.getContactNo());
	    
	    return bookedRepo.save(flightBooked);
	}
	
	@Transactional
	public FlightBooked confirmBooking(Long bookedId,double amountPaid) {
		
		FlightBooked bookings= bookedRepo.findById(bookedId)
				.orElseThrow(()->new RuntimeException("Booking Id not Found"));
		
		Flight flight= bookings.getFlight();
		
		flight.setSeatsAvailable(flight.getSeatsAvailable() - bookings.getPassenger());
	    flight.setBookings(flight.getBookings() + bookings.getPassenger());
	    flightRepo.save(flight);
		
		bookings.setStatus(BookingStatus.CONFIRMED);
		
		 return bookedRepo.save(bookings);
	}
	
	
	public void deleteFlightBooking(Long id){

		FlightBooked booked= bookedRepo.findById(id).orElseThrow(()->new RuntimeException("Not Found"));
		 Flight flight = booked.getFlight();
		  

		 flight.setSeatsAvailable(flight.getSeatsAvailable() + booked.getPassenger());
		 flight.setBookings(flight.getBookings() - booked.getPassenger());
		 // Save the updated flight back to the repository
		 
		flightRepo.save(flight);
		bookedRepo.deleteById(id);
	}
	
	
	public ResponseEntity<FlightBooked> showTicket(Long id){
		Optional<FlightBooked> booked= bookedRepo.findById(id);
		return ResponseEntity.of(booked);
	}
	
	public List<FlightBooked> getAllBookings() {
		return bookedRepo.findAll();
	}
	
	public FlightBooked getBookingById(Long id) {
		FlightBooked booked= bookedRepo.findById(id).orElseThrow(()->new RuntimeException("Not Found"));
		
		return booked;
	}
}
