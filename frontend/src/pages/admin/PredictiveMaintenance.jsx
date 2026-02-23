import React, { useEffect, useMemo, useState } from "react";
import api from "@/api/axios";

/**
 * PredictiveMaintenance page (admin).
 * Note: This project template previously referenced Firebase + an AdminLayout component
 * that are not present in this repo. This implementation uses backend APIs when available,
 * and falls back to safe placeholder data.
 */
const PredictiveMaintenance = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const enrichedVehicles = useMemo(() => {
    return vehicles.map((v) => {
      const health = Number.isFinite(v.health) ? v.health : 100;

      let healthStatus = "Healthy";
      let healthColor = "bg-green-700 text-green-100";

      if (health < 50 && health >= 25) {
        healthStatus = "Warning";
        healthColor = "bg-yellow-700 text-yellow-100";
      } else if (health < 25) {
        healthStatus = "Critical";
        healthColor = "bg-red-700 text-red-100";
      }

      return { ...v, health, healthStatus, healthColor };
    });
  }, [vehicles]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        // If/when backend has a vehicles listing endpoint, wire it here.
        // const res = await api.get("/api/vehicles");
        // if (mounted) setVehicles(res.data);

        // Fallback placeholder vehicles (keeps UI functional without Firebase).
        if (mounted) {
          setVehicles([
            {
              id: "NF-101",
              number: "NF-101",
              model: "Swift",
              type: "Hatchback",
              health: 82,
              engineStatus: "Good",
            },
            {
              id: "NF-102",
              number: "NF-102",
              model: "Ertiga",
              type: "SUV",
              health: 43,
              engineStatus: "Warning",
            },
            {
              id: "NF-103",
              number: "NF-103",
              model: "City",
              type: "Sedan",
              health: 18,
              engineStatus: "Critical",
            },
          ]);
        }
      } catch (err) {
        console.error("Failed to load predictive maintenance data", err);
        if (mounted) setVehicles([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  // This is intentionally local-only (no backend endpoint currently defined).
  const updateHealthLocally = (id, delta) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id !== id) return v;
        const next = Math.max(0, Math.min(100, (v.health ?? 0) + delta));
        return { ...v, health: next };
      })
    );
  };

  return (
    <div data-testid="admin-predictive-page">
      <h1 className="text-3xl font-bold" data-testid="admin-predictive-title">Predictive Maintenance</h1>
      <p className="mt-2 text-muted-foreground">
        Monitor vehicle health and maintenance alerts.
      </p>

      {loading ? (
        <p className="mt-6 text-muted-foreground" data-testid="predictive-loading">Loading…</p>
      ) : (
        <div
          className="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2 lg:grid-cols-3"
          data-testid="predictive-vehicle-grid"
        >
          {enrichedVehicles.map((v) => (
            <div
              key={v.id}
              className="p-6 rounded-xl border border-border/40 bg-card shadow-sm"
              data-testid="predictive-vehicle-card"
            >
              <h2 className="text-xl font-semibold text-primary">{v.number}</h2>
              <p className="text-muted-foreground">Model: {v.model}</p>
              <p className="text-muted-foreground">Type: {v.type}</p>

              <p className="mt-2">
                Health{" "}
                <span
                  className={`px-2 py-1 rounded font-medium text-sm ${v.healthColor}`}
                  data-testid="predictive-health-badge"
                >
                  {v.health}% — {v.healthStatus}
                </span>
              </p>

              <p className="mt-1 text-muted-foreground">
                Engine Status: {v.engineStatus}
              </p>

              <div className="flex gap-2 mt-4">
                <button
                  className="flex-1 px-2 py-1 text-white transition bg-green-600 rounded-xl hover:bg-green-700 disabled:opacity-50"
                  onClick={() => updateHealthLocally(v.id, +10)}
                  disabled={v.health >= 100}
                  type="button"
                  data-testid="predictive-health-inc"
                >
                  +10
                </button>
                <button
                  className="flex-1 px-2 py-1 text-white transition bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50"
                  onClick={() => updateHealthLocally(v.id, -10)}
                  disabled={v.health <= 0}
                  type="button"
                  data-testid="predictive-health-dec"
                >
                  -10
                </button>
              </div>
            </div>
          ))}

          {enrichedVehicles.length === 0 && (
            <p className="mt-6 text-center text-muted-foreground col-span-full" data-testid="predictive-empty">
              No vehicles found.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default PredictiveMaintenance;
