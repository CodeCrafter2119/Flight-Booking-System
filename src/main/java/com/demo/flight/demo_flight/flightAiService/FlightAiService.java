package com.demo.flight.demo_flight.flightAiService;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Profile("!aws")
public class FlightAiService {

    private final ChatClient chatClient;

    public FlightAiService(OllamaChatModel chatModel) {
        this.chatClient = ChatClient.create(chatModel);
    }

    public String getFlightDetails(String userQuery) {
        return chatClient.prompt()
            .user(u -> u.text("""
                    You are a flight search assistant. Respond with ONLY raw JSON containing:
                    - departureFrom (extract city/code, default "any")
                    - arrivalTo (extract city/code, default "any")
                    
                    Strict Rules:
                    1. Return pure JSON without markdown or formatting
                    2. For single location queries, use as arrivalTo
                    3. Keep airport codes as-is (don't expand to city names)
                    4. Never add explanations
                    5. Use simple city names without airports
                    6. Default to "any" for unspecified locations
                    
                    Query: {query}
                    
                    Examples:
                    - "to chennai" → {"departureFrom":"any","arrivalTo":"chennai"}
                    - "to Meghalaya" → {"departureFrom":"any","arrivalTo":"Meghalaya"}
                    - "from chennai" → {"departureFrom":"chennai","arrivalTo":"any"}
                    - "kolkata to chennai" → {"departureFrom":"kolkata","arrivalTo":"chennai"}
                    - "flights from kolkata" → {"departureFrom":"kolkata","arrivalTo":"any"}
                    """.replace("{query}", userQuery)))
            .call()
            .content();
    }
}