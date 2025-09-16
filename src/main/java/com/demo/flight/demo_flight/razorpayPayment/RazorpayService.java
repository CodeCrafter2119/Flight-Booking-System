package com.demo.flight.demo_flight.razorpayPayment;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

import org.apache.commons.codec.digest.HmacUtils;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;

import lombok.Data;

@Service
@Data
public class RazorpayService {
	
	private static final Logger log = LoggerFactory.getLogger(RazorpayService.class);

	@Value("${razorpay.key.id}")
	private String razorpayKeyId;
	
	@Value("${razorpay.key.secret}")
	private String razorpayKeySecret;
	
	public String createOrder(double amount, String currency,String receipt) throws RazorpayException {
		
		RazorpayClient razorpayClient= new RazorpayClient(razorpayKeyId,razorpayKeySecret);
		
		JSONObject orderRequest = new JSONObject();
		orderRequest.put("amount", amount * 100);
		orderRequest.put("currency", currency);
		orderRequest.put("receipt", receipt);
		orderRequest.put("payment_capture", 1);
		
		Order order = razorpayClient.orders.create(orderRequest);
		
		return order.get("id");
		
	}
	
	@SuppressWarnings("deprecation")
	public boolean verifyPayment(String paymentId, String orderId, String razorpaySignature) {
	    // Input validation
	    if (paymentId == null || orderId == null || razorpaySignature == null) {
	        throw new IllegalArgumentException("Payment verification parameters cannot be null");
	    }

	    // Log received values
	    log.info("Received - orderId: {}, paymentId: {}, signature: {}", orderId, paymentId, razorpaySignature);

	    String generatedSignature = HmacUtils.hmacSha256Hex(
	            razorpayKeySecret,
	            orderId + "|" + paymentId
	        );
        	    
	        log.info("signature: {}",  generatedSignature);
	        return generatedSignature.equals(razorpaySignature);

	    // Log generated values

	}
	
//	@SuppressWarnings("deprecation")
//	public boolean verifyPayment(String paymentId, String orderId, String razorpaySignature) {
//	    // TEMPORARY TESTING OVERRIDE
//	    if ("Daha1_Kungur_Basumatary".equals(razorpaySignature)) {
//	        log.warn("Accepting test signature for development");
//	        return true;
//	    }
//	    
//	    // Original verification logic
//	    String payload = orderId + "|" + paymentId;
//	    String generatedSignature = HmacUtils.hmacSha256Hex(razorpayKeySecret, payload);
//	    
//	    return MessageDigest.isEqual(
//	        generatedSignature.getBytes(StandardCharsets.UTF_8),
//	        razorpaySignature.getBytes(StandardCharsets.UTF_8)
//	    );
//	}
}
