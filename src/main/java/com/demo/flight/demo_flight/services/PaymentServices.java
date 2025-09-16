package com.demo.flight.demo_flight.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.demo.flight.demo_flight.Flight;
import com.demo.flight.demo_flight.FlightBooked;
import com.demo.flight.demo_flight.FlightBooked.BookingStatus;
import com.demo.flight.demo_flight.PaymentClass;
import com.demo.flight.demo_flight.PaymentClass.PaymentStatus;
import com.demo.flight.demo_flight.DTO.PaymentDTO;
import com.demo.flight.demo_flight.DTO.PaymentRequestDTO;
import com.demo.flight.demo_flight.DTO.PaymentResponseDTO;
import com.demo.flight.demo_flight.Repo.FlightRepositorym;
import com.demo.flight.demo_flight.Repo.PaymentRepo;
import com.demo.flight.demo_flight.razorpayPayment.RazorpayService;
import com.razorpay.RazorpayException;

import jakarta.transaction.Transactional;

@Service
public class PaymentServices {

	@Autowired
	private PaymentRepo paymentRepo;
	
	@Autowired
	private RazorpayService razorpayService;
	
	@Autowired
	private FlightRepositorym flightRepo;
	
	@Autowired
	private FlightBookedService bookedService;
	

	//only for admin ,for adding flight prices
	@Transactional
	public PaymentClass makePayment(PaymentDTO payment) {  
		Flight flight =  flightRepo.findById(payment.getFlightId())
				.orElseThrow(()-> new RuntimeException("Flight not found"));
		
		PaymentClass payment2 = new PaymentClass();
		payment2.setAmount(payment.getPaymentAmount());
		payment2.setFlight(flight);
		return paymentRepo.save(payment2);
	}
	
	//for payment
	public PaymentResponseDTO initiatePayment(PaymentRequestDTO request) throws RazorpayException {
		
		String orderId =  razorpayService.createOrder(
				request.getAmount(),
				"INR",
				"FlightBooking_" + request.getBookingId()
				);
		
		Flight flight= flightRepo.findById(request.getFlightId()).orElseThrow(
				()->new RuntimeException("Flight Not found -->"+request.getFlightId()));
		
		
		PaymentClass payment= new PaymentClass();
		payment.setAmount(request.getAmount());
		payment.setStatus(payment.getStatus());
		payment.setCurrency(request.getCurrency());
		payment.setMethod(request.getMethod());
		payment.setFlight(flight);
		payment.setRazorpayOrderId(orderId);
		payment.setBooking(bookedService.getBookingById(request.getBookingId()));
		
		paymentRepo.save(payment);
		
		return new PaymentResponseDTO(
				orderId,
				razorpayService.getRazorpayKeyId(),
				request.getAmount(),
				request.getMethod(),
				"INR"
				);
	}
	
	//for payment confirmation
	@Transactional
	public void confirmPayment(String orderId,String paymentId,String signature) {
		
		if(!razorpayService.verifyPayment(paymentId, orderId, signature)) {
			throw new RuntimeException("Payment verification failed");
		}
		
		PaymentClass payment = paymentRepo.findByRazorpayOrderId(orderId);
		
		payment.setRazorpayPaymentId(paymentId);
		payment.setStatus(PaymentStatus.PAID);
		paymentRepo.save(payment);
		
		bookedService.confirmBooking(
                payment.getBooking().getId(),
                payment.getAmount());
	}
	
}
