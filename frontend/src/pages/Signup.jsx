import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import HashLoader from "react-spinners/HashLoader";

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    gender: "",
    role: "patient",
  });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitHandler = (event) => {
    event.preventDefault();
    setLoading(true);

    // Simulate signup without backend
    setTimeout(() => {
      setLoading(false);
      toast.success("Account created successfully! Please login.");
      navigate("/login");
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
            Create your <span className="text-primaryColor">account</span>
          </h3>
          <p className="text-textColor mt-1">Join Medora and take control of your health</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8">
          <form onSubmit={submitHandler}>
            <div className="mb-5">
              <label className="block text-[14px] font-[600] text-headingColor mb-1">Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full py-3 px-4 border border-gray-200 rounded-xl focus:outline-none focus:border-primaryColor text-[15px] text-headingColor"
                required
              />
            </div>
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
            <div className="mb-5">
              <label className="block text-[14px] font-[600] text-headingColor mb-1">Password</label>
              <input
                type="password"
                placeholder="Create a password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full py-3 px-4 border border-gray-200 rounded-xl focus:outline-none focus:border-primaryColor text-[15px] text-headingColor"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-[14px] font-[600] text-headingColor mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full py-3 px-4 border border-gray-200 rounded-xl focus:outline-none focus:border-primaryColor text-[15px] text-headingColor bg-white"
                required
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <button
              disabled={loading}
              type="submit"
              className="w-full bg-primaryColor text-white text-[16px] font-[700] rounded-xl py-3.5 flex items-center justify-center"
            >
              {loading ? <HashLoader size={25} color="#ffffff" /> : "Create Account"}
            </button>
            <p className="mt-5 text-textColor text-center text-[14px]">
              Already have an account?{" "}
              <Link to="/login" className="text-primaryColor font-[600] ml-1">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Signup;
