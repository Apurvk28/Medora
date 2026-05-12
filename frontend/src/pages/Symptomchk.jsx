import React, { useState, useRef } from "react";
import { HEALTH_PREDICT_API_KEY, GROQ_API_URL, GROQ_MODEL } from "../configs/apiKeys";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const HealthPredict = () => {
  const [symptoms, setSymptoms] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const reportRef = useRef(null);

  const generateReport = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) return;
    setIsLoading(true);
    setError("");
    setReport(null);

    const prompt = `You are a medical AI assistant for Medora Health Platform. A patient has described their symptoms in plain English. Generate a comprehensive, detailed health report in the following structured format using markdown-style headings. Be thorough, compassionate, and educational. Do NOT give a final diagnosis but provide helpful guidance.

Patient's symptoms: "${symptoms}"

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
          max_tokens: 2000,
        }),
      });

      if (!response.ok) throw new Error("API request failed");

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Extract JSON from potential markdown blocks
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const cleanJson = jsonMatch ? jsonMatch[0] : content;
      
      const parsed = JSON.parse(cleanJson);
      setReport(parsed);
    } catch (err) {
      setError("Failed to generate report. Please check your symptoms and try again.");
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

  return (
    <section className="py-12">
      {/* Header */}
      <div className="px-4 mx-auto max-w-screen-md text-center mb-10">
        <h2 className="heading text-center">Healthcare Predict</h2>
        <p className="text__para text-center mt-2">
          Describe your symptoms in plain English and our AI will generate a comprehensive health report for you.
        </p>
      </div>

      {/* Input Form */}
      <div className="container max-w-3xl mx-auto">
        <div
          className="rounded-2xl p-8 shadow-lg"
          style={{ background: "linear-gradient(135deg, #f0f7ff 0%, #e8f4fd 100%)", border: "1px solid #c3ddf5" }}
        >
          <form onSubmit={generateReport}>
            <div className="mb-6">
              <label className="block text-headingColor font-[700] text-[18px] mb-3">
                Describe your symptoms
              </label>
              <textarea
                className="w-full p-4 rounded-xl text-[16px] font-[400] border border-gray-200 focus:outline-none focus:border-primaryColor resize-none shadow-sm"
                rows={5}
                placeholder="e.g. I am experiencing itching, redness on skin, not sleeping well, feeling tired, and mild headaches..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primaryColor text-white text-[18px] font-[700] py-4 rounded-xl hover:bg-blue-700 transition-all duration-300 flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Generating Report...
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
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-center">
            {error}
          </div>
        )}

        {/* Report */}
        {report && (
          <div className="mt-10">
            {/* Download Button */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[24px] font-[700] text-headingColor">Your Health Report</h3>
              <button
                onClick={downloadPDF}
                disabled={isDownloading}
                className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl font-[600] hover:bg-green-700 transition-all duration-300"
              >
                {isDownloading ? "Generating PDF..." : "⬇ Download PDF"}
              </button>
            </div>

            {/* Report Content */}
            <div ref={reportRef} className="bg-white rounded-2xl shadow-lg overflow-hidden">
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
                  <p className="text-blue-100 text-sm font-semibold uppercase tracking-wider mb-1">Reported Symptoms</p>
                  <p className="text-white text-[16px]">{symptoms}</p>
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
