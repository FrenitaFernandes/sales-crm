import { useState } from "react";
import axios from "axios";

export default function AddAdvertisement() {
  const [form, setForm] = useState({
    productName: "",
    tagline: "",
    description: "",
    keywords: "",
    productLink: "",
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
      await axios.post("http://localhost:5000/api/admin/advertisement", form);
      setMessage("Advertisement added successfully!");

      setForm({
        productName: "",
        tagline: "",
        description: "",
        keywords: "",
        productLink: "",
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
      <h2 className="text-2xl mb-3">Add Advertisement</h2>

      {message && <p className="text-success">{message}</p>}

      <form onSubmit={handleSubmit}>

        <div className="row">
          <div className="col-4 mb-3">
            <label>Product / Application</label>
            <input 
              type="text" 
              name="productName" 
              className="form-control"
              value={form.productName} 
              onChange={handleChange} 
              required
            />
          </div>

          <div className="col-4 mb-3">
            <label>Tagline</label>
            <input 
              type="text" 
              name="tagline" 
              className="form-control"
              value={form.tagline} 
              onChange={handleChange} 
            />
          </div>

          <div className="col-4 mb-3">
            <label>Date</label>
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

        <div className="mb-3">
          <label>Description</label>
          <textarea 
            name="description" 
            className="form-control"
            value={form.description} 
            onChange={handleChange}
            rows="3"
          ></textarea>
        </div>

        <div className="row">
          <div className="col-4 mb-3">
            <label>Keywords</label>
            <input 
              type="text" 
              name="keywords" 
              className="form-control"
              value={form.keywords} 
              onChange={handleChange} 
              placeholder="e.g., software, tech, digital"
            />
          </div>

          <div className="col-4 mb-3">
            <label>Product Link</label>
            <input 
              type="url" 
              name="productLink" 
              className="form-control"
              value={form.productLink} 
              onChange={handleChange} 
              placeholder="https://example.com"
            />
          </div>

          <div className="col-4 mb-3">
            <label>Type</label>
            <input 
              type="text" 
              name="type" 
              className="form-control"
              value={form.type} 
              onChange={handleChange} 
              placeholder="e.g., Banner, Video, Social"
            />
          </div>
        </div>

        <div className="row">
          <div className="col-4 mb-3">
            <label>Targeting Area</label>
            <input 
              type="text" 
              name="targetArea" 
              className="form-control"
              value={form.targetArea} 
              onChange={handleChange} 
              placeholder="e.g., North America, Europe"
            />
          </div>

          <div className="col-4 mb-3">
            <label>Targeting Audience</label>
            <input 
              type="text" 
              name="targetAudience" 
              className="form-control"
              value={form.targetAudience} 
              onChange={handleChange} 
              placeholder="e.g., Business professionals"
            />
          </div>

          <div className="col-4 mb-3">
            <label>Audience Thumbnail URL</label>
            <input 
              type="text" 
              name="thumbnail" 
              className="form-control"
              value={form.thumbnail} 
              onChange={handleChange} 
              placeholder="Image URL or path"
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
}
