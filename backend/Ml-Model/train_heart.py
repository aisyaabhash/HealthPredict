"""Train the heart attack / heart disease model (Logistic Regression).

Needs data/heart.csv  (UCI Heart Disease, Kaggle "heart.csv":
columns age, sex, cp, trestbps, chol, fbs, restecg, thalach, exang,
oldpeak, slope, ca, thal, target).

Run:  python train_heart.py
Output: heart_model.pkl
"""
import os
import sys
import joblib
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (accuracy_score, confusion_matrix,
                             precision_score, recall_score)
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
path = os.path.join(BASE_DIR, "data", "heart.csv")
if not os.path.exists(path):
    sys.exit("data/heart.csv not found. Download the UCI Heart Disease "
             "dataset from Kaggle and save it as backend/data/heart.csv")

df = pd.read_csv(path)
if "target" not in df.columns and "num" in df.columns:   # original UCI naming
    df["target"] = (df["num"] > 0).astype(int)

# Kaggle's 1025-row copy contains many duplicate rows; if they land in both
# train and test the accuracy is inflated. Remove them first.
before = len(df)
df = df.drop_duplicates()
print(f"Dataset: {before} rows -> {len(df)} after removing duplicates")

FEATURES = ["age", "sex", "cp", "trestbps", "chol", "fbs",
            "thalach", "exang", "oldpeak"]
X = df[FEATURES]
y = df["target"]

# Sanity check on the label direction. Exercise angina (exang) and ST
# depression (oldpeak) are clinically linked to heart disease, so they should
# correlate POSITIVELY with the label. Some copies of this dataset have the
# label inverted; if so, flip it so 1 always means "heart disease".
corr = X[["exang", "oldpeak"]].corrwith(y)
print("Label check (should be positive):", corr.round(3).to_dict())
if (corr < 0).all():
    print("Label looks inverted in this file -> flipping so 1 = heart disease")
    y = 1 - y

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y)

pipeline = Pipeline([
    ("scaler", StandardScaler()),   # chol ~250 vs exang 0/1 -> scale needed
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

print("\nCoefficients (bigger = stronger push toward 'heart disease'):")
coefs = pipeline.named_steps["model"].coef_[0]
for name, c in sorted(zip(FEATURES, coefs), key=lambda t: -abs(t[1])):
    print(f"  {name:10s} {c:+.3f}")

joblib.dump({"pipeline": pipeline, "features": FEATURES, "metrics": metrics},
            os.path.join(BASE_DIR, "heart_model.pkl"))
print("\nSaved heart_model.pkl")
