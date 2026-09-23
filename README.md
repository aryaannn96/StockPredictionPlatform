# 📈 StockPredict AI

A full-stack machine learning web application that analyzes historical stock-market data and predicts the next expected stock price using a Random Forest regression model.

The platform provides stock predictions, historical price visualization, AI-generated BUY/SELL/HOLD signals, model evaluation metrics, and feature importance through a modern interactive dashboard.

---

## 🚀 Features

- 📊 Stock price prediction
- 📈 Historical stock price visualization
- 🤖 Random Forest machine learning model
- 🧠 Technical-indicator-based prediction
- 📌 BUY / SELL / HOLD signals
- 🎯 Prediction confidence
- 📉 MAE and RMSE model evaluation
- 🔍 Feature importance analysis
- 🔄 Refreshable stock analysis
- 🌐 Full-stack React dashboard
- ☕ Spring Boot REST API
- 🐍 Flask-based ML service
- 🗄️ PostgreSQL database integration
- 📡 Yahoo Finance historical market data

---

## 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │      React UI        │
                    │   Stock Dashboard    │
                    └──────────┬───────────┘
                               │
                               │ REST API
                               ▼
                    ┌──────────────────────┐
                    │    Spring Boot       │
                    │     Backend          │
                    └──────────┬───────────┘
                               │
                               │ HTTP
                               ▼
                    ┌──────────────────────┐
                    │     Flask ML         │
                    │      Service         │
                    └──────────┬───────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
                    ▼                     ▼
          ┌─────────────────┐   ┌──────────────────┐
          │  Yahoo Finance  │   │ Random Forest    │
          │ Historical Data │   │ Prediction Model │
          └─────────────────┘   └──────────────────┘


🛠️ Technologies Used
Frontend
React
Vite
JavaScript
CSS
Lucide React
Backend
Java
Spring Boot
Spring Web
Spring Data JPA
Maven
Machine Learning
Python
Flask
Scikit-learn
Pandas
NumPy
Random Forest Regressor
Database
PostgreSQL
Data Source
Yahoo Finance
Development Tools
Visual Studio Code
Git
GitHub
🧠 Machine Learning

The application uses a Random Forest Regression model to predict the expected next stock price.

Features Used

The model uses historical price and technical-indicator data including:

Open
High
Low
Close
Volume
SMA 20
SMA 50
EMA 20
RSI
MACD
MACD Signal
Daily Return
Volatility
Volume SMA 20
📊 Technical Indicators
SMA

Simple Moving Average is used to identify the average stock price over a specific period.

The project uses:

SMA 20
SMA 50
EMA

Exponential Moving Average gives greater importance to recent prices.

The project uses:

EMA 20
RSI

Relative Strength Index is a momentum indicator used to identify potential overbought or oversold conditions.

MACD

Moving Average Convergence Divergence is used to analyze momentum and trend direction.

Volatility

Historical price variation is used as an additional feature for the machine learning model.

🤖 Prediction Workflow
Stock Symbol
     │
     ▼
Fetch Historical Data
     │
     ▼
Data Preprocessing
     │
     ▼
Calculate Technical Indicators
     │
     ▼
Create ML Features
     │
     ▼
Train Random Forest Model
     │
     ▼
Predict Future Return
     │
     ▼
Calculate Expected Price
     │
     ▼
Generate BUY / SELL / HOLD Signal
     │
     ▼
Display Results in React Dashboard
📈 Model Evaluation

The model is evaluated using:

MAE

Mean Absolute Error measures the average absolute difference between actual and predicted prices.

RMSE

Root Mean Squared Error gives greater weight to larger prediction errors.

The application displays these evaluation metrics directly in the dashboard.

📡 API Endpoints
Spring Boot
Endpoint	Description
/api/predictions/{symbol}	Get stock prediction
/api/history/{symbol}	Get historical stock data
/api/evaluate/{symbol}	Evaluate ML model
/api/signals/{symbol}	Get trading signal
Flask ML Service
Endpoint	Description
/	ML service information
/health	Health check
/predict/{symbol}	Generate prediction
/history/{symbol}	Retrieve historical data
/evaluate/{symbol}	Evaluate model
/signal/{symbol}	Generate BUY/SELL/HOLD signal

📁 Project Structure
StockPredictionPlatform/
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── stock_prediction_backend/
│   │   │   │       ├── controller/
│   │   │   │       ├── entity/
│   │   │   │       ├── repository/
│   │   │   │       └── service/
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   ├── pom.xml
│   └── mvnw.cmd
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── ml-service/
│   ├── app.py
│   ├── model.py
│   ├── predictor.py
│   ├── data_fetcher.py
│   └── data_preprocessor.py
│
├── .gitignore
└── README.md


⚙️ Installation
1. Clone the repository
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd StockPredictionPlatform
2. Frontend Setup
cd frontend
npm install

Start the frontend:

npm run dev

The frontend runs on:

http://localhost:5173
3. Backend Setup

Open another terminal:

cd backend

Set the PostgreSQL password as an environment variable.

PowerShell:

$env:DB_PASSWORD="YOUR_DATABASE_PASSWORD"

Start Spring Boot:

.\mvnw.cmd spring-boot:run

Backend:

http://localhost:8080
4. ML Service Setup

Open another terminal:

cd ml-service

Create a virtual environment:

python -m venv venv

Activate it on Windows:

.\venv\Scripts\activate

Install dependencies:

pip install flask flask-cors pandas numpy scikit-learn yfinance

Start the ML service:

python app.py

ML service:

http://127.0.0.1:5000
🔐 Database Configuration

The backend uses PostgreSQL.

Database configuration is supplied through environment variables so database credentials are not stored directly in the repository.

Example:

$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="YOUR_DATABASE_PASSWORD"

Database:

stock_prediction_db
▶️ Running the Complete Application

Three services need to be running.

Terminal 1 — ML Service
cd ml-service
.\venv\Scripts\activate
python app.py
Terminal 2 — Spring Boot
cd backend
.\mvnw.cmd spring-boot:run
Terminal 3 — React
cd frontend
npm run dev

Open:

http://localhost:5173
🔄 Application Flow

When a user searches for a stock:

User enters AAPL
       ↓
React sends request
       ↓
Spring Boot receives request
       ↓
Spring Boot calls Flask
       ↓
Flask fetches historical stock data
       ↓
Technical indicators are calculated
       ↓
Random Forest model processes features
       ↓
Prediction is generated
       ↓
BUY / SELL / HOLD signal is calculated
       ↓
Result returned through Spring Boot
       ↓
React displays the dashboard
⚠️ Disclaimer

This project is developed for educational and demonstration purposes.

Stock-market predictions generated by machine learning models are estimates and should not be considered financial advice or guaranteed future prices.

🔮 Future Enhancements

Possible future improvements include:

LSTM / GRU deep-learning models
More machine learning algorithms
Real-time market data
Portfolio tracking
User authentication
Personalized watchlists
Advanced technical indicators
News and sentiment analysis
Model comparison
Cloud deployment
Automated model retraining


👨‍💻 Author

Aryan
B.Tech Computer Science Engineering

⭐ Project Goal

The goal of StockPredict AI is to demonstrate how modern full-stack development and machine learning can be combined to build an interactive financial-data analysis platform.