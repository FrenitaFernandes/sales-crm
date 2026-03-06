import { useState, useEffect } from "react";
import { User, FileText, CreditCard } from "lucide-react";

function Profile() {

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    company: "",
    gst: "",
    pan: "",
    country: "",
    industryType: "",
    avatar: "",
    createdAt: ""
  });

  // LOAD USER
  useEffect(() => {

    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (storedUser) {

      setProfile({
        name: storedUser.name || "",
        email: storedUser.email || "",
        phone: storedUser.phone || "",
        address: storedUser.address || "",
        company: storedUser.company || "",
        gst: storedUser.gst || "",
        pan: storedUser.pan || "",
        country: storedUser.country || "",
        industryType: storedUser.industryType || "",
        avatar: storedUser.avatar || "",
        createdAt: storedUser.createdAt || ""
      });

    }

  }, []);


  // UPDATE PROFILE
  const updateProfile = async () => {

    try {

      const token = localStorage.getItem("authToken") || localStorage.getItem("token") || "";

      if (!token) {
        alert("Please login again.");
        return;
      }

      const res = await fetch("http://localhost:5000/api/customers/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });

      const data = await res.json();

      if (res.ok && data.success) {

        const updatedProfile = data.data || {};
        const existingUser = JSON.parse(localStorage.getItem("user") || "{}");

        // Preserve auth fields from user object while merging profile fields.
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...existingUser,
            ...updatedProfile,
            name: updatedProfile.name || existingUser.name,
            email: updatedProfile.email || existingUser.email
          })
        );

        alert("Profile updated successfully!");

      } else {

        alert(data.message || "Failed to update profile");

      }

    } catch (error) {

      console.error(error);
      alert("Error updating profile");

    }

  };


  return (
    <div className="p-6 space-y-10">

      <h1 className="text-2xl font-semibold flex items-center gap-2">
        <User /> Profile
      </h1>

      {/* PROFILE CARD */}

      <div className="bg-white shadow rounded-xl p-6 flex items-center gap-6">

        <img
          src={
            profile.avatar ||
            "https://ui-avatars.com/api/?name=" + profile.name
          }
          alt={profile.name}
          className="w-20 h-20 rounded-full shadow"
        />

        <div>

          <h2 className="text-xl font-bold">{profile.name}</h2>

          <p className="text-gray-600">{profile.email}</p>

          <p className="text-gray-500 text-sm mt-1">
            Member since: {profile.createdAt}
          </p>

        </div>

      </div>


      {/* EDIT PROFILE */}

      <div className="bg-white shadow rounded-xl p-6 space-y-4">

        <h2 className="text-lg font-semibold mb-2">Edit Profile</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <input
            className="p-3 border rounded"
            value={profile.name}
            onChange={(e)=>setProfile({...profile,name:e.target.value})}
            placeholder="Full Name"
          />

          <input
            className="p-3 border rounded"
            value={profile.phone}
            onChange={(e)=>setProfile({...profile,phone:e.target.value})}
            placeholder="Phone"
          />

          <input
            className="p-3 border rounded"
            value={profile.company}
            onChange={(e)=>setProfile({...profile,company:e.target.value})}
            placeholder="Company"
          />

          {/* COUNTRY */}

          <select
            className="p-3 border rounded"
            value={profile.country}
            onChange={(e)=>setProfile({...profile,country:e.target.value})}
          >
            <option value="">Select Country</option>
            <option>India</option>
            <option>USA</option>
            <option>UK</option>
          </select>


          {/* INDUSTRY TYPE */}

          <select
            className="p-3 border rounded"
            value={profile.industryType}
            onChange={(e)=>setProfile({...profile,industryType:e.target.value})}
          >
            <option value="">Select Industry</option>
            <option>Manufacturing Companies</option>
            <option>Industrial Businesses</option>
            <option>Smart Buildings</option>
            <option>Educational Institutions</option>
            <option>Technology Startups</option>
            <option>Automotive Companies</option>
            <option>Energy & Utility Companies</option>
            <option>Agriculture Technology Companies</option>
            <option>Logistics & Supply Chain Companies</option>
            <option>Retail Businesses</option>
            <option>Healthcare Organizations</option>
            <option>Government Organizations</option>
          </select>

        </div>

        <textarea
          className="p-3 border rounded w-full"
          value={profile.address}
          onChange={(e)=>setProfile({...profile,address:e.target.value})}
          placeholder="Address"
        />

        <button
          onClick={updateProfile}
          className="bg-blue-600 text-white px-5 py-2 rounded"
        >
          Save Changes
        </button>

      </div>

    </div>
  );
}

export default Profile;