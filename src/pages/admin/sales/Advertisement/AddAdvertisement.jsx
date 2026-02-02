import { useState } from "react";
import axios from "axios";

export default function AddAdvertisement() {
  const [form, setForm] = useState({
    productApplication: "",
    tagline: "",
    description: "",
    keywords: "",
    productLink: "",
    type: "",
    targetingArea: "",
    targetingAudience: "",
    audienceThumbnail: "",
    date: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/admin/advertisement", form);
      setMessage("Advertisement added successfully!");

      setForm({
        productApplication: "",
        tagline: "",
        description: "",
        keywords: "",
        productLink: "",
        type: "",
        targetingArea: "",
        targetingAudience: "",
        audienceThumbnail: "",
        date: "",
      });
    } catch (err) {
      console.error(err);
      setMessage("Failed to add advertisement");
    }
  };

  return (
    <div className="p-4 bg-white shadow rounded">
      <h2 className="text-2xl mb-3">Add Advertisement</h2>

      {message && <p className="text-success">{message}</p>}

      <form onSubmit={handleSubmit}>

        <div className="row">
          <div className="col-4 mb-3">
            <label>Product / Application</label>
            <input type="text" name="productApplication" className="form-control"
              value={form.productApplication} onChange={handleChange} />
          </div>

          <div className="col-4 mb-3">
            <label>Tagline</label>
            <input type="text" name="tagline" className="form-control"
              value={form.tagline} onChange={handleChange} />
          </div>

          <div className="col-4 mb-3">
            <label>Date</label>
            <input type="date" name="date" className="form-control"
              value={form.date} onChange={handleChange} />
          </div>
        </div>

        <div className="mb-3">
          <label>Description</label>
          <textarea name="description" className="form-control"
            value={form.description} onChange={handleChange}></textarea>
        </div>

        <div className="row">
          <div className="col-4 mb-3">
            <label>Keywords</label>
            <input type="text" name="keywords" className="form-control"
              value={form.keywords} onChange={handleChange} />
          </div>

          <div className="col-4 mb-3">
            <label>Product Link</label>
            <input type="text" name="productLink" className="form-control"
              value={form.productLink} onChange={handleChange} />
          </div>

          <div className="col-4 mb-3">
            <label>Type</label>
            <input type="text" name="type" className="form-control"
              value={form.type} onChange={handleChange} />
          </div>
        </div>

        <div className="row">
          <div className="col-4 mb-3">
            <label>Targeting Area</label>
            <input type="text" name="targetingArea" className="form-control"
              value={form.targetingArea} onChange={handleChange} />
          </div>

          <div className="col-4 mb-3">
            <label>Targeting Audience</label>
            <input type="text" name="targetingAudience" className="form-control"
              value={form.targetingAudience} onChange={handleChange} />
          </div>

          <div className="col-4 mb-3">
            <label>Audience Thumbnail</label>
            <input type="text" name="audienceThumbnail" className="form-control"
              value={form.audienceThumbnail} onChange={handleChange} />
          </div>
        </div>

        <button className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
}
