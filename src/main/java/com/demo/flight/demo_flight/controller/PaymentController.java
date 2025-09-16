package com.demo.flight.demo_flight.controller;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.demo.flight.demo_flight.PaymentClass;
import com.demo.flight.demo_flight.DTO.PaymentConfirmationDTO;
import com.demo.flight.demo_flight.DTO.PaymentDTO;
import com.demo.flight.demo_flight.DTO.PaymentRequestDTO;
import com.demo.flight.demo_flight.DTO.PaymentResponseDTO;
import com.demo.flight.demo_flight.Repo.PaymentRepo;
import com.demo.flight.demo_flight.services.PaymentServices;
import com.razorpay.RazorpayException;

@RestController
@RequestMapping("/payment")
public class PaymentController {

	@Autowired
	private PaymentServices services;
	
	Logger log = LoggerFactory.getLogger(PaymentController.class);
	
	
	@PostMapping
	public ResponseEntity<?> makePayment(@RequestBody PaymentDTO paymentClass){
		return ResponseEntity.status(HttpStatus.CREATED).body(services.makePayment(paymentClass));
	}
	
	@PostMapping("/booking")
	public ResponseEntity<PaymentResponseDTO> paymentBooking(
			@RequestBody PaymentRequestDTO paymentInfo) throws RazorpayException{
		
		return ResponseEntity.status(HttpStatus.CREATED).body(services.initiatePayment(paymentInfo)) ;
	}
	
	// For testing without actual payment
	@PostMapping("/confirm-booking")
	public ResponseEntity<?> testConfirmBooking(@RequestBody PaymentConfirmationDTO razorpayOrderId) {
	    services.confirmPayment(
	    		razorpayOrderId.getOrderId(), 
	    		razorpayOrderId.getPaymentId(),
	    		razorpayOrderId.getSignature());
	    
	    return ResponseEntity.ok().build();
	    
	}
	
	@PostMapping("/web-callback")
	public ResponseEntity<Void> paymentCallBackWebhook(@RequestBody(required = false) Map<String,Object> payload){
		
		log.info("Hook Called");
//		log.info(payload);
		
		Map<String ,Object> payload1 = (Map<String, Object>) payload.get("payload");
		Map<String ,Object> payment = (Map<String, Object>) payload1.get("payment");
		Map<String ,Object> entity = (Map<String, Object>) payment.get("entity");
		
		String orderId= (String)entity.get("order_id");
		String status= (String)entity.get("status");
		
		log.info("OrderId {}", orderId);
		log.info("Status {}",status);
		
		return new ResponseEntity<>(null,HttpStatus.OK);
	}
	
}
