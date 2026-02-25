// src/pages/admin/DriverManagement.jsx
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function DriverManagement() {
  const [drivers] = useState([
    { id: 1, name: "Rohit Kumar", phone: "9876543210" },
    { id: 2, name: "Anita Singh", phone: "9876501234" },
  ]);

  return (
    <div data-testid="admin-drivers-page">
      <h2 className="mb-4 text-xl font-semibold" data-testid="admin-drivers-title">
        Driver Management
      </h2>
      <div className="grid gap-4" data-testid="admin-drivers-list">
        {drivers.map((d) => (
          <Card key={d.id} data-testid="admin-driver-card">
            <CardHeader>
              <CardTitle data-testid="admin-driver-name">{d.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div data-testid="admin-driver-phone">Phone: {d.phone}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
