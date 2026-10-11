import api from '../api/axios';
import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import ParticleBackground from '../extra/ParticleBackground';

// Adapts the backend response to what the page displays.
// Adjust the key names here once you know your exact response shape.
function normalizeResult(data) {
  const rawProb = data.probability ?? data.diabetes_probability ?? data.confidence ?? null;
  let probability = rawProb === null ? null : Number(rawProb);
  if (probability !== null && probability <= 1) probability *= 100;

  const riskText = String(data.risk ?? data.diabetes_risk ?? data.prediction ?? data.result ?? '');
  const isHigh =
    /high|positive|diabetic|yes|1/i.test(riskText) &&
    !/not|non|no |negative|low/i.test(riskText);

  return {
    isHigh,
    riskText,
    probability,
    cardiac: data.cardiac_risk_percent ?? data.cardiacRiskPercent ?? null,
    advice: data.doctor_advice ?? data.advice ?? data.message ?? '',
  };
}

function DiabetesPrediction() {
  const [formData, setFormData] = useState({
    Gender: '',
    Age: '',
    Pregnancies: '',
    Glucose: '',
    BloodPressure: '',
    SkinThickness: '',
    Insulin: '',
    BMI: '',
    DiabetesPedigreeFunction: '',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formRef = useRef(null);
  const resultRef = useRef(null);
  const diabetesProbRef = useRef({ value: 0 });
  const cardiacProbRef = useRef({ value: 0 });
  const [displayDiabetesProb, setDisplayDiabetesProb] = useState(0);
  const [displayCardiacProb, setDisplayCardiacProb] = useState(0);

  useEffect(() => {
    gsap.fromTo(
      formRef.current.children,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
    );
  }, []);

  useEffect(() => {
    if (!result || !resultRef.current) return;

    gsap.fromTo(
      resultRef.current,
      { opacity: 0, y: 20, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power2.out' }
    );
    if (result.probability !== null) {
      gsap.to(diabetesProbRef.current, {
        value: result.probability,
        duration: 1.2,
        ease: 'power1.out',
        onUpdate: () => setDisplayDiabetesProb(diabetesProbRef.current.value),
      });
    }
    if (result.cardiac !== null) {
      gsap.to(cardiacProbRef.current, {
        value: Number(result.cardiac),
        duration: 1.2,
        ease: 'power1.out',
        onUpdate: () => setDisplayCardiacProb(cardiacProbRef.current.value),
      });
    }
  }, [result]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      // Pregnancies only applies to female patients
      if (name === 'Gender' && value === 'Male') next.Pregnancies = '0';
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const emptyField = Object.values(formData).some((v) => v === '');
    if (emptyField) {
      setError('Please fill in all fields.');
      return;
    }

    // Matches the backend request body exactly (numbers, not strings)
    const payload = {
      Gender: formData.Gender,
      Age: parseInt(formData.Age, 10),
      Pregnancies: parseInt(formData.Pregnancies, 10),
      Glucose: parseFloat(formData.Glucose),
      BloodPressure: parseFloat(formData.BloodPressure),
      SkinThickness: parseFloat(formData.SkinThickness),
      Insulin: parseFloat(formData.Insulin),
      BMI: parseFloat(formData.BMI),
      DiabetesPedigreeFunction: parseFloat(formData.DiabetesPedigreeFunction),
    };

    setLoading(true);
    setResult(null);
    setDisplayDiabetesProb(0);
    setDisplayCardiacProb(0);

    try {
      const response = await api.post('/api/predict/diabetes', payload);
      setResult(normalizeResult(response.data));
    } catch (err) {
      if (err.response) {
        setError(
          err.response.data?.message ||
            err.response.data?.error ||
            `Server error (${err.response.status}). Please try again.`
        );
      } else {
        setError('Cannot reach the server. Check that the backend is running and CORS is enabled.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'Age', label: 'Age', placeholder: 'e.g. 24' },
    { name: 'Glucose', label: 'Glucose Level (mg/dL)', placeholder: 'e.g. 180' },
    { name: 'BloodPressure', label: 'Blood Pressure (mmHg)', placeholder: 'e.g. 70' },
    { name: 'SkinThickness', label: 'Skin Thickness (mm)', placeholder: 'e.g. 20' },
    { name: 'Insulin', label: 'Insulin (mu U/mL)', placeholder: 'e.g. 80' },
    { name: 'BMI', label: 'BMI', placeholder: 'e.g. 25' },
    { name: 'DiabetesPedigreeFunction', label: 'Diabetes Pedigree Function', placeholder: 'e.g. 0.5' },
  ];

  const isMale = formData.Gender === 'Male';

  return (
    <div className="relative min-h-screen bg-white overflow-hidden px-4 sm:px-6 py-12">
      <ParticleBackground color="59, 130, 246" count={45} />

      <div className="relative z-10 max-w-2xl mx-auto text-center mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Diabetes Risk Predictor</h1>
        <p className="text-gray-500">
          Enter your health metrics below to get an instant risk estimate.
        </p>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-8">
        <form ref={formRef} onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
            <select
              name="Gender"
              value={formData.Gender}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow bg-white"
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Pregnancies</label>
            <input
              type="number"
              min="0"
              name="Pregnancies"
              value={formData.Pregnancies}
              onChange={handleChange}
              disabled={isMale}
              placeholder="e.g. 0"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>

          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{field.label}</label>
              <input
                type="number"
                step="any"
                min="0"
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              />
            </div>
          ))}

          {error && (
            <p className="sm:col-span-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="sm:col-span-2 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                Analyzing...
              </>
            ) : (
              'Check My Risk'
            )}
          </button>
        </form>
      </div>

      {result && (
        <div
          ref={resultRef}
          className={`relative z-10 max-w-2xl mx-auto mt-6 rounded-2xl shadow-sm border p-5 sm:p-8 ${
            result.isHigh ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'
          }`}
        >
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">Diabetes Risk</p>
            <h2 className={`text-3xl font-bold mb-2 ${result.isHigh ? 'text-red-600' : 'text-green-600'}`}>
              {result.isHigh ? 'High Risk' : 'Low Risk'}
            </h2>
            {result.riskText && (
              <p className="text-sm text-gray-500 mb-4">Result: {result.riskText}</p>
            )}

            {result.probability !== null && (
              <>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
                  <div
                    className={`h-3 rounded-full ${result.isHigh ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${displayDiabetesProb}%` }}
                  ></div>
                </div>
                <p className="text-sm font-medium text-gray-700">
                  {displayDiabetesProb.toFixed(0)}% probability
                </p>
              </>
            )}
          </div>

          {result.cardiac !== null && (
            <div className="border-t border-gray-200 mt-6 pt-6 text-center">
              <p className="text-sm text-gray-500 mb-2">Cardiac Risk</p>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
                <div
                  className="h-3 rounded-full bg-orange-500"
                  style={{ width: `${displayCardiacProb}%` }}
                ></div>
              </div>
              <p className="text-sm font-medium text-gray-700">{displayCardiacProb.toFixed(0)}% risk</p>
            </div>
          )}

          {result.advice && (
            <div className="border-t border-gray-200 mt-6 pt-6">
              <p className="text-sm font-semibold text-gray-700 mb-1">Recommendation</p>
              <p className="text-sm text-gray-600">{result.advice}</p>
            </div>
          )}

          <p className="text-xs text-gray-400 mt-6 text-center">
            This is an educational demo, not a medical diagnosis. Consult a doctor for medical advice.
          </p>
        </div>
      )}
    </div>
  );
}

export default DiabetesPrediction;