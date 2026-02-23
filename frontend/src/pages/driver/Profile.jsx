import React, { useState } from "react";

const DriverProfile = () => {
  const [name, setName] = useState("Driver Name");
  const [phone, setPhone] = useState("9876543210");

  return (
    <div className="max-w-xl text-white" data-testid="driver-profile-page">
      <h2 className="text-3xl font-bold" data-testid="driver-profile-title">Profile Settings</h2>

      <div className="mt-6 bg-[#141414] p-6 rounded-xl border border-gray-800" data-testid="profile-form">
        <label className="block mb-3 text-sm opacity-80">Full Name</label>
        <input
          className="w-full p-2 rounded bg-[#0d0d0d] border border-gray-700 text-white"
          value={name}
          onChange={(e) => setName(e.target.value)}
          data-testid="profile-name"
        />

        <label className="block mt-4 mb-3 text-sm opacity-80">Phone</label>
        <input
          className="w-full p-2 rounded bg-[#0d0d0d] border border-gray-700 text-white"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          data-testid="profile-phone"
        />

        <button className="w-full p-2 mt-6 bg-blue-600 rounded-lg hover:bg-blue-700" data-testid="profile-save">
          Save
        </button>
      </div>
    </div>
  );
};

export default DriverProfile;
