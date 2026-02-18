import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white flex flex-col">

      {/* HERO SECTION (Less congested) */}
      <div className="flex flex-col items-center justify-center text-center flex-1 px-6 py-20">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 drop-shadow-lg">
          Sales & CRM System
        </h1>

        <p className="text-lg md:text-xl max-w-2xl mb-10 text-gray-200 leading-relaxed">
          Manage your sales, customers, support tickets and business operations
          all in one powerful platform.
        </p>

        <div className="flex gap-6">
          <Link
            to="/login"
            className="px-10 py-3 bg-white text-blue-700 font-semibold rounded-full shadow-lg hover:scale-105 transition"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="px-10 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-full shadow-lg hover:scale-105 transition"
          >
            Register
          </Link>
        </div>
      </div>

      {/* ABOUT & CONTACT */}
      <div className="bg-white text-gray-800 py-14">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 px-6">
          
          <div className="bg-gray-50 p-6 rounded-xl shadow">
            <h2 className="text-2xl font-bold mb-3">About Us</h2>
            <p className="text-gray-600 leading-relaxed">
              We provide a unified platform for managing sales, customer relations,
              service requests and business operations. Our goal is to simplify
              workflows and improve productivity for businesses.
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl shadow">
            <h2 className="text-2xl font-bold mb-3">Contact Us</h2>
            <p className="text-gray-600">📧 rdltechnologiespvtltd@gmail.com</p>
            <p className="text-gray-600">📞 to be added</p>
            <p className="text-gray-600">📍 India, Mangalore</p>
          </div>

        </div>
      </div>

      {/* FOOTER */}
      <div className="bg-gray-900 text-gray-400 text-center py-4 text-sm">
        © 2026 Sales & CRM System. All rights reserved.
      </div>
    </div>
  );
}

export default Home;
