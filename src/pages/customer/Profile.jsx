import { useState, useEffect } from "react";
import { User } from "lucide-react";

function Profile() {
  const [profile, setProfile] = useState({
    name: "",           // company name
    company: "",        // contact person
    email: "",
    phone: "",
    address: "",
    country: "",
    industryType: "",
    avatar: "",
    description: "",
    website: "",
    createdAt: ""
  });

  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success"); // success or error

  // LOAD USER PROFILE
  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/customers/profile", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Check if response is JSON
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server returned invalid response format");
        }

        const data = await res.json();
        console.log("Profile data received:", data);

        const apiCustomer = data.customer || data.data || null;

        if (data.success && apiCustomer) {
          setProfile((prev) => ({ ...prev, ...apiCustomer }));
          localStorage.setItem("user", JSON.stringify(apiCustomer));
          setError("");
        } else {
          throw new Error(data.message || "Failed to load profile");
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError(err.message);

        // Fallback to localStorage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            console.log("Loaded from localStorage:", parsed);
            setProfile(parsed);
            setError("");
          } catch (e) {
            console.error("Stored user parse error:", e);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // UPDATE PROFILE
  const handleUpdateProfile = async () => {
    const token = localStorage.getItem("authToken") || localStorage.getItem("token") || "";
    if (!token) {
      alert("Please login first");
      return;
    }

    try {
      // Only send the fields we want to update (not _id or timestamps)
      const updateData = {
        name: profile.name,
        company: profile.company,
        phone: profile.phone,
        address: profile.address,
        country: profile.country,
        industryType: profile.industryType,
        avatar: profile.avatar,
        description: profile.description,
        website: profile.website
      };

      console.log("Sending update:", updateData);

      const res = await fetch("http://localhost:5000/api/customers/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const data = await res.json();
      console.log("Update response:", data);

      if (res.ok && (data.success === undefined || data.success)) {
        const updatedProfile = data.customer || data.data || {};
        const existingUser = JSON.parse(localStorage.getItem("user") || "{}");
        const mergedUser = {
          ...existingUser,
          ...updatedProfile,
          name: updatedProfile.name || existingUser.name,
          email: updatedProfile.email || existingUser.email
        };

        setProfile((prev) => ({ ...prev, ...updatedProfile }));
        localStorage.setItem("user", JSON.stringify(mergedUser));
        setAlertMessage("Profile updated successfully!");
        setAlertType("success");
        setShowEdit(false);
        setError("");
        // Auto-close alert after 2.5 seconds
        setTimeout(() => setAlertMessage(""), 2500);
      } else {
        throw new Error(data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Update error:", err);
      setAlertMessage("Error updating profile: " + err.message);
      setAlertType("error");
      setError(err.message);
    }
  };

  // Format date safely
  let storedCreatedAt = "";
  try {
    storedCreatedAt = JSON.parse(localStorage.getItem("user") || "{}").createdAt || "";
  } catch (parseError) {
    storedCreatedAt = "";
  }

  const memberSinceRaw = profile.memberSince || profile.createdAt || storedCreatedAt;

  const formattedDate = memberSinceRaw
    ? new Date(memberSinceRaw).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      })
    : "Not available";

  // Modal Alert Component - with close button
  const ModalAlert = () => {
    if (!alertMessage) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={`bg-white rounded-lg p-6 shadow-lg max-w-sm ${
          alertType === "success" ? "border-l-4 border-green-500" : "border-l-4 border-red-500"
        }`}>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              {alertType === "success" ? (
                <div className="text-green-600 text-3xl">✓</div>
              ) : (
                <div className="text-red-600 text-3xl">✕</div>
              )}
            </div>
            <p className={`text-base font-semibold flex-1 ${
              alertType === "success" ? "text-green-700" : "text-red-700"
            }`}>
              {alertMessage}
            </p>
            <button
              onClick={() => setAlertMessage("")}
              className="text-gray-400 hover:text-gray-600 text-2xl flex-shrink-0"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Modal Alert */}
      <ModalAlert />
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <User size={28} /> My Profile
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10">Loading profile...</div>
      ) : (
        <>
          {/* PROFILE CARD - Compact View */}
          <div className="bg-white shadow-lg rounded-xl p-8">
            <div className="flex items-start gap-6">
              {/* Logo */}
              <div className="flex-shrink-0">
                <img
                  src={
                    profile.avatar ||
                    "https://ui-avatars.com/api/?name=" + encodeURIComponent(profile.name) + "&size=120"
                  }
                  alt={profile.name}
                  className="w-24 h-24 rounded-full shadow-md border-4 border-blue-100"
                />
              </div>

              {/* Company Info */}
              <div className="flex-grow">
                <h2 className="text-2xl font-bold text-gray-800">{profile.name || "N/A"}</h2>
                
                <div className="mt-3 space-y-2 text-gray-600">
                  {profile.phone && (
                    <p>
                      <span className="font-semibold">Phone:</span> {profile.phone}
                    </p>
                  )}
                  
                  {profile.website && (
                    <p>
                      <span className="font-semibold">Website:</span>{" "}
                      <a 
                        href={profile.website} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {profile.website}
                      </a>
                    </p>
                  )}
                  
                  <p>
                    <span className="font-semibold">Member Since:</span> {formattedDate}
                  </p>
                </div>
              </div>

              {/* Edit Button */}
              <button
                onClick={() => setShowEdit(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold whitespace-nowrap"
              >
                Edit Profile
              </button>
            </div>
          </div>

          {/* EDIT PROFILE FORM - Modal-like Section */}
          {showEdit && (
            <div className="bg-white shadow-lg rounded-xl p-8">
              {/* Header with Close */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Edit Your Profile</h2>
                <button
                  onClick={() => setShowEdit(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="Enter company name"
                  />
                </div>

                {/* Contact Person Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contact Person Name
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={profile.company}
                    onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                    placeholder="Enter contact person name"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Website URL
                  </label>
                  <input
                    type="url"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={profile.website}
                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Country
                  </label>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={profile.country}
                    onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                  >
                    <option value="">Select Country</option>
                    <option value="India">India</option>
                    <option value="USA">USA</option>
                    <option value="UK">UK</option>
                    <option value="UAE">UAE</option>
                  </select>
                </div>

                {/* Industry Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Industry Type
                  </label>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={profile.industryType}
                    onChange={(e) => setProfile({ ...profile, industryType: e.target.value })}
                  >
                    <option value="">Select Industry</option>
                    <option value="Manufacturing Companies">Manufacturing Companies</option>
                    <option value="Industrial Businesses">Industrial Businesses</option>
                    <option value="Smart Buildings">Smart Buildings</option>
                    <option value="Educational Institutions">Educational Institutions</option>
                    <option value="Technology Startups">Technology Startups</option>
                    <option value="Automotive Companies">Automotive Companies</option>
                    <option value="Energy & Utility Companies">Energy & Utility Companies</option>
                    <option value="Agriculture Technology Companies">Agriculture Technology</option>
                    <option value="Logistics & Supply Chain Companies">Logistics & Supply Chain</option>
                    <option value="Retail Businesses">Retail Businesses</option>
                    <option value="Healthcare Organizations">Healthcare Organizations</option>
                    <option value="Government Organizations">Government Organizations</option>
                  </select>
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Company Logo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          setProfile({ ...profile, avatar: reader.result });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                  {profile.avatar && (
                    <p className="text-sm text-green-600 mt-1">Logo selected ✓</p>
                  )}
                </div>


              </div>

              {/* Address */}
              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  placeholder="Enter your address"
                  rows="3"
                />
              </div>

              {/* Description */}
              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company Description
                </label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={profile.description}
                  onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                  placeholder="Describe your company"
                  rows="4"
                />
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex gap-4">
                <button
                  onClick={handleUpdateProfile}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setShowEdit(false)}
                  className="flex-1 px-6 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Profile;
