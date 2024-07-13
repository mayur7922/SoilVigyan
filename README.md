# Real Time Soil Monitoring
## Overview
This project aims to assist farmers by analysing the real time soil data (such as Nitrogen, Phosphorous, Potassium, pH level and Humidity) and providing actionable recommendations to farmers for optimizing crop yield and overall farm field management.

## Features
### Real Time Soil Monitoring
- Analysing the values from the field of the farmer.
- Recommending suitable fertilizers and cycles of there use.
- Recommendation on water management and irrigation cycles.
- Suggestions on pest management.
- Suggestions on soil health and crop rotation.

### Real-time weather updates
- Notifying farmers about upcoming weather events including excessive rains and natural disasters, using OpenWeatherMap WebSocket API.

### Marketplace Integration
- Direct Farmer-Buyer Connection: Connect farmers with potential buyers through a marketplace.
- Stock Purchase: Buyers can purchase crop stocks directly through the platform.
  
### Government Scheme Notifications
- Timely Updates: Notifying about the latest government schemes related to agriculture.

### Crop stages roadmap 
- Providing step by step information about the cultivation process from presowing to harvesting stages.

## Flow of Data
![Dataflow image](https://github.com/mayur7922/SoilVigyan/blob/main/dataflow.png)

## Technologies Used
- Frontend: HTML, CSS, Bootstrap, JavaScript
- Backend: Node.js, Express.js, MongoDB streams, Web Sockets, Weather API
- Database: MongoDB Atlas
  
## Getting Started
- Clone the repository: git clone https://github.com/your-username/your-repository.git
- Install dependencies: npm install
- Set up MongoDB Atlas and obtain API keys for weather data.
- Configure environmental variables.
- Run the application: npm start
