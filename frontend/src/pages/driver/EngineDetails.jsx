import React, { useEffect, useState } from "react";

/**
 * EngineDetails page (driver).
 * Note: Previous version referenced Firebase + DriverLayout (not present in repo).
 * This keeps the page working with placeholder data (or can be connected to backend later).
 */
const DriverEngine = () => {
  const [vehicle, setVehicle] = useState(null);

  useEffect(() => {
    // If/when backend has an endpoint for assigned vehicle telemetry, wire it here.
    // For now, display placeholder data.
    setVehicle({
      number: "NF-101",
      model: "Swift",
      type: "Hatchback",
      health: 82,
      engineStatus: "Good",
      lastTelemetry: Date.now(),
      speed: 42,
      location: "Downtown",
    });
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold">Vehicle Engine & Telemetry</h1>
      <p className="mt-2 text-muted-foreground">
        Monitor your assigned vehicle in real-time.
      </p>

      {vehicle ? (
        <div className="mt-6 p-6 rounded-xl border border-border/40 bg-card">
          <h2 className="text-2xl text-primary">{vehicle.number}</h2>
          <p className="text-muted-foreground">Model: {vehicle.model}</p>
          <p className="text-muted-foreground">Type: {vehicle.type}</p>
          <p className="text-muted-foreground">Health: {vehicle.health}%</p>
          <p className="text-muted-foreground">
            Engine Status: {vehicle.engineStatus}
          </p>
          <p className="text-muted-foreground">
            Last Telemetry:{" "}
            {vehicle.lastTelemetry
              ? new Date(vehicle.lastTelemetry).toLocaleString()
              : "N/A"}
          </p>

          <p className="text-muted-foreground">Speed: {vehicle.speed || 0} km/h</p>
          <p className="text-muted-foreground">
            Location: {vehicle.location || "N/A"}
          </p>
        </div>
      ) : (
        <p className="mt-6 text-muted-foreground">No vehicle assigned yet.</p>
      )}
    </div>
  );
};

export default DriverEngine;
