import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import HashLoader from "react-spinners/HashLoader";
import { authContext } from "../context/AuthContext.jsx";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { dispatch } = useContext(authContext);

  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitHandler = (event) => {
    event.preventDefault();
    setLoading(true);

    // Simulate login without backend
    setTimeout(() => {
      // Clear out all previous session reports/data as requested by user
      localStorage.removeItem("symptomReport");
      localStorage.removeItem("dietReport");
      localStorage.removeItem("doctorReport");
      localStorage.removeItem("dietGoals");
      localStorage.removeItem("symptomAnswers");
      localStorage.removeItem("doctorSearchQuery");

      const regUserStr = localStorage.getItem("registeredUser");
      const regUser = regUserStr ? JSON.parse(regUserStr) : null;

      let activeUser;
      if (regUser && regUser.email === formData.email) {
        activeUser = regUser;
      } else {
        activeUser = {
          name: formData.email.split('@')[0],
          email: formData.email,
          gender: "other",
          bloodType: "O+",
          role: "patient",
          photo: ""
        };
      }

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { 
          user: activeUser, 
          token: "mock-token-" + Date.now(), 
          role: activeUser.role || "patient" 
        },
      });

      setLoading(false);
      toast.success(`Welcome back, ${activeUser.name}! 👋`);
      navigate("/home");
    }, 1000);
  };

  return (
    <section className="px-5 xl:px-0 py-12">
      <div className="max-w-[500px] mx-auto">
        <div className="text-center mb-8">
          <Link to="/home">
            <span className="text-[32px] font-[800] text-primaryColor tracking-tight">Medora</span>
          </Link>
          <h3 className="text-headingColor text-[22px] leading-9 font-bold mt-4">
            Hello, <span className="text-primaryColor">Welcome Back</span> 👋
          </h3>
          <p className="text-textColor mt-1">Sign in to your Medora account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8">
          <form onSubmit={submitHandler}>
            <div className="mb-5">
              <label className="block text-[14px] font-[600] text-headingColor mb-1">Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full py-3 px-4 border border-gray-200 rounded-xl focus:outline-none focus:border-primaryColor text-[15px] text-headingColor"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-[14px] font-[600] text-headingColor mb-1">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full py-3 px-4 border border-gray-200 rounded-xl focus:outline-none focus:border-primaryColor text-[15px] text-headingColor"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primaryColor text-white text-[16px] font-[700] rounded-xl py-3.5 flex items-center justify-center"
            >
              {loading ? <HashLoader size={25} color="#ffffff" /> : "Login"}
            </button>
            <p className="mt-5 text-textColor text-center text-[14px]">
              Don't have an account?{" "}
              <Link to="/register" className="text-primaryColor font-[600] ml-1">
                Sign Up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Login;
