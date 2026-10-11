# HealthPredict

AI-based **Diabetes and Heart Risk Prediction System**. Users sign up, enter a few basic health metrics, and get an instant risk assessment (probability + Low / Moderate / High level) from machine-learning models. Every prediction is saved, so users can review their history later.

> **Disclaimer:** This is an educational project. It is not a medical device and its output is not medical advice. Always consult a qualified doctor.

## Features

- Secure signup and login (bcrypt password hashing, JWT sessions that expire after 2 hours)
- Diabetes risk prediction (Pima Indians Diabetes dataset)
- Heart disease risk prediction (UCI Heart Disease dataset)
- Probability score with a Low / Moderate / High risk level
- Prediction history per user (last 20 results for each model)
- Server-side input validation with sane ranges for every medical field
- Animated, responsive UI (React, Tailwind CSS, GSAP)

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, Vite, React Router 7, Tailwind CSS 4, GSAP, Axios |
| Backend API | Node.js, Express 5, JWT, bcryptjs, mysql2 |
| Database | MySQL |
| ML service | Python, Flask, scikit-learn (Logistic Regression + StandardScaler), pandas, joblib |

## Architecture

```
React (Vite)  --->  Node/Express API  --->  Flask ML service
  :5173                :8080                    :5000
                         |
                         v
                       MySQL
```

1. The React app talks only to the Node API (with a JWT in the `Authorization` header).
2. The Node API verifies the token, forwards the inputs to the Flask service, saves the result in MySQL and returns it to the user.
3. The Flask service validates the inputs, runs the trained model and returns the prediction, probability and risk level.

## Project Structure

```
HealthPredict/
├── backend/
│   ├── server.js              # Express entry point
│   ├── routes/                # auth, predict, history
│   ├── models/                # MySQL tables and queries (auto-created on start)
│   ├── middleware/            # JWT authentication
│   ├── Ml-Model/              # Flask service + training scripts
│   │   ├── app.py
│   │   ├── train_diabetes.py
│   │   ├── train_heart.py
│   │   ├── data/              # diabetes.csv, heart.csv
│   │   └── *.pkl              # trained models
│   └── .env.example
└── frontend/
    └── src/
        ├── component/         # Home, Login, SignUp, Diabetes, Heart, History, About
        ├── extra/             # Navbar, particle background
        └── api/axios.js       # Axios instance with token interceptor
```

## Getting Started

### Prerequisites

- Node.js 18 or newer
- Python 3.9 or newer
- MySQL 8 (running locally)

### 1. Clone the repository

```bash
git clone https://github.com/aisyaabhash/HealthPredict.git
cd HealthPredict
```

### 2. Create the database

The tables are created automatically on the first server start, but the database itself must exist:

```sql
CREATE DATABASE healthpredict;
```

### 3. Start the ML service (Flask, port 5000)

```bash
cd backend/Ml-Model
python -m venv venv

# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
python app.py
```

Trained models (`diabetes_model.pkl`, `heart_model.pkl`) are already included. To retrain them, run `python train_diabetes.py` and `python train_heart.py` before starting the service. Open `http://localhost:5000/health` to see the loaded models and their metrics.

### 4. Start the backend (Node, port 8080)

```bash
cd backend
npm install
cp .env.example .env      # on Windows: copy .env.example .env
```

Fill in `backend/.env`:

| Variable | Description | Example |
| --- | --- | --- |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_USER` | MySQL user | `root` |
| `DB_PASSWORD` | MySQL password | `your_password` |
| `DB_NAME` | Database name | `healthpredict` |
| `PORT` | Node API port | `8080` |
| `FLASK_DIABETES_URL` | Flask diabetes endpoint | `http://localhost:5000/predict/diabetes` |
| `FLASK_HEART_URL` | Flask heart endpoint | `http://localhost:5000/predict/heart` |
| `JWT_SECRET` | Long random string used to sign tokens | `change-me-to-a-long-random-string` |

Then run:

```bash
npm start
```

### 5. Start the frontend (Vite, port 5173)

```bash
cd frontend
npm install
```

Create a file named `.env` inside `frontend/` that points to the **Node API** (not the Flask service):

```
VITE_API_URL=http://localhost:8080
```

Then run:

```bash
npm run dev
```

Open the URL printed by Vite (usually `http://localhost:5173`).

## API Reference

All `/api/predict` and `/api/history` routes need the header `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/signup` | Create an account (`username`, `password`, `confirmPassword`) |
| POST | `/api/auth/login` | Log in, returns a JWT |
| POST | `/api/predict/diabetes` | Predict diabetes risk and save the result |
| POST | `/api/predict/heart` | Predict heart disease risk and save the result |
| GET | `/api/history/diabetes` | Last 20 diabetes predictions of the user |
| GET | `/api/history/heart` | Last 20 heart predictions of the user |
| GET | `/health` | Node API health check |

### Model inputs

**Diabetes:** `Gender`, `Pregnancies`, `Glucose`, `BloodPressure`, `SkinThickness`, `Insulin`, `BMI`, `DiabetesPedigreeFunction`, `Age`

**Heart:** `Age`, `Gender`, `ChestPain` (0 to 3), `RestingBP`, `Cholesterol`, `FastingBloodSugar`, `MaxHeartRate`, `ExerciseAngina` (Yes / No), `Oldpeak`

### Response

```json
{
  "id": 12,
  "prediction": "Non-Diabetic",
  "probability": 23.4,
  "risk_level": "Low"
}
```

Risk levels: **High** at 60% or above, **Moderate** at 30% or above, otherwise **Low**. The final label (for example Diabetic / Non-Diabetic) switches at 50%.

## Machine Learning Notes

- **Model:** Logistic Regression inside a scikit-learn pipeline with `StandardScaler`.
- **Class imbalance:** `class_weight="balanced"` is used because, for a screening tool, missing a sick person (low recall) is worse than a false alarm.
- **Diabetes data cleaning:** zeros in Glucose, BloodPressure, SkinThickness, Insulin and BMI mean "not measured", so they are replaced with training-set medians (computed on the train split only, to avoid data leakage).
- **Heart data cleaning:** duplicate rows are removed before the train/test split so accuracy is not inflated.
- Accuracy, precision and recall are printed by the training scripts and exposed at the Flask `/health` endpoint.

## Future Improvements

- Deploy all three services (for example Vercel + Render + a managed MySQL)
- Add charts for prediction history
- Explainability: show which inputs pushed the risk up or down
- Unit and integration tests

## License

This project is for educational purposes.
