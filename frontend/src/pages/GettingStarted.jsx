import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { authStateListener } from "../Firebase";
import "../styles/GettingStarted.css";

const GettingStarted = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [occupation, setOccupation] = useState("");
  const [experience, setExperience] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = authStateListener((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, navigate, loading]);

  useEffect(() => {
    if (!loading && user) {
      const checkGettingStarted = async () => {
        try {
          const response = await axios.get(
            `http://localhost:5000/api/users/${user.uid}`
          );
          if (response.data.submittedGettingStarted) {
            navigate("/");
          }
        } catch (error) {
          console.error("Error calling data:", error.message);
        }
      };

      checkGettingStarted();
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleGettingStarted = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/users/${user.uid}`, {
        submittedGettingStarted: true,
        firstName: firstName,
        lastName: lastName,
        gender: gender,
        ageRange: ageRange,
        occupation: occupation,
        experience: experience,
      });
      navigate("/");
    } catch (error) {
      console.error("Error updating data:", error.message);
    }
  };

  return (
    <div className="page-getting-started">
      <h2>Getting Started</h2>
      <form
        className="getting-started-form"
        onSubmit={handleGettingStarted}
        noValidate
      >
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="First Name"
          required
        />
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Last Name"
          required
        />

        <fieldset>
          <legend>Gender:</legend>
          <label>
            <input
              type="radio"
              name="gender"
              value="male"
              checked={gender === "male"}
              onChange={(e) => setGender(e.target.value)}
              required
            />
            Male
          </label>
          <label>
            <input
              type="radio"
              name="gender"
              value="female"
              checked={gender === "female"}
              onChange={(e) => setGender(e.target.value)}
              required
            />
            Female
          </label>
          <label>
            <input
              type="radio"
              name="gender"
              value="others"
              checked={gender === "others"}
              onChange={(e) => setGender(e.target.value)}
              required
            />
            Others
          </label>
        </fieldset>

        <label htmlFor="ageRange">Age Range:</label>
        <select
          id="ageRange"
          value={ageRange}
          onChange={(e) => setAgeRange(e.target.value)}
          required
        >
          <option value="">Select Age Range</option>
          <option value="-34">-34</option>
          <option value="35-44">35-44</option>
          <option value="45-54">45-54</option>
          <option value="55-">55-</option>
        </select>

        <label htmlFor="occupation">Occupation:</label>
        <select
          id="occupation"
          value={occupation}
          onChange={(e) => setOccupation(e.target.value)}
          required
        >
          <option value="">Select Occupation</option>
          <option value="ICT">ICT</option>
        </select>

        <fieldset>
          <legend>Experience:</legend>
          <label>
            <input
              type="radio"
              name="experience"
              value="NEW"
              checked={experience === "NEW"}
              onChange={(e) => setExperience(e.target.value)}
              required
            />
            NEW
          </label>
          <label>
            <input
              type="radio"
              name="experience"
              value="EXPERIENCED"
              checked={experience === "EXPERIENCED"}
              onChange={(e) => setExperience(e.target.value)}
              required
            />
            EXPERIENCED
          </label>
        </fieldset>

        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default GettingStarted;
