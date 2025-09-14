import React, { useEffect, useState } from "react";
import { usePageTitle } from "../hooks/usePageTitle";
import { useRateLimit } from "../contexts/RateLimitContext";
import toast from "react-hot-toast";

const Settings = () => {
  const { isRateLimited, cooldown } = useRateLimit();
  usePageTitle("Settings");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    notifications: true,
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting settings:", formData);
    // You can connect this to your backend update endpoint
  };

  useEffect(() => {
    if(isRateLimited){
      toast.error(`Sorry about that, you're being rate-limited. Please try again in ${cooldown} seconds.`, {duration: 4000})
    }
  }, [])

  return (
  <main className="bg-slate-100 min-h-screen">
    <div className="px-4 sm:px-6 lg:px-8 py-10 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Settings</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-8 shadow-sm"
      >
        {/* Basic Info */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium">Name</label>
              <input
                type="text"
                name="name"
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                name="email"
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Preferences</h2>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="notifications"
              checked={formData.notifications}
              onChange={handleChange}
              className="h-4 w-4"
            />
            Receive email notifications
          </label>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </main>
);

};

export default Settings;
