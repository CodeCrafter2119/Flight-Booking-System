//package com.demo.flight.demo_flight.services;
//
//import java.io.ObjectInputFilter.Status;
//import java.util.HashMap;
//import java.util.HashSet;
//import java.util.List;
//import java.util.Map;
//import java.util.Set;
//import java.util.concurrent.ConcurrentHashMap;
//
//import org.springframework.messaging.simp.SimpMessagingTemplate;
//import org.springframework.stereotype.Service;
//
//import com.demo.flight.demo_flight.FlightBooked;
//import com.demo.flight.demo_flight.FlightBooked.BookingStatus;
//import com.demo.flight.demo_flight.SeatUpdate;
//
//@Service
//public class SeatBookingService {
// 
//	private final SimpMessagingTemplate messagingTemplate;
//	private final FlightsServices flightsServices;
//	
//	private final Map<Long , Set<Long>> temporaryReserved = new ConcurrentHashMap();
//	private final Map<Long , Map<Long , Long>> seatReservedByUser = new ConcurrentHashMap();
//	
//	public SeatBookingService(FlightsServices flightsServices,SimpMessagingTemplate messagingTemplate) {
//		this.messagingTemplate = messagingTemplate;
//		this.flightsServices = flightsServices;
//	}
//	
//      //for Unavailable Seats
//	public Set<Long> getUnavailableSeats(Long flightId) {
//		
//		Set<Long> unavailableSeats =  new HashSet<>();
//	
//	    List<FlightBooked> bookings = flightsServices.findAllBookingsByFlightId(flightId);
//	
//	    for(FlightBooked booking : bookings) {
//		   if(booking.getStatus() == BookingStatus.CONFIRMED) {
//			   unavailableSeats.addAll(booking.getSeatNumber());
//		   }
//	   }
//	    
//	    Set<Long> reserved = temporaryReserved.get(flightId);
//	    if(reserved != null) {
//	    	unavailableSeats.addAll(reserved);
//	    }
//	    
//	    return unavailableSeats;
//	}
//	
//	//for temporary reserved
//	public boolean reservedSeatTemporarily(Long flightId,Long seatNumber,Long userId) {
//		synchronized (temporaryReserved) {
//			
//		
//		Set<Long> reserved = temporaryReserved.computeIfAbsent(flightId, k->ConcurrentHashMap.newKeySet());
//		
//		if(reserved.contains(seatNumber)) {
//			return false;
//		}
//		
//		reserved.add(seatNumber);
//		seatReservedByUser.computeIfAbsent(flightId, k -> new ConcurrentHashMap<>())
//                          .put(seatNumber, userId);
//		
//        notifySeatStatus(flightId, seatNumber, "RESERVED", userId);
//		
//		return true;
//		}
//	}
//	
//	public boolean releaseSeat(Long flightId, Long seatNumber, Long userId) {
//		
//		synchronized(temporaryReserved) {
//			Map<Long , Long> userReservation = seatReservedByUser.get(flightId);
//		
//			if(userReservation != null && userId.equals(userReservation.get(seatNumber))) {
//				Set<Long> reserved = temporaryReserved.get(flightId);
//				
//				if(reserved != null) {
//					reserved.remove(seatNumber);
//					userReservation.remove(seatNumber);
//					
//					
//					notifySeatStatus(flightId, seatNumber, "AVAILABLE", userId);
//                    return true;
//				}
//			}
//			
//			return false;
//		}
//		
//	}
//	
//	 // Convert temporary reservation to permanent booking
//    public void confirmSeatBooking(Long flightId, Long seatNumber, Long userId, Long bookingId) {
//        synchronized (temporaryReserved) {
//            // Remove from temporary reservations
//            Set<Long> reserved = temporaryReserved.get(flightId);
//            Map<Long, Long> userReservations = seatReservedByUser.get(flightId);
//            
//            if (reserved != null) reserved.remove(seatNumber);
//            if (userReservations != null) userReservations.remove(seatNumber);
//            
//            // Notify all clients
//            notifySeatStatus(flightId, seatNumber, "BOOKED", userId);
//        }
//    }
//	
//	
//	
//	//for notify to users
//	public void notifySeatStatus(Long flightId, Long seatNumber, String status, Long userId) {
//		SeatUpdate seatUpdate = new SeatUpdate(seatNumber, flightId, userId, status,System.currentTimeMillis());
//	
//		messagingTemplate.convertAndSend("/topic/flight/"+flightId+ "/seats" ,seatUpdate);
//	
//	}
//}
