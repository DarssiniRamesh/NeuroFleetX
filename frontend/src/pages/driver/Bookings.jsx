import React, { useMemo, useState } from "react";

/**
 * Driver Bookings page.
 * Note: This repository does not include Firebase configuration, so this page uses
 * local placeholder data and simple in-memory mutations.
 *
 * PUBLIC_INTERFACE
 */
export default function DriverBookings() {
  const [bookings, setBookings] = useState(() => [
    {
      id: "B-1001",
      customerName: "Amit Verma",
      pickup: "Central Park",
      drop: "Riverside",
      status: "Pending",
      timestamp: Date.now() - 1000 * 60 * 30,
    },
    {
      id: "B-1002",
      customerName: "Neha Sharma",
      pickup: "Warehouse",
      drop: "Downtown",
      status: "Completed",
      timestamp: Date.now() - 1000 * 60 * 60 * 5,
    },
  ]);

  const [recommendation, setRecommendation] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    pickup: "",
    drop: "",
  });

  const stats = useMemo(() => {
    return {
      pending: bookings.filter((b) => b.status === "Pending").length,
      completed: bookings.filter((b) => b.status === "Completed").length,
    };
  }, [bookings]);

  // Generate Smart Recommendation (mock)
  const generateRecommendation = () => {
    const streets = ["Main Street", "Central Park", "Warehouse", "Downtown", "Riverside"];
    const shuffled = [...streets].sort(() => Math.random() - 0.5);
    setRecommendation(`Suggested Route: ${shuffled.join(" → ")}`);
  };

  // Mark booking complete
  const completeBooking = (id) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "Completed" } : b))
    );
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAddBooking = async (e) => {
    e.preventDefault();
    const next = {
      id: `B-${Math.floor(Math.random() * 9000 + 1000)}`,
      ...formData,
      status: "Pending",
      timestamp: Date.now(),
    };
    setBookings((prev) => [next, ...prev]);
    setFormData({ customerName: "", pickup: "", drop: "" });
    setShowForm(false);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold">Customer Bookings</h1>
      <p className="mt-2 text-muted-foreground">
        Manage your assigned bookings and see AI suggestions.
      </p>

      <div className="flex flex-wrap gap-4 mt-6">
        <button
          onClick={generateRecommendation}
          className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          type="button"
        >
          Generate Smart Recommendation
        </button>

        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
          type="button"
        >
          + Add Booking
        </button>

        <div className="ml-auto text-sm text-muted-foreground self-center">
          Pending: <span className="font-semibold">{stats.pending}</span> · Completed:{" "}
          <span className="font-semibold">{stats.completed}</span>
        </div>
      </div>

      {recommendation && (
        <p className="mt-3 p-2 bg-card rounded border border-border/40">
          {recommendation}
        </p>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="p-6 bg-card rounded-xl w-96 border border-border/40">
            <h2 className="mb-4 text-xl font-semibold">New Booking</h2>
            <form onSubmit={handleAddBooking} className="space-y-3">
              <input
                type="text"
                name="customerName"
                placeholder="Customer Name"
                value={formData.customerName}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded bg-background border-border/40"
              />
              <input
                type="text"
                name="pickup"
                placeholder="Pickup Location"
                value={formData.pickup}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded bg-background border-border/40"
              />
              <input
                type="text"
                name="drop"
                placeholder="Drop Location"
                value={formData.drop}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded bg-background border-border/40"
              />

              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  className="flex-1 p-2 font-semibold text-white bg-green-600 rounded hover:bg-green-700"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 p-2 font-semibold text-white bg-gray-700 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 mt-6 md:grid-cols-2">
        {bookings.length === 0 && (
          <p className="text-muted-foreground">No bookings assigned yet.</p>
        )}

        {bookings.map((b) => (
          <div
            key={b.id}
            className="p-4 rounded-xl border border-border/40 bg-card"
          >
            <h2 className="text-xl text-primary">Booking {b.id}</h2>
            <p className="text-muted-foreground">Customer: {b.customerName}</p>
            <p className="text-muted-foreground">Pickup: {b.pickup}</p>
            <p className="text-muted-foreground">Drop: {b.drop}</p>
            <p className="text-muted-foreground mt-1">
              Status:{" "}
              <span
                className={
                  b.status === "Completed"
                    ? "text-green-600"
                    : b.status === "Pending"
                    ? "text-yellow-600"
                    : "text-red-600"
                }
              >
                {b.status}
              </span>
            </p>
            <button
              className="px-2 py-1 mt-2 bg-green-600 text-white rounded disabled:opacity-50"
              onClick={() => completeBooking(b.id)}
              disabled={b.status === "Completed"}
              type="button"
            >
              Mark Completed
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
