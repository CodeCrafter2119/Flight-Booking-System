package com.demo.flight.demo_flight.DTO;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentResponseDTO {

	private String orderId;
	
	private String razorpayKeyId;
	
	private double amount;
	
	private String currency;
	
	private String method;
}
