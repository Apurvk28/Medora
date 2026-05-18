import React, { useState, useEffect, useRef } from "react";
import { FIND_DOCTOR_API_KEY, GROQ_API_URL, GROQ_MODEL } from "../../configs/apiKeys";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useNavigate } from "react-router-dom";

const FindDoctor = () => {
  const navigate = useNavigate();
  const [city, setCity] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [doctors, setDoctors] = useState(() => {
    const saved = localStorage.getItem("doctorReport");
    return saved ? JSON.parse(saved) : [];
  });
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(() => localStorage.getItem("doctorSearchedCity") || "");
  const [isDownloading, setIsDownloading] = useState(false);
  const reportRef = useRef(null);

  // Check if there is an initial search query passed from Health Predict or Custom Diet
  useEffect(() => {
    const interlinkQuery = localStorage.getItem("doctorSearchQuery");
    if (interlinkQuery) {
      setCity("Pune"); // Default realistic city to trigger search
      localStorage.removeItem("doctorSearchQuery");
      triggerSearch("Pune", interlinkQuery);
    }
  }, []);

  const triggerSearch = async (targetCity, specialtyFocus = "") => {
    if (!targetCity.trim()) return;
    setIsLoading(true);
    setError("");
    setDoctors([]);
    setSearched(targetCity);
    localStorage.setItem("doctorSearchedCity", targetCity);

    const prompt = `You are a medical directory AI for Medora Health Platform. Generate a realistic list of top 10 doctors and hospitals available in ${targetCity}, India. ${specialtyFocus ? `Make sure to prioritize specialists related to: ${specialtyFocus}` : "Include a mix of multi-specialty hospitals and individual specialist doctors."}

Return ONLY a valid JSON array with exactly 10 items in this structure:
[
  {
    "name": "Full name or hospital name",
    "type": "Hospital" or "Doctor",
    "specialization": "e.g. Cardiologist / Multi-Specialty Hospital / General Physician",
    "address": "Realistic area address in ${targetCity}",
    "phone": "Realistic Indian mobile number format",
    "rating": 4.1 to 5.0 (number),
    "experience": "e.g. 15 years" (only for doctors, omit for hospitals),
    "timings": "e.g. Mon-Sat: 9AM - 7PM",
    "availableFor": ["Consultation", "Emergency", "Lab Tests"] (pick relevant ones)
  }
]

Make the data realistic for ${targetCity}, India. Return ONLY the JSON array, no extra text.`;

    try {
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${FIND_DOCTOR_API_KEY}`,
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

      const jsonMatch = content.match(/\[[\s\S]*\]/);
      const cleanJson = jsonMatch ? jsonMatch[0] : content;

      const parsed = JSON.parse(cleanJson);
      setDoctors(parsed);
      localStorage.setItem("doctorReport", JSON.stringify(parsed));
    } catch (err) {
      setError("Failed to find doctors. Please try a different city name and try again.");
    }

    setIsLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    triggerSearch(city);
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
      pdf.save(`Medora-Doctor-Directory-${searched || "City"}-${Date.now()}.pdf`);
    } catch (err) {
      console.error("PDF download failed:", err);
    }
    setIsDownloading(false);
  };

  const handleCheckSymptoms = () => {
    navigate("/symptomchk");
  };

  const handleCustomDiet = () => {
    navigate("/custom-diet");
  };

  const specializationColor = (spec) => {
    if (spec?.toLowerCase().includes("hospital")) return "bg-blue-100 text-blue-700";
    if (spec?.toLowerCase().includes("cardio")) return "bg-red-100 text-red-700";
    if (spec?.toLowerCase().includes("neuro")) return "bg-purple-100 text-purple-700";
    if (spec?.toLowerCase().includes("ortho")) return "bg-orange-100 text-orange-700";
    if (spec?.toLowerCase().includes("pediatr")) return "bg-green-100 text-green-700";
    if (spec?.toLowerCase().includes("derm")) return "bg-pink-100 text-pink-700";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <section className="py-12 px-4">
      {/* Header */}
      <div className="max-w-screen-md mx-auto text-center mb-10">
        <h2 className="heading text-center">Find a Doctor & Hospital</h2>
        <p className="text__para text-center mt-2">
          Enter your city to discover the top specialized doctors and multi-specialty hospitals near you.
        </p>
      </div>

      {/* Search Form */}
      <div className="max-w-2xl mx-auto container mb-10">
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            placeholder="Enter city name (e.g. Pune, Mumbai, Delhi...)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="flex-1 p-4 rounded-xl text-[16px] border border-gray-200 focus:outline-none focus:border-primaryColor shadow-sm bg-white"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-primaryColor text-white px-8 py-4 rounded-xl font-[700] text-[16px] hover:bg-blue-700 transition-all duration-300 flex items-center gap-2 whitespace-nowrap shadow-md"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Searching...
              </>
            ) : (
              <>🔍 Search</>
            )}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-center font-semibold">
            {error}
          </div>
        )}
      </div>

      {/* Results */}
      {doctors.length > 0 && (
        <div className="max-w-5xl mx-auto container mt-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[22px] font-[700] text-headingColor">
              Top 10 Results in <span className="text-primaryColor">{searched}</span>
            </h3>
            <div className="flex items-center gap-4">
              <span className="bg-primaryColor text-white text-sm px-4 py-1.5 rounded-full font-semibold shadow-sm">
                {doctors.length} Found
              </span>
              <button
                onClick={downloadPDF}
                disabled={isDownloading}
                className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-xl font-[600] hover:bg-green-700 transition-all duration-300 shadow-md text-sm"
              >
                {isDownloading ? "Generating PDF..." : "⬇ Download Directory PDF"}
              </button>
            </div>
          </div>

          <div ref={reportRef} className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-2xl border border-gray-200">
            {doctors.map((doc, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-full bg-primaryColor flex items-center justify-center text-white font-bold text-[22px] flex-shrink-0 shadow-inner">
                      {doc.type === "Hospital" ? "🏥" : doc.name?.charAt(0)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-[17px] font-[700] text-headingColor leading-tight">{doc.name}</h4>
                        <div className="flex items-center gap-1 flex-shrink-0 bg-yellow-50 px-2 py-0.5 rounded-md border border-yellow-200">
                          <span className="text-yellow-500 font-bold">★</span>
                          <span className="text-[14px] font-semibold text-amber-900">{doc.rating}</span>
                        </div>
                      </div>

                      <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[12px] font-semibold ${specializationColor(doc.specialization)}`}>
                        {doc.specialization}
                      </span>

                      {doc.experience && (
                        <p className="text-[13px] text-gray-500 mt-1 font-medium">
                          🎓 {doc.experience} experience
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 space-y-2 text-[14px] text-textColor bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="flex items-start gap-2">
                      <span>📍</span>
                      <span className="font-medium">{doc.address}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span>📞</span>
                      <span className="font-medium">{doc.phone}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span>🕐</span>
                      <span className="font-medium">{doc.timings}</span>
                    </p>
                  </div>

                  {doc.availableFor && doc.availableFor.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {doc.availableFor.map((tag, i) => (
                        <span key={i} className="bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1 rounded-full text-[12px] font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button className="mt-6 w-full bg-primaryColor text-white py-3 rounded-xl text-[15px] font-[700] hover:bg-blue-700 transition-all duration-300 shadow-md">
                  Book Appointment
                </button>
              </div>
            ))}
          </div>

          {/* INTERLINKING ACTION BUTTONS / CARDS */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 shadow-md flex flex-col justify-between hover:shadow-lg transition-all duration-300">
              <div>
                <div className="text-[32px] mb-2">🩺</div>
                <h4 className="text-[20px] font-[700] text-headingColor mb-2">Experiencing Health Symptoms?</h4>
                <p className="text-textColor text-[15px] leading-6 mb-6">
                  Use our AI Healthcare Predict tool to analyze your symptoms, understand potential conditions, and get clinical triage before booking a doctor.
                </p>
              </div>
              <button
                onClick={handleCheckSymptoms}
                className="w-full bg-primaryColor text-white py-3.5 rounded-xl font-[700] text-[16px] hover:bg-blue-700 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>🩺</span> Analyze Symptoms First
              </button>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 shadow-md flex flex-col justify-between hover:shadow-lg transition-all duration-300">
              <div>
                <div className="text-[32px] mb-2">🥗</div>
                <h4 className="text-[20px] font-[700] text-headingColor mb-2">Want a Supporting Diet Plan?</h4>
                <p className="text-textColor text-[15px] leading-6 mb-6">
                  Generate a fully customized, goal-oriented daily meal plan to support your medical treatment and boost recovery.
                </p>
              </div>
              <button
                onClick={handleCustomDiet}
                className="w-full bg-green-600 text-white py-3.5 rounded-xl font-[700] text-[16px] hover:bg-green-700 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>✨</span> Get a Supporting Diet Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && doctors.length === 0 && !error && (
        <div className="max-w-2xl mx-auto container mt-16 text-center">
          <div className="text-[80px] mb-4">🏥</div>
          <h4 className="text-[20px] font-[700] text-headingColor mb-2">Search for Doctors Near You</h4>
          <p className="text-textColor">Enter any city name above to find top specialized doctors and hospitals in your area.</p>
        </div>
      )}
    </section>
  );
};

export default FindDoctor;

