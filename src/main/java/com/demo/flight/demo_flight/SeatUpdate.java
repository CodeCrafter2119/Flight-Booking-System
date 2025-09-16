package com.demo.flight.demo_flight;


public class SeatUpdate {

	private Long seatNumber;
	
	public Long getSeatNumber() {
		return seatNumber;
	}

	public void setSeatNumber(Long seatNumber) {
		this.seatNumber = seatNumber;
	}

	public Long getFlightId() {
		return flightId;
	}

	public void setFlightId(Long flightId) {
		this.flightId = flightId;
	}

	public Long getUserId() {
		return userId;
	}

	public void setUserId(Long userId) {
		this.userId = userId;
	}

	public String getSeatStatus() {
		return seatStatus;
	}

	public void setSeatStatus(String seatStatus) {
		this.seatStatus = seatStatus;
	}

	public long getTimeStamp() {
		return timeStamp;
	}

	public void setTimeStamp(long timeStamp) {
		this.timeStamp = timeStamp;
	}

	
	public SeatUpdate() {
		super();
		// TODO Auto-generated constructor stub
	}

	public SeatUpdate(Long seatNumber, Long flightId, Long userId, String seatStatus, long timeStamp) {
		super();
		this.seatNumber = seatNumber;
		this.flightId = flightId;
		this.userId = userId;
		this.seatStatus = seatStatus;
		this.timeStamp = timeStamp;
	}


	private Long flightId;
	
	private Long userId;
	
	private String seatStatus;
	
	private long timeStamp;
	
}
