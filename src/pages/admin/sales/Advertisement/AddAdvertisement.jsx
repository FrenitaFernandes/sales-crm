import { useState } from "react";
import axios from "axios";

const PRODUCT_IMAGE_OPTIONS = [
  {
    label: "Industrial Sensor",
    value:
      "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='720' height='420'%3E%3Crect width='100%25' height='100%25' fill='%231F4E79'/%3E%3Ctext x='50%25' y='46%25' fill='white' font-size='46' font-family='Arial' text-anchor='middle'%3EIndustrial Sensor%3C/text%3E%3Ctext x='50%25' y='58%25' fill='white' font-size='24' font-family='Arial' text-anchor='middle'%3EProduct Visual%3C/text%3E%3C/svg%3E"
  },
  {
    label: "Smart Building Controller",
    value:
      "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='720' height='420'%3E%3Crect width='100%25' height='100%25' fill='%232E7D32'/%3E%3Ctext x='50%25' y='46%25' fill='white' font-size='42' font-family='Arial' text-anchor='middle'%3ESmart Building Controller%3C/text%3E%3Ctext x='50%25' y='58%25' fill='white' font-size='24' font-family='Arial' text-anchor='middle'%3EProduct Visual%3C/text%3E%3C/svg%3E"
  },
  {
    label: "Factory Automation Suite",
    value:
      "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='720' height='420'%3E%3Crect width='100%25' height='100%25' fill='%236D4C41'/%3E%3Ctext x='50%25' y='46%25' fill='white' font-size='42' font-family='Arial' text-anchor='middle'%3EFactory Automation Suite%3C/text%3E%3Ctext x='50%25' y='58%25' fill='white' font-size='24' font-family='Arial' text-anchor='middle'%3EProduct Visual%3C/text%3E%3C/svg%3E"
  },
  {
    label: "Energy Monitoring Device",
    value:
      "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='720' height='420'%3E%3Crect width='100%25' height='100%25' fill='%235E35B1'/%3E%3Ctext x='50%25' y='46%25' fill='white' font-size='42' font-family='Arial' text-anchor='middle'%3EEnergy Monitoring Device%3C/text%3E%3Ctext x='50%25' y='58%25' fill='white' font-size='24' font-family='Arial' text-anchor='middle'%3EProduct Visual%3C/text%3E%3C/svg%3E"
  }
];

export default function AddAdvertisement() {

  const [form, setForm] = useState({
    productName: "",
    tagline: "",
    description: "",
    type: "",
    targetArea: "",
    targetAudience: "",
    thumbnail: "",
    date: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      await axios.post(
        "http://localhost:5000/api/admin/advertisement",
        form
      );

      setMessage("Advertisement added successfully!");

      setForm({
        productName: "",
        tagline: "",
        description: "",
        type: "",
        targetArea: "",
        targetAudience: "",
        thumbnail: "",
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

        {/* PRODUCT / TAGLINE / DATE */}

        <div className="row">

          <div className="col-md-4 mb-3">
            <label className="form-label">
              Product / Application
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
              Tagline
            </label>

            <input
              type="text"
              name="tagline"
              className="form-control"
              value={form.tagline}
              onChange={handleChange}
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


        {/* TYPE */}

        <div className="row">

          <div className="col-md-4 mb-3">

            <label className="form-label">
              Advertisement Type
            </label>

            <select
              name="type"
              className="form-control"
              value={form.type}
              onChange={handleChange}
            >

              <option value="">Select Type</option>
              <option value="Banner">Banner</option>
              <option value="Video">Video</option>
              <option value="Product Promotion">Product Promotion</option>
              <option value="Offer">Offer</option>

            </select>

          </div>

        </div>


        {/* TARGET AREA / TARGET AUDIENCE / PRODUCT IMAGE */}

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

              <option value="Manufacturing Companies">Manufacturing Companies</option>
              <option value="Industrial Businesses">Industrial Businesses</option>
              <option value="Smart Buildings">Smart Buildings</option>
              <option value="Educational Institutions">Educational Institutions</option>
              <option value="Technology Startups">Technology Startups</option>
              <option value="Automotive Companies">Automotive Companies</option>
              <option value="Energy & Utility Companies">Energy & Utility Companies</option>
              <option value="Agriculture Technology Companies">Agriculture Technology Companies</option>
              <option value="Logistics & Supply Chain Companies">Logistics & Supply Chain Companies</option>
              <option value="Retail Businesses">Retail Businesses</option>
              <option value="Healthcare Organizations">Healthcare Organizations</option>
              <option value="Government Organizations">Government Organizations</option>

            </select>

          </div>


          {/* THUMBNAIL */}

          <div className="col-md-4 mb-3">

            <label className="form-label">
              Product Image
            </label>

            <select
              name="thumbnail"
              className="form-control"
              value={form.thumbnail}
              onChange={handleChange}
              required
            >
              <option value="">Select Product Image</option>

              {PRODUCT_IMAGE_OPTIONS.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}

            </select>

            {form.thumbnail && (
              <img
                src={form.thumbnail}
                alt="Selected product"
                className="mt-2"
                style={{ width: "100%", maxHeight: "130px", objectFit: "cover", borderRadius: "6px" }}
              />
            )}

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