import React, { useState, useRef, useEffect } from "react";
import { HEALTH_PREDICT_API_KEY, GROQ_API_URL, GROQ_MODEL } from "../configs/apiKeys";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useNavigate } from "react-router-dom";

const CustomDiet = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("plain"); // 'plain' or 'questions'
  const [goalPlain, setGoalPlain] = useState("");
  const [answers, setAnswers] = useState({
    ageGender: "",
    currentWeightHeight: "",
    primaryGoal: "Weight Loss",
    targetWeightChange: "",
    dietaryPreference: "Vegetarian",
    activityLevel: "Moderate",
    allergiesRestrictions: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState(() => {
    const saved = localStorage.getItem("dietReport");
    return saved ? JSON.parse(saved) : null;
  });
  const [error, setError] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const reportRef = useRef(null);

  // Load answers/goals from session or interlinking if available
  useEffect(() => {
    const savedAnswers = localStorage.getItem("dietGoals");
    if (savedAnswers) setAnswers(JSON.parse(savedAnswers));
    
    const savedPlain = localStorage.getItem("dietPlain");
    if (savedPlain) setGoalPlain(savedPlain);

    // Check if interlinked query exists from Health Predict
    const interlinkQuery = localStorage.getItem("dietGoalQuery");
    if (interlinkQuery) {
      setGoalPlain(interlinkQuery);
      setActiveTab("plain");
      localStorage.removeItem("dietGoalQuery"); // Consume once
    }
  }, []);

  const handleAnswerChange = (field, val) => {
    const updated = { ...answers, [field]: val };
    setAnswers(updated);
    localStorage.setItem("dietGoals", JSON.stringify(updated));
  };

  const handleGoalPlainChange = (val) => {
    setGoalPlain(val);
    localStorage.setItem("dietPlain", val);
  };

  const generateReport = async (e) => {
    e.preventDefault();
    if (activeTab === "plain" && !goalPlain.trim()) return;
    if (activeTab === "questions" && !answers.primaryGoal.trim()) {
      setError("Please select a primary goal.");
      return;
    }

    setIsLoading(true);
    setError("");
    setReport(null);

    const patientDetails = activeTab === "plain"
      ? `Patient's Dietary Goal (Plain English): "${goalPlain}"`
      : `Patient Dietary Goal Parameters:
      1. Age & Gender: ${answers.ageGender || "Not specified"}
      2. Current Weight & Height: ${answers.currentWeightHeight || "Not specified"}
      3. Primary Goal: ${answers.primaryGoal}
      4. Target Weight Change: ${answers.targetWeightChange || "Not specified"}
      5. Dietary Preference: ${answers.dietaryPreference}
      6. Activity Level: ${answers.activityLevel}
      7. Allergies / Restrictions: ${answers.allergiesRestrictions || "None reported"}`;

    const prompt = `You are a professional AI clinical nutritionist for Medora Health Platform. A patient has requested a customized diet plan based on the following details:

${patientDetails}

Generate a comprehensive, detailed, and structured diet plan in the following exact JSON format. Be highly specific, motivating, and clinically sound.

Generate the report in this exact JSON structure:
{
  "summary": "Detailed 3-4 sentence overview of the diet strategy, caloric goals, and macronutrient focus",
  "dailyCalorieMacroTargets": "Recommended daily calories (e.g. 1800 kcal), along with specific protein, carbohydrate, and healthy fat breakdown",
  "mealPlan": [
    { "meal": "Breakfast", "suggestions": "Specific meal suggestions with portion sizes", "calories": "approx calories" },
    { "meal": "Mid-Morning Snack", "suggestions": "Specific snack suggestions", "calories": "approx calories" },
    { "meal": "Lunch", "suggestions": "Specific lunch suggestions with portion sizes", "calories": "approx calories" },
    { "meal": "Evening Snack", "suggestions": "Specific snack suggestions", "calories": "approx calories" },
    { "meal": "Dinner", "suggestions": "Specific dinner suggestions with portion sizes", "calories": "approx calories" }
  ],
  "foodsToInclude": ["food item 1", "food item 2", "food item 3", "food item 4", "food item 5"],
  "foodsToAvoid": ["food item 1", "food item 2", "food item 3", "food item 4"],
  "hydrationAndSupplements": "Specific daily water intake goals and beneficial evidence-based supplements (e.g. Omega-3, B12, Vitamin D)",
  "tipsForSuccess": ["actionable tip 1", "actionable tip 2", "actionable tip 3"]
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
      localStorage.setItem("dietReport", JSON.stringify(parsed));
    } catch (err) {
      setError("Failed to generate diet plan. Please check your inputs and try again.");
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
      pdf.save(`Medora-Custom-Diet-Plan-${Date.now()}.pdf`);
    } catch (err) {
      console.error("PDF download failed:", err);
    }
    setIsDownloading(false);
  };

  const handleCheckSymptoms = () => {
    navigate("/symptomchk");
  };

  const handleFindDoctor = () => {
    localStorage.setItem("doctorSearchQuery", "Clinical Nutritionist / Dietitian");
    navigate("/doctors");
  };

  return (
    <section className="py-12 px-4">
      {/* Header */}
      <div className="max-w-screen-md mx-auto text-center mb-10">
        <h2 className="heading text-center">Customised Diet Plan</h2>
        <p className="text__para text-center mt-2">
          Mention your dietary goals or answer our expert parameters to receive a fully personalized AI nutrition guide.
        </p>
      </div>

      {/* Tabs */}
      <div className="max-w-3xl mx-auto mb-8 flex bg-gray-100 p-1.5 rounded-2xl shadow-inner">
        <button
          type="button"
          onClick={() => setActiveTab("plain")}
          className={`flex-1 py-3.5 rounded-xl font-[700] text-[16px] transition-all duration-300 ${
            activeTab === "plain"
              ? "bg-green-600 text-white shadow-md"
              : "text-headingColor hover:bg-gray-200"
          }`}
        >
          📝 Plain English Goal
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("questions")}
          className={`flex-1 py-3.5 rounded-xl font-[700] text-[16px] transition-all duration-300 ${
            activeTab === "questions"
              ? "bg-green-600 text-white shadow-md"
              : "text-headingColor hover:bg-gray-200"
          }`}
        >
          📋 Goal Parameters (Questions)
        </button>
      </div>

      {/* Input Form */}
      <div className="max-w-3xl mx-auto container">
        <div
          className="rounded-2xl p-8 shadow-lg bg-white"
          style={{ border: "1px solid #bce8d1", background: "linear-gradient(135deg, #f4fbf7 0%, #e3f5eb 100%)" }}
        >
          <form onSubmit={generateReport}>
            {activeTab === "plain" ? (
              <div className="mb-6">
                <label className="block text-headingColor font-[700] text-[18px] mb-3">
                  Describe your dietary goals & preferences
                </label>
                <textarea
                  className="w-full p-4 rounded-xl text-[16px] font-[400] border border-gray-200 focus:outline-none focus:border-green-600 resize-none shadow-sm bg-white"
                  rows={6}
                  placeholder="e.g. I am 25 years old, looking to lose 5kg over 2 months, vegetarian, allergic to peanuts, working a desk job..."
                  value={goalPlain}
                  onChange={(e) => handleGoalPlainChange(e.target.value)}
                  required
                />
              </div>
            ) : (
              <div className="space-y-6 mb-6">
                <h3 className="text-headingColor font-[700] text-[20px] border-b pb-3 mb-4">
                  Guided Goal Parameters Questionnaire
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[15px] font-[600] text-headingColor mb-1">1. Age & Gender</label>
                    <input
                      type="text"
                      placeholder="e.g. 30, Male"
                      value={answers.ageGender}
                      onChange={(e) => handleAnswerChange("ageGender", e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-600 text-[15px] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[15px] font-[600] text-headingColor mb-1">2. Current Weight & Height</label>
                    <input
                      type="text"
                      placeholder="e.g. 75kg, 5'10&quot;"
                      value={answers.currentWeightHeight}
                      onChange={(e) => handleAnswerChange("currentWeightHeight", e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-600 text-[15px] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[15px] font-[600] text-headingColor mb-1">3. Primary Goal *</label>
                    <select
                      value={answers.primaryGoal}
                      onChange={(e) => handleAnswerChange("primaryGoal", e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-600 text-[15px] bg-white"
                      required
                    >
                      <option value="Weight Loss">Weight Loss</option>
                      <option value="Muscle Gain">Muscle Gain</option>
                      <option value="Weight Maintenance">Weight Maintenance</option>
                      <option value="Managing Medical Condition">Managing Medical Condition</option>
                      <option value="Boosting Immunity & Energy">Boosting Immunity & Energy</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[15px] font-[600] text-headingColor mb-1">4. Target Weight Change</label>
                    <input
                      type="text"
                      placeholder="e.g. Lose 5kg / Gain 3kg"
                      value={answers.targetWeightChange}
                      onChange={(e) => handleAnswerChange("targetWeightChange", e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-600 text-[15px] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[15px] font-[600] text-headingColor mb-1">5. Dietary Preference</label>
                    <select
                      value={answers.dietaryPreference}
                      onChange={(e) => handleAnswerChange("dietaryPreference", e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-600 text-[15px] bg-white"
                    >
                      <option value="Vegetarian">Vegetarian</option>
                      <option value="Vegan">Vegan</option>
                      <option value="Non-Vegetarian">Non-Vegetarian</option>
                      <option value="Keto">Keto</option>
                      <option value="Mediterranean">Mediterranean</option>
                      <option value="Gluten-Free">Gluten-Free</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[15px] font-[600] text-headingColor mb-1">6. Activity Level</label>
                    <select
                      value={answers.activityLevel}
                      onChange={(e) => handleAnswerChange("activityLevel", e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-600 text-[15px] bg-white"
                    >
                      <option value="Sedentary (Desk job, little exercise)">Sedentary (Desk job, little exercise)</option>
                      <option value="Lightly Active (Light exercise 1-3 days/week)">Lightly Active (Light exercise 1-3 days/week)</option>
                      <option value="Moderately Active (Moderate exercise 3-5 days/week)">Moderately Active (Moderate exercise 3-5 days/week)</option>
                      <option value="Very Active (Heavy exercise 6-7 days/week)">Very Active (Heavy exercise 6-7 days/week)</option>
                      <option value="Athlete (2x day training)">Athlete (2x day training)</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[15px] font-[600] text-headingColor mb-1">7. Allergies / Food Restrictions</label>
                    <input
                      type="text"
                      placeholder="e.g. Peanut allergy, Lactose intolerance, No mushrooms"
                      value={answers.allergiesRestrictions}
                      onChange={(e) => handleAnswerChange("allergiesRestrictions", e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-600 text-[15px] bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 text-white text-[18px] font-[700] py-4 rounded-xl hover:bg-green-700 transition-all duration-300 flex items-center justify-center gap-3 shadow-md"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Generating Custom Diet Plan...
                </>
              ) : (
                <>
                  <span>🥗</span> Generate Diet Plan
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
              <h3 className="text-[24px] font-[700] text-headingColor">Your Customised Diet Plan</h3>
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
              <div className="bg-green-600 text-white p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-[28px] font-[800]">Medora Custom Diet Plan</h1>
                    <p className="text-green-100 mt-1">AI-Generated Clinical Nutrition Guide</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-100 text-sm">Generated on</p>
                    <p className="text-white font-semibold">{new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>
                </div>
                <div className="mt-5 bg-white/10 rounded-xl p-4">
                  <p className="text-green-100 text-sm font-semibold uppercase tracking-wider mb-1">Target Goal / Parameters</p>
                  <p className="text-white text-[16px]">
                    {activeTab === "plain" ? goalPlain : `Goal: ${answers.primaryGoal} | Preference: ${answers.dietaryPreference} | Activity: ${answers.activityLevel}`}
                  </p>
                </div>
              </div>

              <div className="p-8 space-y-8">
                {/* Summary */}
                <Section title="📋 Diet Plan Overview" color="bg-green-50 border-green-200">
                  <p className="text-textColor text-[15px] leading-7">{report.summary}</p>
                </Section>

                {/* Calorie/Macro Targets */}
                <Section title="🎯 Daily Calorie & Macronutrient Targets" color="bg-blue-50 border-blue-200">
                  <p className="text-textColor text-[15px] leading-7">{report.dailyCalorieMacroTargets}</p>
                </Section>

                {/* Meal Plan */}
                <Section title="🍽️ Structured Daily Meal Plan" color="bg-amber-50 border-amber-200">
                  <div className="space-y-6">
                    {report.mealPlan?.map((item, i) => (
                      <div key={i} className="border-b border-amber-200 pb-4 last:border-none last:pb-0">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="text-[16px] font-[700] text-amber-900">{item.meal}</h5>
                          <span className="bg-amber-200 text-amber-800 px-3 py-1 rounded-full text-xs font-bold">{item.calories}</span>
                        </div>
                        <p className="text-textColor text-[15px] leading-6">{item.suggestions}</p>
                      </div>
                    ))}
                  </div>
                </Section>

                {/* Foods to Include & Avoid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Section title="✅ Foods to Include" color="bg-lime-50 border-lime-200">
                    <ul className="space-y-2">
                      {report.foodsToInclude?.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-textColor text-[15px]">
                          <span className="text-lime-600 font-bold">✔</span> {f}
                        </li>
                      ))}
                    </ul>
                  </Section>

                  <Section title="🚫 Foods to Avoid" color="bg-red-50 border-red-200">
                    <ul className="space-y-2">
                      {report.foodsToAvoid?.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-textColor text-[15px]">
                          <span className="text-red-500 font-bold">✖</span> {f}
                        </li>
                      ))}
                    </ul>
                  </Section>
                </div>

                {/* Hydration & Supplements */}
                <Section title="💧 Hydration & Supplements" color="bg-cyan-50 border-cyan-200">
                  <p className="text-textColor text-[15px] leading-7">{report.hydrationAndSupplements}</p>
                </Section>

                {/* Tips for Success */}
                <Section title="⭐ Tips for Success" color="bg-purple-50 border-purple-200">
                  <ul className="space-y-2">
                    {report.tipsForSuccess?.map((t, i) => (
                      <li key={i} className="flex items-start gap-2 text-textColor text-[15px]">
                        <span className="text-purple-600 font-bold">•</span> {t}
                      </li>
                    ))}
                  </ul>
                </Section>
              </div>
            </div>

            {/* INTERLINKING ACTION BUTTONS / CARDS */}
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 shadow-md flex flex-col justify-between hover:shadow-lg transition-all duration-300">
                <div>
                  <div className="text-[32px] mb-2">🩺</div>
                  <h4 className="text-[20px] font-[700] text-headingColor mb-2">Experiencing Health Symptoms?</h4>
                  <p className="text-textColor text-[15px] leading-6 mb-6">
                    Use our AI Healthcare Predict tool to analyze your symptoms, understand potential conditions, and get clinical triage.
                  </p>
                </div>
                <button
                  onClick={handleCheckSymptoms}
                  className="w-full bg-primaryColor text-white py-3.5 rounded-xl font-[700] text-[16px] hover:bg-blue-700 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <span>🩺</span> Check Symptoms & Health Risks
                </button>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-md flex flex-col justify-between hover:shadow-lg transition-all duration-300">
                <div>
                  <div className="text-[32px] mb-2">🏥</div>
                  <h4 className="text-[20px] font-[700] text-headingColor mb-2">Need Expert Nutritional Advice?</h4>
                  <p className="text-textColor text-[15px] leading-6 mb-6">
                    Find top clinical nutritionists, dietitians, and specialized doctors in your city for professional counseling.
                  </p>
                </div>
                <button
                  onClick={handleFindDoctor}
                  className="w-full bg-amber-600 text-white py-3.5 rounded-xl font-[700] text-[16px] hover:bg-amber-700 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <span>🔍</span> Find a Nutritionist / Specialist Doctor
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

export default CustomDiet;
