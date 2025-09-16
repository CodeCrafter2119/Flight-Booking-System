package com.demo.flight.demo_flight.flightAiService;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@Profile("aws") // This service will only be active when 'aws' profile is active
public class MockFlightAiService {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final Logger logger = LoggerFactory.getLogger(MockFlightAiService.class);
    
    public String getFlightDetails(String userQuery) {
        try {
            logger.info("Processing AI query: {}", userQuery);
            
            Map<String, String> response = new HashMap<>();
            
            // Default values (same as Ollama)
            response.put("departureFrom", "any");
            response.put("arrivalTo", "any");
            
            // Parse query exactly like Ollama would
            parseQueryLikeOllama(userQuery, response);
            
            logger.info("AI response: {}", response);
            return objectMapper.writeValueAsString(response);
            
        } catch (Exception e) {
            logger.error("Error in AI service: {}", e.getMessage(), e);
            
            // Return the exact same format as Ollama on error
            try {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("departureFrom", "any");
                errorResponse.put("arrivalTo", "any");
                return objectMapper.writeValueAsString(errorResponse);
            } catch (JsonProcessingException ex) {
                return "{\"departureFrom\":\"any\",\"arrivalTo\":\"any\"}";
            }
        }
    }
    
    private void parseQueryLikeOllama(String userQuery, Map<String, String> response) {
        if (userQuery == null || userQuery.trim().isEmpty()) {
            return;
        }
        
        String lowerQuery = userQuery.toLowerCase().trim();
        
        // Exact same parsing logic as described in your Ollama prompt
        if (lowerQuery.contains(" to ")) {
            String[] parts = lowerQuery.split(" to ");
            if (parts.length == 2) {
                String fromPart = parts[0].replace("from", "").replace("flights", "").trim();
                String toPart = parts[1].trim();
                
                if (!fromPart.isEmpty() && !fromPart.equals("flight")) {
                    response.put("departureFrom", cleanCityName(fromPart));
                }
                response.put("arrivalTo", cleanCityName(toPart));
            }
        } 
        else if (lowerQuery.startsWith("to ")) {
            String destination = lowerQuery.substring(3).trim();
            response.put("arrivalTo", cleanCityName(destination));
        }
        else if (lowerQuery.startsWith("from ")) {
            String origin = lowerQuery.substring(5).trim();
            response.put("departureFrom", cleanCityName(origin));
        }
        else if (lowerQuery.contains("from ") && lowerQuery.contains(" to ")) {
            // Handle "flights from X to Y" pattern
            String fromPart = lowerQuery.split(" from ")[1].split(" to ")[0].trim();
            String toPart = lowerQuery.split(" to ")[1].trim();
            response.put("departureFrom", cleanCityName(fromPart));
            response.put("arrivalTo", cleanCityName(toPart));
        }
        else {
            // For simple queries like "chennai" or "flight chennai"
            String cleanQuery = lowerQuery.replace("flights", "")
                                        .replace("flight", "")
                                        .replace("show", "")
                                        .replace("me", "")
                                        .replace("a", "")
                                        .trim();
            
            if (!cleanQuery.isEmpty() && !cleanQuery.equals("to") && !cleanQuery.equals("from")) {
                response.put("arrivalTo", cleanCityName(cleanQuery));
            }
        }
    }
    
    private String cleanCityName(String city) {
        if (city == null || city.isEmpty()) {
            return "any";
        }
        
        // Remove any non-letter characters except spaces
        city = city.replaceAll("[^a-zA-Z\\s]", "").trim();
        
        // Common city name mappings (case-sensitive like Ollama)
        Map<String, String> cityMappings = new HashMap<>();
        cityMappings.put("delhi", "delhi");
        cityMappings.put("chennai", "chennai");
        cityMappings.put("mumbai", "mumbai");
        cityMappings.put("kolkata", "kolkata");
        cityMappings.put("bangalore", "bangalore");
        cityMappings.put("hyderabad", "hyderabad");
        cityMappings.put("ahmedabad", "ahmedabad");
        cityMappings.put("pune", "pune");
        cityMappings.put("jaipur", "jaipur");
        cityMappings.put("kochi", "kochi");
        cityMappings.put("goa", "goa");
        
        // Return mapped city name or original (Ollama keeps case as-is)
        return cityMappings.getOrDefault(city.toLowerCase(), city);
    }
}