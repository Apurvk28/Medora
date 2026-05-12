import React from "react";
import { HiStar } from "react-icons/hi";

const testimonials = [
  {
    name: "Kaustubh Patil",
    rating: 5,
    text: "Medora's AI health report was incredibly detailed. I described my symptoms and it gave me a full breakdown of possible conditions, what to watch out for, and exactly what steps to take. Saved me a lot of worry!",
  },
  {
    name: "Priya Sharma",
    rating: 5,
    text: "I used the Find a Doctor feature to search for specialists in Pune and within seconds had a list of top hospitals. It's like having a health concierge in your pocket. Absolutely love Medora!",
  },
  {
    name: "Rahul Deshmukh",
    rating: 5,
    text: "The AI symptom report I downloaded as a PDF was something I showed my doctor directly. It was so well-structured and comprehensive. My doctor was actually impressed with the level of detail!",
  },
  {
    name: "Sneha Joshi",
    rating: 5,
    text: "I was nervous about my symptoms and didn't know where to start. Medora analyzed everything in plain English and gave me clear, reassuring guidance on precautions and next steps. Brilliant platform!",
  },
  {
    name: "Amit Kulkarni",
    rating: 5,
    text: "Simple, fast, and genuinely useful. I typed my symptoms casually and got a medical-grade report. The PDF download feature made it easy to share with my family doctor. 10/10 would recommend.",
  },
  {
    name: "Megha Nair",
    rating: 5,
    text: "Finding doctors in my city was never this easy. Medora gave me a list of the top 10 specialists with all details. The Healthcare Predict feature is also excellent — it really puts your mind at ease.",
  },
  {
    name: "Arjun Mehta",
    rating: 5,
    text: "I suffered from recurring headaches and Medora's AI instantly suggested possible causes, dietary changes, and when to see a neurologist. Incredibly thoughtful and thorough analysis!",
  },
  {
    name: "Divya Rao",
    rating: 5,
    text: "As someone who gets anxious about health symptoms, Medora has been a game changer. It explains everything in simple language without causing panic. The PDF report feature is a cherry on top.",
  },
];

const TestimonialCard = ({ name, rating, text }) => (
  <div
    className="inline-block mx-4 py-6 px-6 rounded-2xl bg-white shadow border border-gray-100"
    style={{ minWidth: "320px", maxWidth: "340px", verticalAlign: "top" }}
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="w-11 h-11 rounded-full bg-primaryColor flex items-center justify-center text-white font-bold text-[18px] flex-shrink-0">
        {name.charAt(0)}
      </div>
      <div>
        <h4 className="text-[16px] font-[700] text-headingColor leading-tight">{name}</h4>
        <div className="flex items-center gap-[2px] mt-0.5">
          {Array(rating)
            .fill(null)
            .map((_, i) => (
              <HiStar key={i} className="text-yellowColor w-[14px] h-4" />
            ))}
        </div>
      </div>
    </div>
    <p className="text-[14px] leading-6 text-textColor font-[400] italic">"{text}"</p>
  </div>
);

const Testimonial = () => {
  return (
    <div className="mt-[30px] lg:mt-[55px] overflow-hidden w-full">
      <style>{`
        @keyframes marqueeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marqueeScroll 30s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="marquee-track">
        {[...testimonials, ...testimonials].map((t, i) => (
          <TestimonialCard key={i} name={t.name} rating={t.rating} text={t.text} />
        ))}
      </div>
    </div>
  );
};

export default Testimonial;
