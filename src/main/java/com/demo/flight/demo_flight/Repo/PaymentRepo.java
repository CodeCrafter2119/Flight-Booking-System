package com.demo.flight.demo_flight.Repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.demo.flight.demo_flight.PaymentClass;

@Repository
public interface PaymentRepo extends JpaRepository<PaymentClass, Long> {

     PaymentClass findByFlightId(Long flightId);
     
     PaymentClass findByRazorpayOrderId(String orderId);
}
