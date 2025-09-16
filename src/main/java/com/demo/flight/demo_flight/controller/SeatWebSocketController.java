package com.demo.flight.demo_flight.controller;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.stereotype.Controller;

import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Controller
public class SeatWebSocketController {
    
    // In-memory storage for unavailable seats (replace with database in production)
    private final ConcurrentHashMap<Long, Set<Long>> flightUnavailableSeats = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Set<Long>> userReservedSeats = new ConcurrentHashMap<>();
    
    
    //demo websocket
//    @MessageMapping("/sendMessage")
//    @SendTo("/topic/notifications")
//    public String sendingMessage(String message) {
//    	System.out.println("Message :" +message);
//    	return message;
//    }
 // Add this method to handle initial connection and subscription
    @SubscribeMapping("/topic/flight/{flightId}/seats")
    public Set<Long> handleSubscription(@DestinationVariable Long flightId) {
        System.out.println("Client subscribed to flight: " + flightId);
        return flightUnavailableSeats.getOrDefault(flightId, new HashSet<>());
    }
    
    @MessageMapping("/flight/{flightId}/seats")
    @SendTo("/topic/flight/{flightId}/seats")
    public Set<Long> getUnavailableSeats(@DestinationVariable Long flightId) {
        System.out.println("Client requested seats for flight: " + flightId);
        return flightUnavailableSeats.getOrDefault(flightId, new HashSet<>());
    }

    // Reserve a seat temporarily
    @MessageMapping("/reserve-seat")
    @SendTo("/topic/flight/{flightId}/seats")
    public Set<Long> reserveSeat(SeatReservationRequest request) {
        System.out.println("Reserving seat: " + request.getSeatNumber() + " for flight: " + request.getFlightId());
        
        Long flightId = request.getFlightId();
        Long seatNumber = request.getSeatNumber();
        String userId = request.getUserId();

        // Initialize if not exists
        flightUnavailableSeats.putIfAbsent(flightId, new HashSet<>());
        userReservedSeats.putIfAbsent(userId, new HashSet<>());

        // Add to unavailable seats
        flightUnavailableSeats.get(flightId).add(seatNumber);
        userReservedSeats.get(userId).add(seatNumber);

        // Return updated unavailable seats
        return flightUnavailableSeats.get(flightId);
    }

    // Release a seat reservation
    @MessageMapping("/release-seat")
    @SendTo("/topic/flight/{flightId}/seats")
    public Set<Long> releaseSeat(SeatReservationRequest request) {
        System.out.println("Releasing seat: " + request.getSeatNumber() + " for flight: " + request.getFlightId());
        
        Long flightId = request.getFlightId();
        Long seatNumber = request.getSeatNumber();
        String userId = request.getUserId();

        // Remove from unavailable seats if this user reserved it
        if (flightUnavailableSeats.containsKey(flightId) && 
            userReservedSeats.containsKey(userId) && 
            userReservedSeats.get(userId).contains(seatNumber)) {
            
            flightUnavailableSeats.get(flightId).remove(seatNumber);
            userReservedSeats.get(userId).remove(seatNumber);
        }

        // Return updated unavailable seats
        return flightUnavailableSeats.getOrDefault(flightId, new HashSet<>());
    }

    public static class SeatReservationRequest {
        private Long flightId;
        private Long seatNumber;
        private String userId;

        // Getters and setters
        public Long getFlightId() { return flightId; }
        public void setFlightId(Long flightId) { this.flightId = flightId; }

        public Long getSeatNumber() { return seatNumber; }
        public void setSeatNumber(Long seatNumber) { this.seatNumber = seatNumber; }

        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
    }
}