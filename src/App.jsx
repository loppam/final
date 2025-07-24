import React, { useState, useEffect } from "react";
import axios from "axios";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import "./App.css";

const fields = [
  { name: "State_Name", label: "State", type: "dropdown" },
  { name: "Crop_Year", label: "Year", type: "dropdown" },
  { name: "Season", label: "Season", type: "dropdown" },
  { name: "Crop", label: "Crop", type: "dropdown" },
  { name: "TEMPERATURE", label: "Temperature (°C)", type: "number" },
  { name: "HUMIDITY", label: "Humidity (%)", type: "number" },
  { name: "ph", label: "Soil pH", type: "number" },
  { name: "RAINFALL", label: "Rainfall (mm)", type: "number" },
  { name: "N_SOIL", label: "N (Soil)", type: "number" },
  { name: "P_SOIL", label: "P (Soil)", type: "number" },
  { name: "K_SOIL", label: "K (Soil)", type: "number" },
];

const initialRow = () => {
  const obj = {};
  fields.forEach((f) => {
    obj[f.name] = "";
  });
  return obj;
};

function App() {
  const [form, setForm] = useState(initialRow());
  const [result, setResult] = useState(null);
  const [formError, setFormError] = useState(null);
  const [stateOptions, setStateOptions] = useState([]);
  const [cropOptions, setCropOptions] = useState([]);
  const [seasonOptions, setSeasonOptions] = useState([]);
  const [yearOptions, setYearOptions] = useState([]);
  const [predicting, setPredicting] = useState(false);
  const [showLanding, setShowLanding] = useState(true);

  useEffect(() => {
    axios
      .get("/api/options/State_Name")
      .then((res) => setStateOptions(res.data.State_Name));
    axios.get("/api/options/Crop").then((res) => setCropOptions(res.data.Crop));
    axios
      .get("/api/options/Season")
      .then((res) => setSeasonOptions(res.data.Season));
    axios
      .get("/api/options/Crop_Year")
      .then((res) => setYearOptions(res.data.Crop_Year));
  }, []);

  const getOptions = (f) => {
    if (f.name === "State_Name") return stateOptions;
    if (f.name === "Crop") return cropOptions;
    if (f.name === "Season") return seasonOptions;
    if (f.name === "Crop_Year") return yearOptions;
    return [];
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormError(null);
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setFormError(null);
    setPredicting(true);
    setResult(null);
    try {
      const reqObj = { ...form };
      fields.forEach((f) => {
        if (f.type === "number") reqObj[f.name] = parseFloat(form[f.name]);
      });
      const res = await axios.post("/api/predict", reqObj);
      if (res.data.error) {
        setFormError(res.data.error);
        setResult(null);
      } else {
        setResult(res.data);
      }
    } catch {
      setFormError("Prediction failed.");
    } finally {
      setPredicting(false);
    }
  };

  return (
    <div className="app-bg gradient-bg">
      <AnimatePresence>
        {showLanding && (
          <motion.div
            className="landing-card"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="landing-title">🌾 Crop Yield Prediction System</h1>
            <p className="landing-desc">
              Welcome to the Machine Learning Crop Yield Prediction App!
              <br />
              <br />
              This tool uses advanced machine learning to predict crop yield
              based on crop variety, location, season, and environmental factors
              (like temperature, rainfall, and soil nutrients).
              <br />
              <br />
              <b>How it works:</b> Fill in the form with your crop and
              environmental details. Click "Predict" to get your result.
              <br />
              <br />
              <b>Why use it?</b> Make informed decisions for farming, research,
              or agribusiness using data-driven insights tailored to your region
              and crop variety.
            </p>
            <button
              className="get-started-btn"
              onClick={() => setShowLanding(false)}
            >
              Get Started
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {!showLanding && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.7 }}
            className="main-card form-animated"
          >
            <h2 className="title">🌾 Crop Yield Prediction</h2>
            <div className="subtitle">
              Enter your crop and environmental details below. Click "Predict"
              to get your result.
            </div>
            <form onSubmit={handlePredict} className="form-card beautiful-form">
              <div className="form-fields">
                {fields.map((f) => (
                  <div key={f.name} className="form-group">
                    <label className="form-label">{f.label}:</label>
                    {f.type === "dropdown" ? (
                      <select
                        name={f.name}
                        value={form[f.name]}
                        onChange={handleFormChange}
                        className="form-input"
                      >
                        <option value="">Select {f.label}</option>
                        {getOptions(f).map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={f.type || "text"}
                        name={f.name}
                        value={form[f.name]}
                        onChange={handleFormChange}
                        className="form-input"
                        placeholder={f.label}
                      />
                    )}
                  </div>
                ))}
              </div>
              <button
                type="submit"
                className="review-btn"
                disabled={predicting}
              >
                {predicting ? "Predicting..." : "Predict"}
              </button>
              {formError && <div className="error-msg">{formError}</div>}
            </form>
            {result && (
              <div className="predicted-yield-details">
                <div className="predicted-yield-title">Prediction Result</div>
                <div className="predicted-yield-info">
                  Predicted Yield per Acre:{" "}
                  <span className="predicted-yield-value">
                    {result.predicted_per_acre !== null &&
                    result.predicted_per_acre !== undefined
                      ? result.predicted_per_acre
                      : "-"}
                  </span>{" "}
                  tons/acre
                  <br />
                  Confidence:{" "}
                  <span className="predicted-yield-confidence">
                    {result.confidence !== undefined
                      ? `${Math.round(result.confidence * 100)}%`
                      : "-"}
                  </span>
                  <div
                    style={{
                      marginTop: 12,
                      color: "#b0c4de",
                      fontSize: "0.98rem",
                    }}
                  >
                    <b>What does the confidence score mean?</b>
                    <br />
                    The confidence score reflects how complete your input is and
                    how similar it is to the data the model was trained on.
                    Lower confidence may occur if some values are missing,
                    unusual, or outside the typical range seen in the training
                    data. For best results, fill in all fields as accurately as
                    possible.
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
