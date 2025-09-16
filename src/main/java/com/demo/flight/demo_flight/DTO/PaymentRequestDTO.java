package com.demo.flight.demo_flight.DTO;


import lombok.Data;

@Data
public class PaymentRequestDTO {

	private double amount;
	
    private	String currency;
	
	private Long bookingId;
	
	private Long flightId;
	
	private String method ;
}
