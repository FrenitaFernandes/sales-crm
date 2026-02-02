import { useState } from "react";
import { User, FileText, CreditCard, Package } from "lucide-react";

function Profile() {

  // STATIC DUMMY DATA (NO BACKEND NEEDED)
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john@example.com",
    phone: "+91 9876543210",
    address: "MG Road, Bengaluru",
    company: "Tech Solutions Pvt Ltd",
    gst: "29ABCDE1234F2Z5",
    pan: "ABCDE1234F",
    avatar: "",
    createdAt: "2023-02-15"
  });

  const orders = [
    { orderId: "ORD12345", amount: 4999, date: "2024-01-10" },
    { orderId: "ORD12346", amount: 2599, date: "2023-12-05" },
  ];

  const payments = [
    { method: "UPI", amount: 4999, date: "2024-01-10" },
    { method: "Card", amount: 2599, date: "2023-12-05" },
  ];

  const services = [
    { serviceName: "Web Hosting", description: "Business Hosting Plan", isActive: true },
    { serviceName: "CRM Subscription", description: "Pro Plan", isActive: true },
  ];

  const updateProfile = () => {
    alert("Frontend only — profile updated locally!");
  };

  return (
    <div className="p-6 space-y-10">

      <h1 className="text-2xl font-semibold flex items-center gap-2">
        <User /> Profile
      </h1>

      {/* PROFILE CARD */}
      <div className="bg-white shadow rounded-xl p-6 flex items-center gap-6">
        <img
          src={profile.avatar || "https://ui-avatars.com/api/?name=" + profile.name}
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

          <input className="p-3 border rounded w-full"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            placeholder="Full Name"
          />

          <input className="p-3 border rounded w-full"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            placeholder="Email"
          />

          <input className="p-3 border rounded w-full"
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            placeholder="Phone Number"
          />

          <input className="p-3 border rounded w-full"
            value={profile.company}
            onChange={(e) => setProfile({ ...profile, company: e.target.value })}
            placeholder="Company Name"
          />

          <input className="p-3 border rounded w-full"
            value={profile.gst}
            onChange={(e) => setProfile({ ...profile, gst: e.target.value })}
            placeholder="GST Number"
          />

          <input className="p-3 border rounded w-full"
            value={profile.pan}
            onChange={(e) => setProfile({ ...profile, pan: e.target.value })}
            placeholder="PAN Number"
          />

        </div>

        <textarea
          className="p-3 border rounded w-full"
          value={profile.address}
          onChange={(e) => setProfile({ ...profile, address: e.target.value })}
          placeholder="Address"
        />

        <button
          onClick={updateProfile}
          className="bg-blue-600 text-white px-5 py-2 rounded">
          Save Changes
        </button>
      </div>

      {/* ACTIVE SERVICES */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
          <Package /> Active Services
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {services.map((s, idx) => (
            <div key={idx} className="border p-4 rounded-xl shadow-sm">
              <h3 className="font-semibold">{s.serviceName}</h3>
              <p className="text-gray-600 text-sm">{s.description}</p>
              <p className="mt-2 text-sm">
                Status:
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded-full">
                  Active
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ORDERS */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FileText /> Order History
        </h2>

        <div className="mt-4 space-y-3">
          {orders.map((o, idx) => (
            <div key={idx} className="border p-4 rounded-xl flex justify-between">
              <div>
                <p className="font-semibold">Order #{o.orderId}</p>
                <p className="text-gray-500 text-sm">{o.date}</p>
              </div>
              <p className="text-blue-600 font-bold">₹{o.amount}</p>
            </div>
          ))}
        </div>
      </div>

      {/* PAYMENTS */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <CreditCard /> Recent Payments
        </h2>

        <div className="mt-4 space-y-3">
          {payments.map((p, idx) => (
            <div key={idx} className="border p-4 rounded-xl flex justify-between">
              <div>
                <p className="font-semibold">{p.method}</p>
                <p className="text-gray-500 text-sm">{p.date}</p>
              </div>
              <p className="text-green-600 font-bold">₹{p.amount}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default Profile;