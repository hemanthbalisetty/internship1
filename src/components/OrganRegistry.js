import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import axios from "axios";


function Registry() {
  const [view, setView] = useState("home");

  const renderContent = () => {
    if (view === "donor") return <RegistrationDonor setView={setView} />;
    if (view === "recipient") return <RegistrationRecipient setView={setView} />;

    return (
      <div className="container-fluid vh-100 d-flex">
        {/* Donor Section */}
        <div className="col-6 d-flex flex-column justify-content-center align-items-center bg-light border-end">
          <h2 className="mb-4">Donor</h2>
          <button className="btn btn-primary" onClick={() => setView("donor")}>
            Register as Donor
          </button>
        </div>

        {/* Recipient Section */}
        <div className="col-6 d-flex flex-column justify-content-center align-items-center bg-white">
          <h2 className="mb-4">Recipient</h2>
          <button className="btn btn-success" onClick={() => setView("recipient")}>
            Register as Recipient
          </button>
        </div>
      </div>
    );
  };

  return <div>{renderContent()}</div>;
}

function RegistrationDonor({ setView }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    location: "",
    email: "",
    phone: "",
    donationType: "",
    bloodType: "",
    organ: "",
    medicalHistory: "",
    urgency: "",
    consent1: false,
    consent2: false,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let updatedFormData = {
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    };

    if (name === "donationType") {
      updatedFormData.bloodType = "";
      updatedFormData.organ = "";
    }

    setFormData(updatedFormData);
  };

  const validateStep = () => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.name || !/^[A-Za-z\s]+$/.test(formData.name)) {
        newErrors.name = "Valid name is required";
      }
      if (!formData.age) newErrors.age = "Age is required";
      if (!formData.gender) newErrors.gender = "Gender is required";
      if (!formData.email || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
        newErrors.email = "Valid email is required";
      }
      if (!formData.phone || !/^\d{10}$/.test(formData.phone)) {
        newErrors.phone = "Phone must be 10 digits";
      }
    } else if (step === 2) {
      if (!formData.donationType) newErrors.donationType = "Donation type is required";
      if ((formData.donationType === "Blood" || formData.donationType === "Both") && !formData.bloodType) {
        newErrors.bloodType = "Blood type is required";
      }
      if ((formData.donationType === "Organ" || formData.donationType === "Both") && !formData.organ) {
        newErrors.organ = "Organ is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);




  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState(""); 

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://${process.env.REACT_APP_API_URL}/api/donors", formData);

      if (response.status === 201) {
        showPopup("✅ Donor registered successfully!", "success");
        setTimeout(() => setView("home"), 3000);
      } else {
        showPopup("❌ Registration failed. Please try again.", "error");
      }
    } catch (error) {
      console.error("Submission error:", error);
      showPopup("⚠️ An error occurred while submitting the form.", "error");
    }
  };

  const showPopup = (msg, type) => {
    setPopupMessage(msg);
    setPopupType(type);

    // Automatically clear the popup after 3s
    setTimeout(() => {
      setPopupMessage("");
      setPopupType("");
    }, 3000);
  };

  const isBloodEnabled = ["Blood", "Organ", "Both"].includes(formData.donationType);
  const isOrganEnabled = ["Organ", "Both"].includes(formData.donationType);

  return (
    <div className="bg-white text-dark min-vh-100">
      <header className="bg-success text-white d-flex justify-content-between align-items-center px-4" style={{ height: "80px" }}>
        <button className="btn btn-light text-success" onClick={() => setView("home")}>
          &lt; Back
        </button>
        <h1 className="h4 m-0">Donor</h1>
        <button className="btn btn-light text-success" onClick={() => alert("Saved Draft")}>
          Save Draft
        </button>
      </header>
      <style>{`
  .popup-message {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    border-radius: 12px;
    color: white;
    font-weight: 600;
    z-index: 9999;
    opacity: 0;
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.2);
    animation: fadeInOut 3s forwards;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .popup-success {
    background-color: rgba(40, 167, 69, 0.85); /* green with transparency */
  }

  .popup-error {
    background-color: rgba(220, 53, 69, 0.85); /* red with transparency */
  }

  @keyframes fadeInOut {
    0% { opacity: 0; transform: translateY(-20px); }
    10% { opacity: 1; transform: translateY(0); }
    90% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-20px); }
  }
`}</style>
      {popupMessage && (
        <div className={`popup-message popup-${popupType}`}>
          {popupMessage}
        </div>
      )}{popupMessage && (
        <div className={`popup-message popup-${popupType}`}>
          {popupMessage}
        </div>
      )}
      <form onSubmit={handleSubmit} className="p-4">
        <div className="progress mb-4" style={{ height: "10px" }}>
          <div className="progress-bar bg-success" role="progressbar" style={{ width: `${step * 33.3}%` }}></div>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="card p-4 mb-4">
            <h2 className="text-success">Personal Information</h2>
            {/* Name */}
            <div className="row mb-2">
              <label className="col-sm-1 col-form-label">Name:</label>
              <div className="col-sm-6">
                <input name="name" value={formData.name} onChange={handleChange} className="form-control" />
                {errors.name && <div className="text-danger">{errors.name}</div>}
              </div>
            </div>
            {/* Age + Gender */}
            <div className="row mb-2">
              <label className="col-sm-1 col-form-label">Age:</label>
              <div className="col-sm-3">
                <input name="age" type="number" value={formData.age} onChange={handleChange} className="form-control" />
                {errors.age && <div className="text-danger">{errors.age}</div>}
              </div>
              <label className="col-sm-1 col-form-label">Gender:</label>
              <div className="col-sm-2">
                <select name="gender" value={formData.gender} onChange={handleChange} className="form-select">
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && <div className="text-danger">{errors.gender}</div>}
              </div>
            </div>
            {/* Email + Phone */}
            <div className="row mb-2">
              <label className="col-sm-1 col-form-label">Email:</label>
              <div className="col-sm-4">
                <input name="email" type="email" value={formData.email} onChange={handleChange} className="form-control" />
                {errors.email && <div className="text-danger">{errors.email}</div>}
              </div>
              <label className="col-sm-1 col-form-label">Phone:</label>
              <div className="col-sm-2">
                <input name="phone" value={formData.phone} onChange={handleChange} className="form-control" />
                {errors.phone && <div className="text-danger">{errors.phone}</div>}
              </div>
            </div>
            {/* Location */}
            <div className="row mb-2">
              <label className="col-sm-1 col-form-label">Location:</label>
              <div className="col-sm-10">
                <input name="location" value={formData.location} onChange={handleChange} className="form-control" />
              </div>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="card p-4 mb-4">
            <h2 className="text-primary">Medical Information</h2>
            <div className="row mb-3">
              <label className="col-sm-2 col-form-label">Donation Type:</label>
              <div className="col-sm-4">
                <select name="donationType" value={formData.donationType} onChange={handleChange} className="form-select">
                  <option value="">Select</option>
                  <option value="Blood">Blood</option>
                  <option value="Organ">Organ</option>
                  <option value="Both">Both</option>
                </select>
                {errors.donationType && <div className="text-danger">{errors.donationType}</div>}
              </div>
            </div>

            <div className="row mb-2">
              <label className="col-sm-1 col-form-label">Blood Type:</label>
              <div className="col-sm-2">
                <select
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleChange}
                  className="form-select"
                  disabled={!isBloodEnabled}
                >
                  <option value="">Select</option>
                  {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(
                    (b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    )
                  )}
                </select>
                {errors.bloodType && (
                  <div className="text-danger">{errors.bloodType}</div>
                )}
              </div>
              <label className="col-sm-1 col-form-label">Organ:</label>
              <div className="col-sm-2">
                <select
                  name="organ"
                  value={formData.organ}
                  onChange={handleChange}
                  className="form-select"
                  disabled={!isOrganEnabled}
                >
                  <option value="">Select</option>
                  <option value="Heart">Heart</option>
                  <option value="Kidney">Kidney</option>
                  <option value="Liver">Liver</option>
                  <option value="Pancreas">Pancreas</option>
                </select>
                {errors.organ && (
                  <div className="text-danger">{errors.organ}</div>
                )}
              </div>
            </div>

            <div className="row mb-2">
              <label className="col-sm-1 col-form-label">Medical History:</label>
              <div className="col-sm-10">
                <textarea
                  name="medicalHistory"
                  value={formData.medicalHistory}
                  onChange={handleChange}
                  className="form-control"
                  style={{ height: "100px" }}
                />
              </div>
            </div>

            <div className="row mb-1 mt-1">
              <label className="col-sm-1 col-form-label">Urgency:</label>
              <div className="col-sm-4">
                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">Select</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="card p-4 mb-4">
            <h2 className="text-success">Consent & Verification</h2>
            <div className="form-check">
              <input
                type="checkbox"
                name="consent1"
                className="form-check-input"
                checked={formData.consent1}
                onChange={handleChange}
              />
              <label className="form-check-label">
                I consent to share my data with hospitals for matching.
              </label>
            </div>
            <div className="form-check">
              <input
                type="checkbox"
                name="consent2"
                className="form-check-input"
                checked={formData.consent2}
                onChange={handleChange}
              />
              <label className="form-check-label">
                I agree to terms and privacy policy.
              </label>
            </div>
          </div>
        )}

        <div className="d-flex align-items-center mt-4">
          {step > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="btn btn-secondary me-2"
            >
              Previous
            </button>
          )}
          {step < 3 && (
            <button
              type="button"
              onClick={nextStep}
              className="btn btn-success me-2"
            >
              Next
            </button>
          )}
          {step === 3 && (
            <button
              type="submit"
              className="btn btn-success me-2"
              onClick={handleSubmit}
            >
              Submit
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function RegistrationRecipient({ setView }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    location: "",
    email: "",
    phone: "",
    donationType: "",
    bloodType: "",
    organ: "",
    medicalHistory : "",
    urgency: "",
    consent1: false,
    consent2: false,
    verificationCode: "",
  });
  const [errors, setErrors] = useState({});
  const [otpSent, setOtpSent] = useState(false);
  const [serverOtp, setServerOtp] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let updatedFormData = {
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    };

    if (name === "donationType") {
      updatedFormData.bloodType = "";
      updatedFormData.organ = "";
    }

    setFormData(updatedFormData);
  };

  const validateStep = () => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.name || !/^[A-Za-z\s]+$/.test(formData.name)) {
        newErrors.name = "Valid name is required";
      }
      if (!formData.age) newErrors.age = "Age is required";
      if (!formData.gender) newErrors.gender = "Gender is required";
      if (!formData.email || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
        newErrors.email = "Valid email is required";
      }
      if (!formData.phone || !/^\d{10}$/.test(formData.phone)) {
        newErrors.phone = "Phone must be 10 digits";
      }
    } else if (step === 2) {
      if (!formData.donationType) newErrors.donationType = "Donation type is required";
      if ((formData.donationType === "Blood" || formData.donationType === "Both") && !formData.bloodType) {
        newErrors.bloodType = "Blood type is required";
      }
      if ((formData.donationType === "Organ" || formData.donationType === "Both") && !formData.organ) {
        newErrors.organ = "Organ is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const sendOTP = async () => {
    try {
      const response = await axios.post("http://${process.env.REACT_APP_API_URL}/send-otp", {
        phone: formData.phone,
      });

      if (response.data.success) {
        setOtpSent(true);
        setServerOtp(response.data.otp); // Only for testing!
        alert("OTP sent successfully!");
      } else {
        alert("Failed to send OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert("Error sending OTP");
    }
  };


  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState(""); // "success" or "error"

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://${process.env.REACT_APP_API_URL}/api/recipients", formData);

      if (response.status === 201) {
        showPopup(" Recipient registered successfully!", "success");
        setTimeout(() => setView("home"), 3000);
      } else {
        showPopup(" Submission failed. Please try again.", "error");
      }
    } catch (error) {
      console.error("Error submitting form:", error.response ? error.response.data : error.message);
      showPopup("⚠️ Something went wrong while submitting the form.", "error");
    }
  };

  const showPopup = (msg, type) => {
    setPopupMessage(msg);
    setPopupType(type);
    setTimeout(() => {
      setPopupMessage("");
      setPopupType("");
    }, 3000);
  };

  const isBloodEnabled = ["Blood", "Organ", "Both"].includes(formData.donationType);
  const isOrganEnabled = ["Organ", "Both"].includes(formData.donationType);

  return (
    <div className="bg-white text-dark min-vh-100">
      <header className="bg-success text-white d-flex justify-content-between align-items-center px-4" style={{ height: "80px" }}>
        <button className="btn btn-light text-success" onClick={() => setView("home")}>
          &lt; Back
        </button>
        <h1 className="h4 m-0">Recipient</h1>
        <button className="btn btn-light text-success" onClick={() => alert("Saved Draft")}>
          Save Draft
        </button>
      </header>
      <style>{`
  .popup-message {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    border-radius: 12px;
    color: white;
    font-weight: 600;
    z-index: 9999;
    opacity: 0;
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.2);
    animation: fadeInOut 3s forwards;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .popup-success {
    background-color: rgba(40, 167, 69, 0.85); /* green with transparency */
  }

  .popup-error {
    background-color: rgba(220, 53, 69, 0.85); /* red with transparency */
  }

  @keyframes fadeInOut {
    0% { opacity: 0; transform: translateY(-20px); }
    10% { opacity: 1; transform: translateY(0); }
    90% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-20px); }
  }
`}</style>

      {/* Popup display */}
      {popupMessage && (
        <div className={`popup-message popup-${popupType}`}>
          {popupMessage}
        </div>
      )}
      <form onSubmit={handleSubmit} className="p-4">
        <div className="progress mb-4" style={{ height: "10px" }}>
          <div className="progress-bar bg-success" role="progressbar" style={{ width: `${step * 33.3}%` }}></div>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="card p-4 mb -4">
            <h2 className="text-success">Personal Information</h2>
            {/* Name */}
            <div className="row mb-2">
              <label className="col-sm-1 col-form-label">Name:</label>
              <div className="col-sm-6">
                <input name="name" value={formData.name} onChange={handleChange} className="form-control" />
                {errors.name && <div className="text-danger">{errors.name}</div>}
              </div>
            </div>
            {/* Age + Gender */}
            <div className="row mb-2">
              <label className="col-sm-1 col-form-label">Age:</label>
              <div className="col-sm-3">
                <input name="age" type="number" value={formData.age} onChange={handleChange} className="form-control" />
                {errors.age && <div className="text-danger">{errors.age}</div>}
              </div>
              <label className="col-sm-1 col-form-label">Gender:</label>
              <div className="col-sm-2">
                <select name="gender" value={formData.gender} onChange={handleChange} className="form-select">
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && <div className="text-danger">{errors.gender}</div>}
              </div>
            </div>
            {/* Email + Phone */}
            <div className="row mb-2">
              <label className="col-sm-1 col-form-label">Email:</label>
              <div className="col-sm-4">
                <input name="email" type="email" value={formData.email} onChange={handleChange} className="form-control" />
                {errors.email && <div className="text-danger">{errors.email}</div>}
              </div>
              <label className="col-sm-1 col-form-label">Phone:</label>
              <div className="col-sm-2">
                <input name="phone" value={formData.phone} onChange={handleChange} className="form-control" />
                {errors.phone && <div className="text-danger">{errors.phone}</div>}
              </div>
            </div>
            {/* Location */}
            <div className="row mb-2">
              <label className="col-sm-1 col-form-label">Location:</label>
              <div className="col-sm-10">
                <input name="location" value={formData.location} onChange={handleChange} className="form-control" />
              </div>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="card p-4 mb-4">
            <h2 className="text-primary">Medical Information</h2>
            <div className="row mb-3">
              <label className="col-sm-2 col-form-label">Donation Type:</label>
              <div className="col-sm-4">
                <select name="donationType" value={formData.donationType} onChange={handleChange} className="form-select">
                  <option value="">Select</option>
                  <option value="Blood">Blood</option>
                  <option value="Organ">Organ</option>
                  <option value="Both">Both</option>
                </select>
                {errors.donationType && <div className="text-danger">{errors.donationType}</div>}
              </div>
            </div>

            <div className="row mb-2">
              <label className="col-sm-1 col-form-label">Blood Type:</label>
              <div className="col-sm-2">
                <select
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleChange}
                  className="form-select"
                  disabled={!isBloodEnabled}
                >
                  <option value="">Select</option>
                  {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(
                    (b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    )
                  )}
                </select>
                {errors.bloodType && <div className="text-danger">{errors.bloodType}</div>}
              </div>
              <label className="col-sm-1 col-form-label">Organ:</label>
              <div className="col-sm-2">
                <select
                  name="organ"
                  value={formData.organ}
                  onChange={handleChange}
 className="form-select"
                  disabled={!isOrganEnabled}
                >
                  <option value="">Select</option>
                  <option value="Heart">Heart</option>
                  <option value="Kidney">Kidney</option>
                  <option value="Liver">Liver</option>
                  <option value="Pancreas">Pancreas</option>
                </select>
                {errors.organ && <div className="text-danger">{errors.organ}</div>}
              </div>
            </div>

            <div className="row mb-2">
              <label className="col-sm-1 col-form-label">Medical History:</label>
              <div className="col-sm-10">
                <textarea
                  name="medicalHistory"
                  value={formData.medicalHistory}
                  onChange={handleChange}
                  className="form-control"
                  style={{ height: "100px" }}
                />
              </div>
            </div>

            <div className="row mb-1 mt-1">
              <label className="col-sm-1 col-form-label">Urgency:</label>
              <div className="col-sm-4">
                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">Select</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="card p-4 mb-4">
            <h2 className="text-success">Consent & Verification</h2>
            <div className="form-check">
              <input
                type="checkbox"
                name="consent1"
                className="form-check-input"
                checked={formData.consent1}
                onChange={handleChange}
              />
              <label className="form-check-label">
                I consent to share my data with hospitals for matching.
              </label>
            </div>
            <div className="form-check">
              <input
                type="checkbox"
                name="consent2"
                className="form-check-input"
                checked={formData.consent2}
                onChange={handleChange}
              />
              <label className="form-check-label">
                I agree to terms and privacy policy.
              </label>
            </div>
          </div>
        )}

        <div className="d-flex align-items-center mt-4">
          {step > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="btn btn-secondary me-2"
            >
              Previous
            </button>
          )}
          {step < 3 && (
            <button
              type="button"
              onClick={nextStep}
              className="btn btn-success me-2"
            >
              Next
            </button>
          )}
          {step === 3 && (
            <button
              type="submit"
              className="btn btn-success me-2"
              onClick={handleSubmit}
            >
              Submit
            </button>
          )}
        </div>
      </form>
    </div>
  );
}




export default Registry;