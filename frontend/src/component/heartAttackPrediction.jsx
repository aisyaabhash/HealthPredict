import api from "../api/axios";
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";


const HeartAttackPrediction = () => {
  const pageRef = useRef(null);
  const formRef = useRef(null);
  const heartRef = useRef(null);
  const resultRef = useRef(null);

 const [formData, setFormData] = useState({
  Age: "",
  Gender: "Male",
  ChestPain: "0",
  RestingBP: "",
  Cholesterol: "",
  FastingBloodSugar: "",
  MaxHeartRate: "",
  ExerciseAngina: "No",
  Oldpeak: "",
});

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // GSAP page animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(pageRef.current, {
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
      });

      gsap.from(".hero-item", {
        y: 30,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: "power3.out",
      });

      gsap.from(".form-card", {
        y: 50,
        opacity: 0,
        duration: 0.9,
        delay: 0.3,
        ease: "power3.out",
      });

      gsap.from(".info-card", {
        x: 40,
        opacity: 0,
        duration: 0.8,
        delay: 0.5,
        ease: "power3.out",
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  // Heart animation
  useEffect(() => {
    if (!heartRef.current) return;

    gsap.to(heartRef.current, {
      scale: 1.12,
      duration: 0.65,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);

    try {
     const payload = {
  Age: Number(formData.Age),
  Gender: formData.Gender,
  ChestPain: Number(formData.ChestPain),
  RestingBP: Number(formData.RestingBP),
  Cholesterol: Number(formData.Cholesterol),
  FastingBloodSugar: Number(formData.FastingBloodSugar),
  MaxHeartRate: Number(formData.MaxHeartRate),
  ExerciseAngina: formData.ExerciseAngina,
  Oldpeak: Number(formData.Oldpeak),
};

      const response = await api.post(
  "/api/predict/heart",
  payload
);

const data = response.data;

      console.log("Prediction response:", data);

      setResult(data);

      // Animate result
      setTimeout(() => {
        if (resultRef.current) {
          gsap.fromTo(
            resultRef.current,
            {
              opacity: 0,
              y: 30,
              scale: 0.95,
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.7,
              ease: "back.out(1.7)",
            }
          );
        }
      }, 50);
    } catch (err) {
  console.error("Heart prediction error:", err);

  setError(
    err.response?.data?.message ||
    err.response?.data?.error ||
    err.message ||
    "Heart prediction failed."
  );
} finally {
  setLoading(false);
}
  };

  const getPredictionText = () => {
    if (!result) return "";

    // Handles several common backend response formats
    return (
      result.prediction ??
      result.result ??
      result.message ??
      result.predicted_class ??
      result.Prediction ??
      "Prediction received"
    );
  };

  const isRisk = () => {
    const text = String(getPredictionText()).toLowerCase();

    return (
      text.includes("risk") ||
      text.includes("positive") ||
      text.includes("yes") ||
      text.includes("1") ||
      text.includes("heart attack")
    );
  };

  return (
    <div
      ref={pageRef}
      className="min-h-screen bg-slate-950 text-white overflow-hidden"
    >
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute top-1/2 right-0 h-80 w-80 rounded-full bg-red-500/10 blur-3xl" />
      </div>

      {/* Header */}
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/20">
              <span className="text-xl">❤</span>
            </div>

            <div>
              <h1 className="text-lg font-bold sm:text-xl">
                Health<span className="text-cyan-400">Predict</span>
              </h1>
              <p className="text-xs text-slate-400">
                AI Health Assessment
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300 sm:flex">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            System Online
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-16">
        {/* Hero */}
        <section className="mb-10 text-center lg:mb-14">
          <div className="hero-item mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
            <span>●</span>
            Heart Health Assessment
          </div>

          <h2 className="hero-item mx-auto max-w-4xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            Know Your Risk.
            <br />
            <span className="bg-linear-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Protect Your Heart.
            </span>
          </h2>

          <p className="hero-item mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            Enter your health information below to receive an AI-based
            heart-risk prediction. The result is intended for educational
            purposes and should not replace professional medical advice.
          </p>

          {/* Animated heart */}
          <div
            ref={heartRef}
            className="mx-auto mt-7 flex h-16 w-16 items-center justify-center rounded-full border border-red-400/20 bg-red-500/10 text-3xl shadow-lg shadow-red-500/10"
          >
            ❤️
          </div>
        </section>

        {/* Content */}
        <section className="grid gap-8 lg:grid-cols-[1fr_350px]">
          {/* Form */}
          <div
            ref={formRef}
            className="form-card rounded-3xl border border-white/10 bg-white/4 p-5 shadow-2xl backdrop-blur-xl sm:p-8"
          >
            <div className="mb-8">
              <h3 className="text-xl font-bold sm:text-2xl">
                Patient Information
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Enter the values used by your prediction model.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid gap-5 sm:grid-cols-2">
                {/* Age */}
                <Input
                  label="Age"
                  name="Age"
                  type="number"
                  placeholder="e.g. 45"
                  value={formData.Age}
                  onChange={handleChange}
                  required
                />

                {/* Gender */}
                <Select
                  label="Gender"
                  name="Gender"
                  value={formData.Gender}
                  onChange={handleChange}
                  options={["Male", "Female"]}
                />
                {/* Chest Pain */}
<Select
  label="Chest Pain Type"
  name="ChestPain"
  value={formData.ChestPain}
  onChange={handleChange}
  options={["0", "1", "2", "3"]}
/>

                {/* Resting BP */}
                <Input
                  label="Resting Blood Pressure"
                  name="RestingBP"
                  type="number"
                  placeholder="e.g. 130"
                  value={formData.RestingBP}
                  onChange={handleChange}
                  required
                  suffix="mmHg"
                />

                {/* Cholesterol */}
                <Input
                  label="Cholesterol"
                  name="Cholesterol"
                  type="number"
                  placeholder="e.g. 240"
                  value={formData.Cholesterol}
                  onChange={handleChange}
                  required
                  suffix="mg/dL"
                />

                {/* Fasting Blood Sugar */}
                <Input
                  label="Fasting Blood Sugar"
                  name="FastingBloodSugar"
                  type="number"
                  placeholder="e.g. 110"
                  value={formData.FastingBloodSugar}
                  onChange={handleChange}
                  required
                  suffix="mg/dL"
                />

                {/* Max Heart Rate */}
                <Input
                  label="Maximum Heart Rate"
                  name="MaxHeartRate"
                  type="number"
                  placeholder="e.g. 150"
                  value={formData.MaxHeartRate}
                  onChange={handleChange}
                  required
                  suffix="bpm"
                />

                {/* Exercise Angina */}
                <Select
                  label="Exercise Angina"
                  name="ExerciseAngina"
                  value={formData.ExerciseAngina}
                  onChange={handleChange}
                  options={["No", "Yes"]}
                />

                {/* Oldpeak */}
                <Input
                  label="Oldpeak"
                  name="Oldpeak"
                  type="number"
                  step="0.1"
                  placeholder="e.g. 1.2"
                  value={formData.Oldpeak}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-rr from-cyan-500 to-blue-600 px-6 py-4 font-bold shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-cyan-500/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Predict Heart Risk
                    <span className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* Error */}
            {error && (
              <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-300">
                <strong>Error:</strong> {error}
              </div>
            )}

            {/* Result */}
            {result && (
              <div
                ref={resultRef}
                className={`mt-8 rounded-2xl border p-6 ${
                  isRisk()
                    ? "border-red-400/30 bg-red-500/10"
                    : "border-emerald-400/30 bg-emerald-500/10"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl ${
                      isRisk()
                        ? "bg-red-500/20"
                        : "bg-emerald-500/20"
                    }`}
                  >
                    {isRisk() ? "⚠️" : "✓"}
                  </div>

                  <div>
                    <p className="text-sm text-slate-400">
                      Prediction Result
                    </p>

                    <h4 className="mt-1 text-xl font-bold">
                      {String(getPredictionText())}
                    </h4>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      This prediction is generated by your machine-learning
                      model and should not be considered a medical diagnosis.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Information Panel */}
          <aside
            className="info-card space-y-5"
          >
            <div className="rounded-3xl border border-white/10 bg-white/4 p-6 backdrop-blur-xl">
              <h3 className="mb-5 text-lg font-bold">
                How It Works
              </h3>

              <div className="space-y-5">
                <InfoStep
                  number="01"
                  title="Enter Data"
                  description="Provide the patient's health measurements."
                />

                <InfoStep
                  number="02"
                  title="AI Analysis"
                  description="Your backend processes the submitted data."
                />

                <InfoStep
                  number="03"
                  title="Get Prediction"
                  description="The model returns the predicted risk result."
                />
              </div>
            </div>

            <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-6">
              <div className="mb-3 flex items-center gap-3">
                <span className="text-xl">🛡️</span>
                <h3 className="font-bold">Privacy Notice</h3>
              </div>

              <p className="text-sm leading-6 text-slate-400">
                Only send data to your own authorized backend. Avoid entering
                personally identifying information into a development
                prediction form.
              </p>
            </div>

            <div className="rounded-3xl border border-amber-400/20 bg-amber-400/5 p-6">
              <div className="mb-2 font-semibold text-amber-300">
                Medical Disclaimer
              </div>

              <p className="text-sm leading-6 text-slate-400">
                This application is a software/ML demonstration. It cannot
                diagnose a heart attack or replace a qualified healthcare
                professional.
              </p>
            </div>
          </aside>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 px-5 py-6 text-center text-xs text-slate-500">
        HealthPredict • Heart Risk Assessment
      </footer>
    </div>
  );
};

/* ---------------- Components ---------------- */

const Input = ({
  label,
  name,
  type,
  placeholder,
  value,
  onChange,
  required,
  suffix,
  step,
}) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </label>

      <div className="relative">
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          step={step}
          className={`w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10 ${
            suffix ? "pr-20" : ""
          }`}
        />

        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
};

const Select = ({ label, name, value, onChange, options }) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full appearance-none rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3.5 text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10"
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
            className="bg-slate-900"
          >
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

const InfoStep = ({ number, title, description }) => {
  return (
    <div className="flex gap-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 text-xs font-bold text-cyan-400">
        {number}
      </div>

      <div>
        <h4 className="font-semibold">{title}</h4>
        <p className="mt-1 text-sm leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
};

export default HeartAttackPrediction;