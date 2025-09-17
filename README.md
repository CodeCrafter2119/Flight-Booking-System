# FlightEase - Complete Flight Booking System with Real-time Seat Selection

1.✈️ Real-time seat booking • Secure payments • AI-powered travel assistant

2.🚀 Spring Boot + React flight booking system with WebSockets & Razorpay integration

3.☁️ Cloud-ready flight reservation system with real-time capabilities and AI features

4.🔐 Secure JWT authentication • Live seat mapping • Payment processing • AWS Deployable

✅ Real-time WebSocket seat selection  
✅ Docker (development : mysql) 
✅ Razorpay payment integration  
✅ Ollama AI travel assistant (development)  
✅ Mock AI travel assistant (AWS deployment)  
✅ JWT OAuth2 security  
✅ React frontend + Spring Boot backend  
✅ MySQL database with optimized queries  
✅ AWS Elastic Beanstalk deployment ready(For Backend and Database)   
✅ AWS S3 (For frontend) 
✅ Multi-role system (Admin + User)  

   baseURL : http://Flight-booking-system-env.eba-utt8xhke.ap-south-1.elasticbeanstalk.com   

# Project structure  
demo-flight/  
└── src/main/java/com/demo/flight/demo_flight/  
    ├── 📄 Admin.java  
    ├── 📄 DemoFlightApplication.java  
    ├── 📄 Flight.java  
    ├── 📄 FlightBooked.java  
    ├── 📄 PaymentClass.java  
    ├── 📄 SeatUpdate.java  
    ├── 📄 UserClass.java  
    ├── 📂 controller/  
    │   ├── 📄 BookedController.java  
    │   ├── 📄 FlightController.java  
    │   ├── 📄 PaymentController.java  
    │   └── 📄 SeatWebSocketController.java  
    ├── 📂 DTO/  
    │   ├── 📄 PaymentConfirmationDTO.java  
    │   ├── 📄 PaymentDTO.java  
    │   ├── 📄 PaymentRequestDTO.java  
    │   └── 📄 PaymentResponseDTO.java  
    ├── 📂 flightAiService/  
    │   ├── 📄 FlightAIController.java  
    │   ├── 📄 FlightAiService.java  
    │   ├── 📄 FlightAiServletInterface.java  
    │   └── 📄 MockFlightAiService.java  
    ├── 📂 razorpayPayment/  
    │   └── 📄 RazorpayService.java  
    ├── 📂 Repo/  
    │   ├── 📄 AdminRepository.java  
    │   ├── 📄 BookedRepo.java  
    │   ├── 📄 FlightRepositorym.java  
    │   ├── 📄 PaymentRepo.java  
    │   └── 📄 UserRepo.java  
    ├── 📂 security/  
    │   ├── 📄 AuthenticationConfig.java  
    │   ├── 📄 CustomAdminDetailsManager.java  
    │   ├── 📄 CustomUserDetailsManager.java  
    │   ├── 📄 SecurityConfig.java  
    │   └── 📄 SecurityController.java  
    ├── 📂 services/  
    │   ├── 📄 FlightBookedService.java  
    │   ├── 📄 FlightsServices.java  
    │   ├── 📄 PaymentConfirmInfo.java  
    │   ├── 📄 PaymentServices.java  
    │   ├── 📄 RequestDTO.java  
    │   └── 📄 SeatBookingService.java  
    └── 📂 websocketSeat/  
        └── 📄 WebSocketConfig.java  



        
<img width="1917" height="990" alt="Screenshot 2025-09-16 005945" src="https://github.com/user-attachments/assets/a59a75a5-1761-416d-a498-160ead64ae5f" />
<img width="1920" height="1080" alt="Screenshot 2025-09-16 162206" src="https://github.com/user-attachments/assets/66fb623d-ebcd-499e-aed8-c8ad48a4e320" />
<img width="1920" height="1080" alt="Screenshot 2025-08-20 233705" src="https://github.com/user-attachments/assets/2dc2fa07-5b89-4382-81b0-12eae7035295" />
<img width="1919" height="1079" alt="Screenshot 2025-09-17 103532" src="https://github.com/user-attachments/assets/2a1ffc94-2cf9-4a53-a8bb-e3e40d6d5028" />
