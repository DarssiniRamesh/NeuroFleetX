import React, { useMemo, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

/**
 * Driver dashboard.
 * Note: Firebase was referenced in earlier versions but no Firebase config exists in this repo.
 * This dashboard uses placeholder booking data so the SPA runs cleanly.
 *
 * PUBLIC_INTERFACE
 */
export default function DriverDashboard() {
  const driverName =
    JSON.parse(localStorage.getItem("nf_user") || "null")?.name || "Driver";

  const [bookings] = useState(() => [
    {
      id: "B-1001",
      customerName: "Amit Verma",
      pickupLocation: "Central Park",
      dropLocation: "Riverside",
      status: "pending",
    },
    {
      id: "B-1002",
      customerName: "Neha Sharma",
      pickupLocation: "Warehouse",
      dropLocation: "Downtown",
      status: "completed",
    },
    {
      id: "B-1003",
      customerName: "Sara Ali",
      pickupLocation: "Main Street",
      dropLocation: "Airport",
      status: "in-progress",
    },
  ]);

  const [engineStatus] = useState("Good");

  const currentBooking =
    bookings.find((b) => b.status === "in-progress") || null;

  const pieData = useMemo(
    () => [
      { name: "Pending", value: bookings.filter((b) => b.status === "pending").length },
      { name: "Completed", value: bookings.filter((b) => b.status === "completed").length },
      { name: "In-Progress", value: bookings.filter((b) => b.status === "in-progress").length },
      { name: "Cancelled", value: bookings.filter((b) => b.status === "cancelled").length },
    ],
    [bookings]
  );

  const COLORS = ["#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"];

  return (
    <div>
      <h1 className="text-4xl font-bold">Welcome, {driverName}</h1>
      <p className="mt-2 text-muted-foreground">
        Here's your overview for today: bookings, routes, and vehicle health.
      </p>

      <div className="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-card p-6 rounded-xl border border-border/40 shadow-sm">
          <h2 className="text-lg text-muted-foreground">Upcoming Bookings</h2>
          <p className="text-3xl font-bold">{pieData[0].value}</p>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border/40 shadow-sm">
          <h2 className="text-lg text-muted-foreground">Engine Status</h2>
          <p className="text-3xl font-bold">{engineStatus}</p>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border/40 shadow-sm">
          <h2 className="text-lg text-muted-foreground">Completed Trips</h2>
          <p className="text-3xl font-bold">{pieData[1].value}</p>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border/40 shadow-sm">
          <h2 className="text-lg text-muted-foreground">Current Booking</h2>
          <p className="text-3xl font-bold">
            {currentBooking ? currentBooking.customerName : "None"}
          </p>
        </div>
      </div>

      {currentBooking && (
        <div className="mt-8 bg-card p-6 rounded-xl border border-border/40 shadow-sm">
          <h2 className="mb-4 text-2xl font-bold">Current Booking</h2>
          <p className="text-muted-foreground">
            <span className="font-semibold">Customer:</span>{" "}
            {currentBooking.customerName}
          </p>
          <p className="text-muted-foreground">
            <span className="font-semibold">Pickup:</span>{" "}
            {currentBooking.pickupLocation}
          </p>
          <p className="text-muted-foreground">
            <span className="font-semibold">Drop:</span>{" "}
            {currentBooking.dropLocation}
          </p>
          <p className="mt-2 text-muted-foreground">
            <span className="font-semibold">Status:</span>{" "}
            <span className="px-2 py-1 text-sm bg-muted rounded-md">
              {currentBooking.status}
            </span>
          </p>
        </div>
      )}

      <div className="mt-10">
        <h2 className="mb-4 text-2xl font-bold">All Bookings</h2>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            {bookings.length === 0 ? (
              <p className="text-muted-foreground">No bookings assigned yet.</p>
            ) : (
              <div className="space-y-4">
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-xl border border-border/40 bg-card shadow-sm"
                  >
                    <p className="text-muted-foreground">
                      <span className="font-semibold">Customer:</span>{" "}
                      {b.customerName}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="font-semibold">Pickup:</span>{" "}
                      {b.pickupLocation}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="font-semibold">Drop:</span>{" "}
                      {b.dropLocation}
                    </p>
                    <p className="mt-2 text-muted-foreground">
                      <span className="font-semibold">Status:</span>{" "}
                      <span className="px-2 py-1 text-sm bg-muted rounded-md">
                        {b.status}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Card className="bg-card border border-border/40 shadow-sm">
            <CardHeader className="items-center pb-0">
              <CardTitle>Booking Status</CardTitle>
              <CardDescription>Overview</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <div className="mx-auto aspect-square max-h-[320px]">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={100}
                    strokeWidth={5}
                  >
                    {pieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" align="center" iconType="circle" />
                </PieChart>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm text-muted-foreground">
              Showing total bookings by status
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
