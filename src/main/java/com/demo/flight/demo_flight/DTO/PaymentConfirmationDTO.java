package com.demo.flight.demo_flight.DTO;

import javax.validation.constraints.NotNull;

import lombok.Data;

@Data
public class PaymentConfirmationDTO {

	@NotNull
	String orderId;
	@NotNull
	String paymentId;
	@NotNull
	String signature;
}
