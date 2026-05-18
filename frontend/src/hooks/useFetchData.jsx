import { useEffect, useState } from "react";
import { token } from "../config.js";

const useFetchData = (url) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (url.includes("/users/profile/me")) {
      setLoading(true);
      setTimeout(() => {
        const storedUser = localStorage.getItem("user");
        let parsedUser = storedUser ? JSON.parse(storedUser) : null;
        if (!parsedUser) {
          parsedUser = {
            name: "Guest Patient",
            email: "patient@example.com",
            gender: "other",
            bloodType: "O+",
            photo: "",
          };
        }
        setData(parsedUser);
        setLoading(false);
      }, 300);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.message + "🤢");
        }
        setData(result.data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        setError(err.message);
      }
    };
    fetchData();
  }, [url]);
  return { data, loading, error };
};

export default useFetchData;
