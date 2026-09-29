"""Train the diabetes model (Logistic Regression) on the Pima Indians dataset.

Run:  python train_diabetes.py
Output: diabetes_model.pkl  (pipeline + medians + metrics, loaded by app.py)
"""
import os
import joblib
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (accuracy_score, confusion_matrix,
                             precision_score, recall_score)
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
df = pd.read_csv(os.path.join(BASE_DIR, "data", "diabetes.csv"))
print("Dataset:", df.shape)

FEATURES = ["Pregnancies", "Glucose", "BloodPressure", "SkinThickness",
            "Insulin", "BMI", "DiabetesPedigreeFunction", "Age"]
# In this dataset a 0 in these columns really means "not measured".
ZERO_MEANS_MISSING = ["Glucose", "BloodPressure", "SkinThickness", "Insulin", "BMI"]

X = df[FEATURES].copy()
y = df["Outcome"]
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y)

# Medians come from the TRAIN split only (no leakage), then reused in app.py.
medians = {}
for col in ZERO_MEANS_MISSING:
    medians[col] = float(X_train[col].replace(0, pd.NA).dropna().median())
    X_train[col] = X_train[col].replace(0, medians[col])
    X_test[col] = X_test[col].replace(0, medians[col])

# Scaling matters for Logistic Regression: Insulin (~100) vs DPF (~0.5).
pipeline = Pipeline([
    ("scaler", StandardScaler()),
    ("model", LogisticRegression(max_iter=1000, class_weight="balanced")),
])
pipeline.fit(X_train, y_train)

# class_weight="balanced": for a screening tool, missing a sick person
# (low recall) is worse than a false alarm, so we don't let the majority
# class dominate.
cv = cross_val_score(pipeline, X_train, y_train, cv=5).mean()
print(f"5-fold CV accuracy (train split): {cv*100:.2f}%")
pred = pipeline.predict(X_test)
metrics = {
    "accuracy": round(accuracy_score(y_test, pred), 4),
    "precision": round(precision_score(y_test, pred), 4),
    "recall": round(recall_score(y_test, pred), 4),
}
print(f"Accuracy : {metrics['accuracy']*100:.2f}%")
print(f"Precision: {metrics['precision']*100:.2f}%")
print(f"Recall   : {metrics['recall']*100:.2f}%")
print("Confusion matrix [[TN FP] [FN TP]]:\n", confusion_matrix(y_test, pred))

print("\nCoefficients (bigger = stronger push toward 'diabetic'):")
coefs = pipeline.named_steps["model"].coef_[0]
for name, c in sorted(zip(FEATURES, coefs), key=lambda t: -abs(t[1])):
    print(f"  {name:26s} {c:+.3f}")

joblib.dump({"pipeline": pipeline, "features": FEATURES,
             "medians": medians, "metrics": metrics},
            os.path.join(BASE_DIR, "diabetes_model.pkl"))
print("\nSaved diabetes_model.pkl")
