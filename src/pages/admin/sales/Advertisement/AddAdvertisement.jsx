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
    startDate: "",
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
        startDate: "",
      });
    } catch (err) {
      console.error(err);
      setMessage("Failed to add advertisement");
    }
  };

  return (
    <div className="p-4 bg-white shadow rounded">
      <h2 className="text-2xl mb-3">Add Advertisement</h2>
      {message && <p>{message}</p>}

      <form onSubmit={handleSubmit}>
        <input name="productName" placeholder="Product Name" className="form-control mb-2"
          value={form.productName} onChange={handleChange} />

        <input name="tagline" placeholder="Tagline" className="form-control mb-2"
          value={form.tagline} onChange={handleChange} />

        <textarea name="description" placeholder="Description" className="form-control mb-2"
          value={form.description} onChange={handleChange} />

        <input name="keywords" placeholder="Keywords" className="form-control mb-2"
          value={form.keywords} onChange={handleChange} />

        <input name="productLink" placeholder="Product Link" className="form-control mb-2"
          value={form.productLink} onChange={handleChange} />

        <input name="type" placeholder="Type" className="form-control mb-2"
          value={form.type} onChange={handleChange} />

        <input name="targetArea" placeholder="Target Area" className="form-control mb-2"
          value={form.targetArea} onChange={handleChange} />

        <input name="targetAudience" placeholder="Target Audience" className="form-control mb-2"
          value={form.targetAudience} onChange={handleChange} />

        <input name="thumbnail" placeholder="Thumbnail path" className="form-control mb-2"
          value={form.thumbnail} onChange={handleChange} />

        <input type="date" name="startDate" className="form-control mb-3"
          value={form.startDate} onChange={handleChange} />

        <button className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
}
