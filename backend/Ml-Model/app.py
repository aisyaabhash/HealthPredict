from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import joblib
import os
import pandas as pd

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, "..", "frontend")


def load_bundle(filename):
    """Load a saved model bundle, or None if it hasn't been trained yet."""
    path = os.path.join(BASE_DIR, filename)
    if not os.path.exists(path):
        print(f"[warn] {filename} not found - run its train script first")
        return None
    bundle = joblib.load(path)
    print(f"[ok] loaded {filename}: {bundle['metrics']}")
    return bundle


diabetes = load_bundle("diabetes_model.pkl")
heart = load_bundle("heart_model.pkl")


# ---------- helpers ----------
def number(data, key, lo, hi, label):
    """Read a numeric field and make sure it is inside a sane range."""
    try:
        value = float(data[key])
    except (KeyError, TypeError, ValueError):
        raise ValueError(f"{label} is required and must be a number")
    if not lo <= value <= hi:
        raise ValueError(f"{label} must be between {lo} and {hi}")
    return value


def level(prob):
    if prob >= 60:
        return "High"
    if prob >= 30:
        return "Moderate"
    return "Low"


def not_ready(name, script):
    return jsonify({"error": f"{name} model is not trained yet. Run {script}."}), 503


# ---------- routes ----------
@app.route("/")
def home():
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.route("/health")
def health():
    return jsonify({
        "diabetes_model": diabetes["metrics"] if diabetes else None,
        "heart_model": heart["metrics"] if heart else None,
    })


@app.route("/predict/diabetes", methods=["POST"])
def predict_diabetes():
    if diabetes is None:
        return not_ready("Diabetes", "train_diabetes.py")
    d = request.get_json(silent=True) or {}
    try:
        gender = d.get("Gender", "Female")
        row = {
            "Pregnancies": 0 if gender == "Male"
            else number(d, "Pregnancies", 0, 20, "Pregnancies"),
            "Glucose": number(d, "Glucose", 40, 400, "Glucose"),
            "BloodPressure": number(d, "BloodPressure", 30, 200, "Blood pressure"),
            # 0 = "not measured" in the training data -> replaced by median
            "SkinThickness": number(d, "SkinThickness", 0, 100, "Skin thickness"),
            "Insulin": number(d, "Insulin", 0, 900, "Insulin"),
            "BMI": number(d, "BMI", 10, 70, "BMI"),
            "DiabetesPedigreeFunction": number(d, "DiabetesPedigreeFunction", 0.05, 2.5,
                                               "Diabetes pedigree function"),
            "Age": number(d, "Age", 1, 120, "Age"),
        }
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    # Same cleaning as training: 0 means missing -> use the training median
    for col, med in diabetes["medians"].items():
        if row[col] == 0:
            row[col] = med

    x = pd.DataFrame([row])[diabetes["features"]]
    pipe = diabetes["pipeline"]
    prob = float(pipe.predict_proba(x)[0][1] * 100)
    return jsonify({
        "prediction": "Diabetic" if prob >= 50 else "Non-Diabetic",
        "probability": round(prob, 1),
        "risk_level": level(prob),
    })


@app.route("/predict/heart", methods=["POST"])
def predict_heart():
    if heart is None:
        return not_ready("Heart", "train_heart.py")
    d = request.get_json(silent=True) or {}
    try:
        row = {
            "age": number(d, "Age", 18, 100, "Age"),
            "sex": 1 if d.get("Gender", "Male") == "Male" else 0,
            "cp": number(d, "ChestPain", 0, 3, "Chest pain type"),
            "trestbps": number(d, "RestingBP", 80, 220, "Resting blood pressure"),
            "chol": number(d, "Cholesterol", 100, 600, "Cholesterol"),
            # dataset stores fasting sugar as a flag: 1 if > 120 mg/dl
            "fbs": 1 if number(d, "FastingBloodSugar", 50, 400, "Fasting blood sugar") > 120 else 0,
            "thalach": number(d, "MaxHeartRate", 60, 220, "Max heart rate"),
            "exang": 1 if d.get("ExerciseAngina", "No") == "Yes" else 0,
            "oldpeak": number(d, "Oldpeak", 0, 7, "ST depression (oldpeak)"),
        }
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    x = pd.DataFrame([row])[heart["features"]]
    prob = float(heart["pipeline"].predict_proba(x)[0][1] * 100)
    return jsonify({
        "prediction": "High Risk" if prob >= 50 else "Low Risk",
        "probability": round(prob, 1),
        "risk_level": level(prob),
    })


if __name__ == "__main__":
    app.run(debug=True, port=5000)
