import React, { useState, useRef, useEffect } from "react";
import { HEALTH_PREDICT_API_KEY, GROQ_API_URL, GROQ_MODEL } from "../configs/apiKeys";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useNavigate } from "react-router-dom";

const commonSymptoms = [
  "Severe headache with nausea",
  "Persistent cough and mild fever",
  "Itching and red skin rash",
  "Difficulty sleeping and chronic fatigue",
  "Lower back pain radiating to leg",
  "Acid reflux and severe heartburn",
  "Shortness of breath during light exertion",
  "Sore throat and difficulty swallowing",
  "Frequent urination and excessive thirst",
  "Dizziness and feeling lightheaded",
  "Joint pain and morning stiffness",
  "Stomach cramp and watery diarrhea",
  "High fever with chills and body ache",
  "Anxiety, rapid heartbeat, and sweating"
];

const HealthPredict = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("plain"); // 'plain' or 'questions'
  const [symptoms, setSymptoms] = useState("");
  const [answers, setAnswers] = useState({
    ageGender: "",
    primarySymptom: "",
    duration: "",
    severity: "5",
    fever: "",
    painType: "",
    associatedSymptoms: "",
    medicalConditions: "",
    medications: "",
    lifestyleChanges: "",
  });

  const [showPlainSuggestions, setShowPlainSuggestions] = useState(false);
  const [showPrimarySuggestions, setShowPrimarySuggestions] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState(() => {
    const saved = localStorage.getItem("symptomReport");
    return saved ? JSON.parse(saved) : null;
  });
  const [error, setError] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const reportRef = useRef(null);

  // Load answers/symptoms from session if available
  useEffect(() => {
    const savedAnswers = localStorage.getItem("symptomAnswers");
    if (savedAnswers) setAnswers(JSON.parse(savedAnswers));
    const savedSymptoms = localStorage.getItem("symptomPlain");
    if (savedSymptoms) setSymptoms(savedSymptoms);
  }, []);

  const handleAnswerChange = (field, val) => {
    const updated = { ...answers, [field]: val };
    setAnswers(updated);
    localStorage.setItem("symptomAnswers", JSON.stringify(updated));
    if (field === "primarySymptom") {
      setShowPrimarySuggestions(true);
    }
  };

  const handleSymptomsChange = (val) => {
    setSymptoms(val);
    localStorage.setItem("symptomPlain", val);
    setShowPlainSuggestions(true);
  };

  const selectPlainSuggestion = (text) => {
    setSymptoms(text);
    localStorage.setItem("symptomPlain", text);
    setShowPlainSuggestions(false);
  };

  const selectPrimarySuggestion = (text) => {
    const updated = { ...answers, primarySymptom: text };
    setAnswers(updated);
    localStorage.setItem("symptomAnswers", JSON.stringify(updated));
    setShowPrimarySuggestions(false);
  };

  const filteredPlainSymptoms = commonSymptoms.filter(s => 
    symptoms && s.toLowerCase().includes(symptoms.toLowerCase()) && s.toLowerCase() !== symptoms.toLowerCase()
  );

  const filteredPrimarySymptoms = commonSymptoms.filter(s => 
    answers.primarySymptom && s.toLowerCase().includes(answers.primarySymptom.toLowerCase()) && s.toLowerCase() !== answers.primarySymptom.toLowerCase()
  );

  const generateReport = async (e) => {
    e.preventDefault();
    if (activeTab === "plain" && !symptoms.trim()) return;
    if (activeTab === "questions" && !answers.primarySymptom.trim()) {
      setError("Please describe your primary symptom.");
      return;
    }

    setIsLoading(true);
    setError("");
    setReport(null);

    const patientDetails = activeTab === "plain"
      ? `Patient's symptoms (Plain English): "${symptoms}"`
      : `Patient Clinical Questionnaire Answers:
      1. Age & Gender: ${answers.ageGender || "Not specified"}
      2. Primary Symptom: ${answers.primarySymptom}
      3. Duration: ${answers.duration || "Not specified"}
      4. Severity (1-10): ${answers.severity}
      5. Fever/Temperature: ${answers.fever || "None reported"}
      6. Pain Characteristics: ${answers.painType || "None reported"}
      7. Associated Symptoms: ${answers.associatedSymptoms || "None reported"}
      8. Existing Medical Conditions: ${answers.medicalConditions || "None reported"}
      9. Current Medications: ${answers.medications || "None reported"}
      10. Recent Travel/Lifestyle Changes: ${answers.lifestyleChanges || "None reported"}`;

    const prompt = `You are a medical AI assistant for Medora Health Platform. A patient has provided their symptom details below. Generate a comprehensive, detailed health report in the following structured format using markdown-style headings. Be thorough, compassionate, and educational. Do NOT give a final diagnosis but provide helpful guidance.

${patientDetails}

Generate the report in this exact JSON structure:
{
  "possibleConditions": ["condition1", "condition2", "condition3"],
  "overview": "A detailed 3-4 sentence overview of the possible conditions based on the symptoms",
  "symptomsAnalysis": "Detailed paragraph analyzing each symptom and what it could indicate",
  "risksIfIgnored": "Detailed paragraph on what could happen if these symptoms are left untreated or ignored — include potential complications and progression of conditions",
  "immediateSteps": ["step1", "step2", "step3", "step4", "step5"],
  "precautions": ["precaution1", "precaution2", "precaution3", "precaution4"],
  "recommendedMedications": "List of common over-the-counter medications or home remedies that may help, with dosage notes. Include disclaimer to consult a doctor.",
  "dietaryAdvice": ["dietary recommendation 1", "dietary recommendation 2", "dietary recommendation 3", "dietary recommendation 4"],
  "lifestyle": ["lifestyle change 1", "lifestyle change 2", "lifestyle change 3"],
  "whenToSeeDoctor": "Clear guidance on when to urgently visit a doctor vs when home management is okay",
  "disclaimer": "Standard medical disclaimer"
}

Return ONLY the JSON, no extra text.`;

    try {
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${HEALTH_PREDICT_API_KEY}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 2500,
        }),
      });

      if (!response.ok) throw new Error("API request failed");

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const cleanJson = jsonMatch ? jsonMatch[0] : content;
      
      const parsed = JSON.parse(cleanJson);
      setReport(parsed);
      localStorage.setItem("symptomReport", JSON.stringify(parsed));
    } catch (err) {
      setError("Failed to generate report. Please check your inputs and try again.");
    }

    setIsLoading(false);
  };

  const downloadPDF = async () => {
    if (!reportRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      let heightLeft = pdfHeight;
      let position = 0;
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }
      pdf.save(`Medora-Health-Report-${Date.now()}.pdf`);
    } catch (err) {
      console.error("PDF download failed:", err);
    }
    setIsDownloading(false);
  };

  const handleFindDoctor = () => {
    const query = report?.possibleConditions?.[0] || report?.possibleConditions?.[1] || "General Physician";
    localStorage.setItem("doctorSearchQuery", query);
    navigate("/doctors");
  };

  const handleCustomDiet = () => {
    const query = report?.possibleConditions?.join(", ") || symptoms || answers.primarySymptom;
    localStorage.setItem("dietGoalQuery", `Create a recovery and immunity-boosting diet tailored for a patient experiencing/recovering from: ${query}`);
    navigate("/custom-diet");
  };

  return (
    <section className="py-12 px-4">
      {/* Header */}
      <div className="max-w-screen-md mx-auto text-center mb-10">
        <h2 className="heading text-center">Healthcare Predict</h2>
        <p className="text__para text-center mt-2">
          Choose how you want to describe your symptoms and get a comprehensive clinical AI report.
        </p>
      </div>

      {/* Tabs */}
      <div className="max-w-3xl mx-auto mb-8 flex bg-gray-100 p-1.5 rounded-2xl shadow-inner">
        <button
          type="button"
          onClick={() => setActiveTab("plain")}
          className={`flex-1 py-3.5 rounded-xl font-[700] text-[16px] transition-all duration-300 ${
            activeTab === "plain"
              ? "bg-primaryColor text-white shadow-md"
              : "text-headingColor hover:bg-gray-200"
          }`}
        >
          📝 Plain English Description
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("questions")}
          className={`flex-1 py-3.5 rounded-xl font-[700] text-[16px] transition-all duration-300 ${
            activeTab === "questions"
              ? "bg-primaryColor text-white shadow-md"
              : "text-headingColor hover:bg-gray-200"
          }`}
        >
          📋 10 Clinical Questions
        </button>
      </div>

      {/* Input Form */}
      <div className="max-w-3xl mx-auto container">
        <div
          className="rounded-2xl p-8 shadow-lg bg-white"
          style={{ border: "1px solid #c3ddf5", background: "linear-gradient(135deg, #f8faff 0%, #edf4fc 100%)" }}
        >
          <form onSubmit={generateReport}>
            {activeTab === "plain" ? (
              <div className="mb-6 relative">
                <label className="block text-headingColor font-[700] text-[18px] mb-3">
                  Describe your symptoms naturally
                </label>
                <textarea
                  className="w-full p-4 rounded-xl text-[16px] font-[400] border border-gray-200 focus:outline-none focus:border-primaryColor resize-none shadow-sm bg-white"
                  rows={6}
                  placeholder="e.g. I am experiencing itching, redness on skin, not sleeping well, feeling tired, and mild headaches for the past 3 days..."
                  value={symptoms}
                  onChange={(e) => handleSymptomsChange(e.target.value)}
                  onFocus={() => setShowPlainSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowPlainSuggestions(false), 200)}
                  required
                />

                {/* Autocomplete Predictive Dropdown */}
                {showPlainSuggestions && filteredPlainSymptoms.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-blue-200 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto divide-y divide-gray-100">
                    <div className="p-2.5 bg-blue-50 text-xs font-bold text-primaryColor uppercase tracking-wider flex items-center justify-between">
                      <span>✨ Predictive Symptom Suggestions</span>
                      <span className="text-[10px] bg-blue-200 px-2 py-0.5 rounded-full text-blue-800">Click to complete</span>
                    </div>
                    {filteredPlainSymptoms.map((item, idx) => (
                      <div
                        key={idx}
                        onMouseDown={() => selectPlainSuggestion(item)}
                        className="p-3.5 text-sm text-textColor hover:bg-blue-50 hover:text-primaryColor cursor-pointer transition-colors flex items-center gap-2 font-medium"
                      >
                        <span className="text-primaryColor opacity-70">🔍</span>
                        {item}
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick Suggestion Pills */}
                {!symptoms && (
                  <div className="mt-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <span>💡</span> Popular Symptom Phrases:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {commonSymptoms.slice(0, 5).map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => selectPlainSuggestion(item)}
                          className="bg-blue-50 text-primaryColor border border-blue-200 hover:bg-primaryColor hover:text-white text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all duration-300 shadow-sm"
                        >
                          + {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6 mb-6">
                <h3 className="text-headingColor font-[700] text-[20px] border-b pb-3 mb-4">
                  Step-by-Step Clinical Questionnaire (10 Parameters)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[15px] font-[600] text-headingColor mb-1">1. Age & Gender</label>
                    <input
                      type="text"
                      placeholder="e.g. 28, Female"
                      value={answers.ageGender}
                      onChange={(e) => handleAnswerChange("ageGender", e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primaryColor text-[15px] bg-white"
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-[15px] font-[600] text-headingColor mb-1">2. Primary Symptom *</label>
                    <input
                      type="text"
                      placeholder="e.g. Severe headache / Skin rash"
                      value={answers.primarySymptom}
                      onChange={(e) => handleAnswerChange("primarySymptom", e.target.value)}
                      onFocus={() => setShowPrimarySuggestions(true)}
                      onBlur={() => setTimeout(() => setShowPrimarySuggestions(false), 200)}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primaryColor text-[15px] bg-white"
                      required
                    />

                    {/* Autocomplete Predictive Dropdown */}
                    {showPrimarySuggestions && filteredPrimarySymptoms.length > 0 && (
                      <div className="absolute left-0 right-0 mt-1 bg-white border border-blue-200 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto divide-y divide-gray-100">
                        <div className="p-2 bg-blue-50 text-xs font-bold text-primaryColor uppercase tracking-wider flex items-center justify-between">
                          <span>✨ Suggestions</span>
                        </div>
                        {filteredPrimarySymptoms.map((item, idx) => (
                          <div
                            key={idx}
                            onMouseDown={() => selectPrimarySuggestion(item)}
                            className="p-3 text-sm text-textColor hover:bg-blue-50 hover:text-primaryColor cursor-pointer transition-colors flex items-center gap-2 font-medium"
                          >
                            <span className="text-primaryColor opacity-70">🔍</span>
                            {item}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-[15px] font-[600] text-headingColor mb-1">3. Duration</label>
                    <input
                      type="text"
                      placeholder="e.g. 3 days / 2 weeks"
                      value={answers.duration}
                      onChange={(e) => handleAnswerChange("duration", e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primaryColor text-[15px] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[15px] font-[600] text-headingColor mb-1">
                      4. Severity (1 to 10): <span className="text-primaryColor font-bold">{answers.severity}</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={answers.severity}
                      onChange={(e) => handleAnswerChange("severity", e.target.value)}
                      className="w-full mt-2 accent-primaryColor"
                    />
                  </div>
                  <div>
                    <label className="block text-[15px] font-[600] text-headingColor mb-1">5. Fever / Temperature</label>
                    <input
                      type="text"
                      placeholder="e.g. 101°F / Chills / Normal"
                      value={answers.fever}
                      onChange={(e) => handleAnswerChange("fever", e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primaryColor text-[15px] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[15px] font-[600] text-headingColor mb-1">6. Pain Characteristics</label>
                    <input
                      type="text"
                      placeholder="e.g. Sharp, throbbing, constant"
                      value={answers.painType}
                      onChange={(e) => handleAnswerChange("painType", e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primaryColor text-[15px] bg-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[15px] font-[600] text-headingColor mb-1">7. Associated Symptoms</label>
                    <input
                      type="text"
                      placeholder="e.g. Nausea, dizziness, fatigue, cough"
                      value={answers.associatedSymptoms}
                      onChange={(e) => handleAnswerChange("associatedSymptoms", e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primaryColor text-[15px] bg-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[15px] font-[600] text-headingColor mb-1">8. Existing Medical Conditions</label>
                    <input
                      type="text"
                      placeholder="e.g. Diabetes, Hypertension, None"
                      value={answers.medicalConditions}
                      onChange={(e) => handleAnswerChange("medicalConditions", e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primaryColor text-[15px] bg-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[15px] font-[600] text-headingColor mb-1">9. Current Medications</label>
                    <input
                      type="text"
                      placeholder="e.g. Metformin, Vitamin D, None"
                      value={answers.medications}
                      onChange={(e) => handleAnswerChange("medications", e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primaryColor text-[15px] bg-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[15px] font-[600] text-headingColor mb-1">10. Recent Travel / Lifestyle Changes</label>
                    <input
                      type="text"
                      placeholder="e.g. Traveled abroad, high stress, changed diet"
                      value={answers.lifestyleChanges}
                      onChange={(e) => handleAnswerChange("lifestyleChanges", e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primaryColor text-[15px] bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primaryColor text-white text-[18px] font-[700] py-4 rounded-xl hover:bg-blue-700 transition-all duration-300 flex items-center justify-center gap-3 shadow-md"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Generating Comprehensive AI Report...
                </>
              ) : (
                <>
                  <span>🩺</span> Get Full Report
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-center font-semibold">
            {error}
          </div>
        )}

        {/* Report */}
        {report && (
          <div className="mt-12">
            {/* Download Button */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[24px] font-[700] text-headingColor">Your Health Report</h3>
              <button
                onClick={downloadPDF}
                disabled={isDownloading}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-[600] hover:bg-green-700 transition-all duration-300 shadow-md"
              >
                {isDownloading ? "Generating PDF..." : "⬇ Download PDF"}
              </button>
            </div>

            {/* Report Content */}
            <div ref={reportRef} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
              {/* Report Header */}
              <div className="bg-primaryColor text-white p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-[28px] font-[800]">Medora Health Report</h1>
                    <p className="text-blue-100 mt-1">AI-Generated Medical Analysis</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-100 text-sm">Generated on</p>
                    <p className="text-white font-semibold">{new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>
                </div>
                <div className="mt-5 bg-white/10 rounded-xl p-4">
                  <p className="text-blue-100 text-sm font-semibold uppercase tracking-wider mb-1">Reported Symptoms / Parameters</p>
                  <p className="text-white text-[16px]">
                    {activeTab === "plain" ? symptoms : `Primary Symptom: ${answers.primarySymptom} | Severity: ${answers.severity}/10 | Duration: ${answers.duration || "N/A"}`}
                  </p>
                </div>
              </div>

              <div className="p-8 space-y-8">
                {/* Possible Conditions */}
                <Section title="🔍 Possible Conditions" color="bg-blue-50 border-blue-200">
                  <div className="flex flex-wrap gap-2">
                    {report.possibleConditions?.map((c, i) => (
                      <span key={i} className="bg-primaryColor text-white px-4 py-1.5 rounded-full text-[14px] font-semibold">{c}</span>
                    ))}
                  </div>
                </Section>

                {/* Overview */}
                <Section title="📋 Overview" color="bg-gray-50 border-gray-200">
                  <p className="text-textColor text-[15px] leading-7">{report.overview}</p>
                </Section>

                {/* Symptom Analysis */}
                <Section title="🩺 Symptoms Analysis" color="bg-purple-50 border-purple-200">
                  <p className="text-textColor text-[15px] leading-7">{report.symptomsAnalysis}</p>
                </Section>

                {/* Risks If Ignored */}
                <Section title="⚠️ Risks If Ignored" color="bg-red-50 border-red-200">
                  <p className="text-textColor text-[15px] leading-7">{report.risksIfIgnored}</p>
                </Section>

                {/* Immediate Steps */}
                <Section title="✅ Immediate Steps to Take" color="bg-green-50 border-green-200">
                  <ul className="space-y-2">
                    {report.immediateSteps?.map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                        <span className="text-textColor text-[15px]">{step}</span>
                      </li>
                    ))}
                  </ul>
                </Section>

                {/* Precautions */}
                <Section title="🛡️ Precautions" color="bg-yellow-50 border-yellow-200">
                  <ul className="space-y-2">
                    {report.precautions?.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-textColor text-[15px]">
                        <span className="text-yellow-500 font-bold">•</span> {p}
                      </li>
                    ))}
                  </ul>
                </Section>

                {/* Medications */}
                <Section title="💊 Medications & Remedies" color="bg-orange-50 border-orange-200">
                  <p className="text-textColor text-[15px] leading-7">{report.recommendedMedications}</p>
                </Section>

                {/* Diet */}
                <Section title="🥗 Dietary Advice" color="bg-lime-50 border-lime-200">
                  <ul className="space-y-2">
                    {report.dietaryAdvice?.map((d, i) => (
                      <li key={i} className="flex items-start gap-2 text-textColor text-[15px]">
                        <span className="text-lime-600 font-bold">•</span> {d}
                      </li>
                    ))}
                  </ul>
                </Section>

                {/* Lifestyle */}
                <Section title="🏃 Lifestyle Recommendations" color="bg-teal-50 border-teal-200">
                  <ul className="space-y-2">
                    {report.lifestyle?.map((l, i) => (
                      <li key={i} className="flex items-start gap-2 text-textColor text-[15px]">
                        <span className="text-teal-600 font-bold">•</span> {l}
                      </li>
                    ))}
                  </ul>
                </Section>

                {/* When to See Doctor */}
                <Section title="🏥 When to See a Doctor" color="bg-indigo-50 border-indigo-200">
                  <p className="text-textColor text-[15px] leading-7">{report.whenToSeeDoctor}</p>
                </Section>

                {/* Disclaimer */}
                <div className="bg-gray-100 border border-gray-300 rounded-xl p-5 text-[13px] text-gray-500 leading-6">
                  <strong className="text-gray-600">⚕️ Disclaimer:</strong> {report.disclaimer}
                </div>
              </div>
            </div>

            {/* INTERLINKING ACTION BUTTONS / CARDS */}
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 shadow-md flex flex-col justify-between hover:shadow-lg transition-all duration-300">
                <div>
                  <div className="text-[32px] mb-2">🏥</div>
                  <h4 className="text-[20px] font-[700] text-headingColor mb-2">Need to Consult a Specialist?</h4>
                  <p className="text-textColor text-[15px] leading-6 mb-6">
                    Find top-rated doctors and hospitals in your city specialized in treating your predicted conditions.
                  </p>
                </div>
                <button
                  onClick={handleFindDoctor}
                  className="w-full bg-primaryColor text-white py-3.5 rounded-xl font-[700] text-[16px] hover:bg-blue-700 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <span>🔍</span> Find a Doctor for These Symptoms
                </button>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 shadow-md flex flex-col justify-between hover:shadow-lg transition-all duration-300">
                <div>
                  <div className="text-[32px] mb-2">🥗</div>
                  <h4 className="text-[20px] font-[700] text-headingColor mb-2">Want a Supporting Diet Plan?</h4>
                  <p className="text-textColor text-[15px] leading-6 mb-6">
                    Generate a fully customized, goal-oriented daily meal plan to support your recovery and boost immunity.
                  </p>
                </div>
                <button
                  onClick={handleCustomDiet}
                  className="w-full bg-green-600 text-white py-3.5 rounded-xl font-[700] text-[16px] hover:bg-green-700 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <span>✨</span> Customise Diet for These Symptoms
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

const Section = ({ title, color, children }) => (
  <div className={`border rounded-xl p-6 ${color}`}>
    <h4 className="text-[18px] font-[700] text-headingColor mb-4">{title}</h4>
    {children}
  </div>
);

export default HealthPredict;
