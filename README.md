# Crop Monitoring Web Application
## Overview
Welcome to our Crop Monitoring Web Application! This project aims to assist farmers in monitoring the health of their crops throughout the entire cultivation process, from presowing to harvesting. By leveraging a combination of real-time data, machine learning models, and useful insights, our platform empowers farmers to make informed decisions for optimizing crop yield and overall farm management.

## Features
### Crop Health Monitoring
- Lifecycle Tracking: Monitor the health of crops from presowing to harvesting stages.
- Insights and Recommendations: Receive actionable insights on crop conditions and recommendations for necessary actions.
### Crop Recommendation System
- Machine Learning Model: Implemented a TensorFlow.js-powered machine learning model.
- Input Parameters: Utilize key factors such as nitrogen (n), phosphorus (p), potassium (k), humidity, and pH.
- Crop Suitability: Get personalized crop suggestions based on input parameters.
### Fertilizer Recommendation
- Customized Suggestions: Provide fertilizer recommendations based on crop type, considering nitrogen (n), phosphorus (p), and potassium (k) levels.
### Soil Monitoring
- Irrigation and Fertilizer Cycles: Track soil conditions and recommend optimal irrigation and fertilizer application cycles.
### Real-time Weather Forecast
- Weather API Integration: Access real-time weather data for accurate forecasts.
### Marketplace Integration
- Direct Farmer-Buyer Connection: Connect farmers with potential buyers through a marketplace.
- Stock Purchase: Buyers can purchase crop stocks directly through the platform.
### Government Scheme Notifications
- Timely Updates: Receive notifications about the latest government schemes related to agriculture.



## Crop Prediction Model

## Dataset
The data used to train the model was collected from the [Crop Prediction](https://www.kaggle.com/datasets/atharvaingle/crop-recommendation-dataset) dataset. 
The dataset consists of 2200 samples of 22 different crops whose predictions are made using 
7 features: nitrogen, phosphorus, potassium, and pH content of the soil, temperature, humidity and rainfall. 
The dataset is perfectly balanced, with each crop having 100 samples. 

## Model Architecture

The model consists of a single hidden layer with 10 units and ReLU activation. The output layer has a softmax activation function, suitable for multi-class classification.

## Technologies Used
- Frontend: HTML, CSS, Bootstrap, JavaScript
- Backend: Node.js, Express
- Database: Mongoose, MongoDB Atlas
- Machine Learning: TensorFlow.js
- Weather Data: Weather API
## Getting Started
- Clone the repository: git clone https://github.com/your-username/your-repository.git
- Install dependencies: npm install
- Set up MongoDB Atlas and obtain API keys for weather data.
- Configure environmental variables.
- Run the application: npm start
