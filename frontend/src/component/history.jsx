import React, { useEffect, useState } from "react";
import api from "../api/axios";

const History = () => {
  const [diabetesHistory, setDiabetesHistory] = useState([]);
  const [heartHistory, setHeartHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError("");

        const [diabetesResponse, heartResponse] =
          await Promise.all([
            api.get("/api/history/diabetes"),
            api.get("/api/history/heart"),
          ]);

        setDiabetesHistory(diabetesResponse.data);
        setHeartHistory(heartResponse.data);

      } catch (err) {
        console.error("History error:", err);

        setError(
          err.response?.data?.error ||
          "Failed to load prediction history."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "30px" }}>
        <h2>Loading History...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "30px" }}>
        <h2>Prediction History</h2>
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "30px" }}>

      <h1>Prediction History</h1>

      {/* ================= DIABETES ================= */}

      <h2 style={{ marginTop: "30px" }}>
        🩸 Diabetes History
      </h2>

      {diabetesHistory.length === 0 ? (
        <p>No diabetes predictions yet.</p>
      ) : (
        <div>
          {diabetesHistory.map((item) => (
            <div
              key={item.id}
              style={{
                border: "1px solid #ddd",
                padding: "15px",
                marginTop: "10px",
                borderRadius: "8px",
              }}
            >
              <strong>{item.prediction}</strong>

              <p>
                Probability: {item.probability}%
              </p>

              <p>
                Risk Level: {item.risk_level || "N/A"}
              </p>

              <p>
                Age: {item.age}
              </p>

              <p>
                Glucose: {item.glucose}
              </p>

              <small>
                {new Date(item.created_at).toLocaleString()}
              </small>
            </div>
          ))}
        </div>
      )}


      {/* ================= HEART ================= */}

      <h2 style={{ marginTop: "40px" }}>
        ❤️ Heart Risk History
      </h2>

      {heartHistory.length === 0 ? (
        <p>No heart predictions yet.</p>
      ) : (
        <div>
          {heartHistory.map((item) => (
            <div
              key={item.id}
              style={{
                border: "1px solid #ddd",
                padding: "15px",
                marginTop: "10px",
                borderRadius: "8px",
              }}
            >
              <strong>{item.prediction}</strong>

              <p>
                Probability: {item.probability}%
              </p>

              <p>
                Risk Level: {item.risk_level || "N/A"}
              </p>

              <p>
                Age: {item.age}
              </p>

              <p>
                Cholesterol: {item.cholesterol}
              </p>

              <small>
                {new Date(item.created_at).toLocaleString()}
              </small>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default History;