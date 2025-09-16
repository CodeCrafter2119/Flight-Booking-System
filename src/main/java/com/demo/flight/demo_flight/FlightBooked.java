package com.demo.flight.demo_flight;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
public class FlightBooked {

	@ManyToOne(fetch = FetchType.EAGER)  // Change from LAZY to EAGER
	@JoinColumn(name = "flight_id")
    private Flight flight;
	
	@OneToOne(mappedBy = "booking")
	@JoinColumn(name= "paymentStatus")
	private PaymentClass payment;
	
	@Enumerated(EnumType.STRING)
	private BookingStatus status= BookingStatus.PENDING;
	
	public enum BookingStatus{
		PENDING,
		CONFIRMED,
		CANCELLED
	}
	
	private Set<Long> seatNumber;
	
	@Id
	@GeneratedValue
	private Long id;
	private int passenger;
	private String passengerName;
	private String passengerName2;
    private String passengerAdult;
    private String passengerAdult2;
    private LocalDate dateOfBirth;
    private LocalDate dateOfBirth2;
    private Long contactNo;
    
}
