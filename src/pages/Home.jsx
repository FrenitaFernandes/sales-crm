import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center p-10">

      <h1 className="text-4xl font-bold mb-6">Welcome to Sales & CRM System</h1>

      <p className="text-lg text-gray-700 max-w-xl mb-4">
        This system helps manage Sales, CRM, Tickets, Invoices, Customer Support and more.
      </p>

      {/* ABOUT US */}
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-lg mb-4">
        <h2 className="text-xl font-semibold mb-2">About Us</h2>
        <p className="text-gray-600">
          We provide a unified platform for managing sales, customer relations,
          service requests and business operations.
        </p>
      </div>

      {/* CONTACT US */}
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Contact Us</h2>
        <p className="text-gray-600">Email: support@salescrm.com</p>
        <p className="text-gray-600">Phone: +91 9876543210</p>
      </div>

      {/* LOGIN & REGISTER */}
      <div className="flex gap-6 mt-4">
        <Link
          to="/login"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
        >
          Login
        </Link>

        <Link
          to="/register"
          className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
        >
          Register
        </Link>
      </div>
    </div>
  );
}

export default Home;
