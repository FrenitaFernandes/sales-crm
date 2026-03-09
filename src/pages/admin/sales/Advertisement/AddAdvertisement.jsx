import { useState } from "react";
import axios from "axios";

const PREFERENCE_IMAGE_MAP = {
  "Data Logger IIoT 4.0": "/DataLogger.png",
  "Cloud PLC 4.0": "/CloudPLC.png",
  "Biometric Authentication": "/Biometric.png",
  "HMI & Display Board": "/HMI.png",
  "RFID Reader": "/RFID.png",
  "R-LiFi": "/R-LiFi.png",
  "Vibration Sensor": "/VibrationSensor.png",
  "Data Acquisition System": "/DataAcquistion.png",
  "DAS Datalogger": "/DAS_Datalogger.png"
};

export default function AddAdvertisement() {

  const [form, setForm] = useState({
    productName: "",
    description: "",
    targetArea: "",
    targetAudience: "",
    date: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      thumbnail: PREFERENCE_IMAGE_MAP[form.targetAudience] || ""
    };

    try {

      await axios.post(
        "http://localhost:5000/api/admin/advertisement",
        payload
      );

      setMessage("Advertisement added successfully!");

      setForm({
        productName: "",
        description: "",
        targetArea: "",
        targetAudience: "",
        date: "",
      });

    } catch (err) {

      console.error(err);
      setMessage("Failed to add advertisement");

    }
  };

  return (
    <div className="p-4 bg-white shadow rounded">

      <h2 className="text-2xl font-bold mb-4">
        Add Advertisement
      </h2>

      {message && (
        <div className="alert alert-info mb-3">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>

        {/* PRODUCT / DATE */}

        <div className="row">

          <div className="col-md-4 mb-3">
            <label className="form-label">
              Product Name
            </label>

            <input
              type="text"
              name="productName"
              className="form-control"
              value={form.productName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-4 mb-3">
            <label className="form-label">
              Date
            </label>

            <input
              type="date"
              name="date"
              className="form-control"
              value={form.date}
              onChange={handleChange}
              required
            />
          </div>

        </div>


        {/* DESCRIPTION */}

        <div className="mb-3">

          <label className="form-label">
            Description
          </label>

          <textarea
            name="description"
            className="form-control"
            rows="3"
            value={form.description}
            onChange={handleChange}
          />

        </div>

        {/* TARGET AREA / TARGET AUDIENCE */}

        <div className="row">

          {/* TARGET AREA */}

          <div className="col-md-4 mb-3">

            <label className="form-label">
              Target Area
            </label>

            <select
              name="targetArea"
              className="form-control"
              value={form.targetArea}
              onChange={handleChange}
            >

              <option value="">Select Country</option>
              <option value="India">India</option>
              <option value="USA">USA</option>
              <option value="Europe">Europe</option>
              <option value="Middle East">Middle East</option>
              <option value="Asia">Asia</option>
              <option value="Global">Global</option>

            </select>

          </div>


          {/* TARGET AUDIENCE */}

          <div className="col-md-4 mb-3">

            <label className="form-label">
              Target Audience
            </label>

            <select
              name="targetAudience"
              className="form-control"
              value={form.targetAudience}
              onChange={handleChange}
            >

              <option value="">Select Industry</option>

              <option value="Data Logger IIoT 4.0">Data Logger IIoT 4.0</option>
              <option value="Cloud PLC 4.0">Cloud PLC 4.0</option>
              <option value="Biometric Authentication">Biometric Authentication</option>
              <option value="HMI & Display Board">HMI & Display Board</option>
              <option value="RFID Reader">RFID Reader</option>
              <option value="R-LiFi">R-LiFi</option>
              <option value="Vibration Sensor">Vibration Sensor</option>
              <option value="Data Acquisition System">Data Acquisition System</option>
              <option value="DAS Datalogger">DAS Datalogger</option>

            </select>

          </div>

        </div>


        {/* SUBMIT */}

        <button
          type="submit"
          className="btn btn-primary"
        >
          Submit Advertisement
        </button>

      </form>

    </div>
  );
}