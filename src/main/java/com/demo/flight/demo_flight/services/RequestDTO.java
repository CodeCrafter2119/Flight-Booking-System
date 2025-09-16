package com.demo.flight.demo_flight.services;

import java.time.LocalDate;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Past;

import com.demo.flight.demo_flight.PaymentClass;

import lombok.Data;

@Data
//@AllArgsConstructor
//@NoArgsConstructor
public class RequestDTO {

	 @NotNull(message = "Flight destination is required")
	    private Long flightId;

	    
	    private int passenger;
	    
	    private String passengerName;
	    
	    private String passengerName2;
	    
	    private String passengerAdult;
	    
	    private String passengerAdult2;
	    
	    @Past(message = "Date of birth must be in the past")
	    private LocalDate dateOfBirth;
	    
	    @Past(message = "Date of birth must be in the past")
	    private LocalDate dateOfBirth2;
	    
	    private String seatNumber;
	    
	    private Long contactNo;
	
}
