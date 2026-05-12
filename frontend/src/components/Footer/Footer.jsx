import React from "react";
import { Link } from "react-router-dom";
import { AiFillInstagram, AiFillLinkedin, AiFillTwitterSquare } from "react-icons/ai";

const quickLinks01 = [
  { path: "/home", display: "Home" },
  { path: "/symptomchk", display: "Healthcare Predict" },
  { path: "/doctors", display: "Find a Doctor" },
  { path: "/contact", display: "Contact Us" },
];

const quickLinks02 = [
  { path: "/symptomchk", display: "AI Symptom Analysis" },
  { path: "/doctors", display: "Search Doctors by City" },
  { path: "/users/profile/me", display: "My Account" },
];

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="pb-16 pt-10">
      <div className="container">
        <div className="flex justify-between flex-col md:flex-row flex-wrap gap-[30px]">
          <div>
            <Link to="/home">
              <span className="text-[32px] font-[800] text-primaryColor tracking-tight">
                Medora
              </span>
            </Link>
            <p className="text-[16px] leading-7 font-[400] text-textColor mt-4 max-w-[250px]">
              AI-powered healthcare platform helping patients live healthier, smarter lives.
            </p>
            <p className="text-[14px] leading-6 font-[400] text-textColor mt-4">
              Copyright &copy; {year} Medora. All rights reserved.
            </p>
          </div>

          <div>
            <h2 className="text-[20px] leading-[30px] font-[700] mb-6 text-headingColor">
              Quick Links
            </h2>
            <ul>
              {quickLinks01.map((item, index) => (
                <li key={index} className="mb-4">
                  <Link
                    to={item.path}
                    className="text-[16px] leading-7 font-[400] text-textColor hover:text-primaryColor"
                  >
                    {item.display}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-[20px] leading-[30px] font-[700] mb-6 text-headingColor">
              Our Services
            </h2>
            <ul>
              {quickLinks02.map((item, index) => (
                <li key={index} className="mb-4">
                  <Link
                    to={item.path}
                    className="text-[16px] leading-7 font-[400] text-textColor hover:text-primaryColor"
                  >
                    {item.display}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-[20px] leading-[30px] font-[700] mb-6 text-headingColor">
              About Medora
            </h2>
            <p className="text-[15px] leading-6 text-textColor font-[400] max-w-[220px]">
              Medora uses advanced AI to help you understand your health symptoms and find the right medical professionals near you.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
