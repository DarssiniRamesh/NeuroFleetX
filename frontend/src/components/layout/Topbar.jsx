// src/components/layout/Topbar.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

export default function Topbar({ user, onLogout }) {
  return (
    <header
      className="flex items-center justify-between h-16 px-6 border-b border-border/10 bg-card"
      data-testid="topbar"
    >
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-bold" data-testid="topbar-title">NeuroFleetX</h1>
        <span className="text-sm text-muted-foreground">Urban Mobility</span>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center pr-4 space-x-3" data-testid="topbar-user">
          <div className="text-sm text-right">
            <div className="font-medium" data-testid="topbar-user-name">{user?.name ?? "Guest"}</div>
            <div className="text-xs text-muted-foreground" data-testid="topbar-user-role">{user?.role ?? ""}</div>
          </div>
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent">
            <User size={18} />
          </div>
        </div>
        <Button variant="outline" onClick={onLogout} data-testid="topbar-logout">
          Logout
        </Button>
      </div>
    </header>
  );
}
