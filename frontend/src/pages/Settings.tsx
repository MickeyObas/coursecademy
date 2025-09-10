import React, { useState } from "react";
import { usePageTitle } from "../hooks/usePageTitle";

const Settings = () => {
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

  return (
    <main className="bg-slate-100 h-full">
      <div className="px-6 py-10 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Settings</h1>

        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-8 shadow-sm">
          
          {/* Basic Info */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Account Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Name</label>
                <input
                  type="text"
                  name="name"
                  className="w-full mt-1 px-4 py-2 border rounded-lg"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  className="w-full mt-1 px-4 py-2 border rounded-lg"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Password Change */}
          {/* <div>
            <h2 className="text-lg font-semibold mb-4">Change Password</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">New Password</label>
                <input
                  type="password"
                  name="password"
                  className="w-full mt-1 px-4 py-2 border rounded-lg"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="w-full mt-1 px-4 py-2 border rounded-lg"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div> */}

          {/* Notifications */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Preferences</h2>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="notifications"
                checked={formData.notifications}
                onChange={handleChange}
              />
              Receive email notifications
            </label>
          </div>

          {/* Submit */}
          <div className="text-right">
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
