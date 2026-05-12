import React, { useState } from "react";
import { FIND_DOCTOR_API_KEY, GROQ_API_URL, GROQ_MODEL } from "../../configs/apiKeys";

const FindDoctor = () => {
  const [city, setCity] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!city.trim()) return;
    setIsLoading(true);
    setError("");
    setDoctors([]);
    setSearched(city);

    const prompt = `You are a medical directory AI for Medora Health Platform. Generate a realistic list of top 10 doctors and hospitals available in ${city}, India. Include a mix of multi-specialty hospitals and individual specialist doctors.

Return ONLY a valid JSON array with exactly 10 items in this structure:
[
  {
    "name": "Full name or hospital name",
    "type": "Hospital" or "Doctor",
    "specialization": "e.g. Cardiologist / Multi-Specialty Hospital / General Physician",
    "address": "Realistic area address in ${city}",
    "phone": "Realistic Indian mobile number format",
    "rating": 4.1 to 5.0 (number),
    "experience": "e.g. 15 years" (only for doctors, omit for hospitals),
    "timings": "e.g. Mon-Sat: 9AM - 7PM",
    "availableFor": ["Consultation", "Emergency", "Lab Tests"] (pick relevant ones)
  }
]

Make the data realistic for ${city}, India. Return ONLY the JSON array, no extra text.`;

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
          max_tokens: 2000,
        }),
      });

      if (!response.ok) throw new Error("API request failed");

      const data = await response.json();
      const content = data.choices[0].message.content;

      // Extract JSON from potential markdown blocks
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      const cleanJson = jsonMatch ? jsonMatch[0] : content;

      const parsed = JSON.parse(cleanJson);
      setDoctors(parsed);
    } catch (err) {
      setError("Failed to find doctors. Please try a different city name and try again.");
    }

    setIsLoading(false);
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
    <section className="py-12">
      {/* Header */}
      <div className="px-4 mx-auto max-w-screen-md text-center mb-10">
        <h2 className="heading text-center">Find a Doctor</h2>
        <p className="text__para text-center mt-2">
          Enter your city to discover the top doctors and hospitals near you.
        </p>
      </div>

      {/* Search Form */}
      <div className="container max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            placeholder="Enter city name (e.g. Pune, Mumbai, Delhi...)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="flex-1 p-4 rounded-xl text-[16px] border border-gray-200 focus:outline-none focus:border-primaryColor shadow-sm"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-primaryColor text-white px-8 py-4 rounded-xl font-[700] text-[16px] hover:bg-blue-700 transition-all duration-300 flex items-center gap-2 whitespace-nowrap"
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
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-center">
            {error}
          </div>
        )}
      </div>

      {/* Results */}
      {doctors.length > 0 && (
        <div className="container max-w-5xl mx-auto mt-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[22px] font-[700] text-headingColor">
              Top 10 Results in <span className="text-primaryColor">{searched}</span>
            </h3>
            <span className="bg-primaryColor text-white text-sm px-3 py-1 rounded-full font-semibold">
              {doctors.length} Found
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {doctors.map((doc, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-full bg-primaryColor flex items-center justify-center text-white font-bold text-[22px] flex-shrink-0">
                    {doc.type === "Hospital" ? "🏥" : doc.name?.charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-[17px] font-[700] text-headingColor leading-tight">{doc.name}</h4>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="text-yellow-500">★</span>
                        <span className="text-[14px] font-semibold text-gray-700">{doc.rating}</span>
                      </div>
                    </div>

                    <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-[12px] font-semibold ${specializationColor(doc.specialization)}`}>
                      {doc.specialization}
                    </span>

                    {doc.experience && (
                      <p className="text-[13px] text-gray-500 mt-1">
                        🎓 {doc.experience} experience
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-[14px] text-textColor">
                  <p className="flex items-start gap-2">
                    <span>📍</span>
                    <span>{doc.address}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span>📞</span>
                    <span>{doc.phone}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span>🕐</span>
                    <span>{doc.timings}</span>
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

                <button className="mt-4 w-full bg-primaryColor text-white py-2.5 rounded-xl text-[14px] font-[600] hover:bg-blue-700 transition-all duration-300">
                  Book Appointment
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && doctors.length === 0 && !error && (
        <div className="container max-w-2xl mx-auto mt-16 text-center">
          <div className="text-[80px] mb-4">🏥</div>
          <h4 className="text-[20px] font-[700] text-headingColor mb-2">Search for Doctors Near You</h4>
          <p className="text-textColor">Enter any city name above to find top doctors and hospitals in your area.</p>
        </div>
      )}
    </section>
  );
};

export default FindDoctor;
