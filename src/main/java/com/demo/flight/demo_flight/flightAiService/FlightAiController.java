package com.demo.flight.demo_flight.flightAiService;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class FlightAiController {

	@Autowired
	private FlightAiService flightAiService;

	@GetMapping("/assist")
    public String getFlightDetails(@RequestParam String q) {
        return flightAiService.getFlightDetails(q);
    }
    
    // KEEP: Support path variable for backward compatibility
    @GetMapping("/assist/{userQuery}")
    public String getFlightDetailsPath(@PathVariable String userQuery) {
        try {
            String decodedQuery = URLDecoder.decode(userQuery, StandardCharsets.UTF_8.toString());
            return flightAiService.getFlightDetails(decodedQuery);
        } catch (Exception e) {
            return "{\"departureFrom\":\"any\",\"arrivalTo\":\"any\",\"status\":\"error\"}";
        }
    }


}
