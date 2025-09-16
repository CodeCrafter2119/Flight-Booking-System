package com.demo.flight.demo_flight;

import java.time.LocalDate;
import java.time.LocalTime;

import javax.validation.constraints.Min;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "flight")
public class Flight {
    
	@Id
	@GeneratedValue
	private Long id;
	
	private String departureFrom;
	
	private String arrivalTo;
	
	private LocalDate departure;
	
	private LocalTime departureTime;
	
	private LocalDate returnDate;
    
	@Column(name = "seats_available")
	@Min(value = 1, message = "Seats available must be at least 1")
	private int seatsAvailable;
	
	private int bookings;
	
	@Column(nullable = false)
	@Min(value = 0, message="price cannot be negative")
	private double price;
	
	
}
