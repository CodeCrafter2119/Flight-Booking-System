package com.demo.flight.demo_flight;



import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
public class PaymentClass {

	@Id
	@GeneratedValue
	private Long payment_id;
	
	private double amount;
	
	private String razorpayOrderId;
	
	private String razorpayPaymentId;
	
	@ManyToOne(fetch = FetchType.EAGER) 
	private Flight flight;
	
	
	private String method;
	private String currency;
	
	@Enumerated(EnumType.STRING)
	private PaymentStatus status= PaymentStatus.PENDING;
	
	@OneToOne
	private FlightBooked booking;
	
	
	public enum PaymentStatus{
		PENDING,
		PAID,
		CANCELLED
	}
	
}
