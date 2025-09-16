package com.demo.flight.demo_flight.DTO;

import lombok.Data;

@Data
public class PaymentDTO {

	private Long paymentAmount;
	
	private Long flightId;
}
