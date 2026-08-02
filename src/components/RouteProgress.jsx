import React from "react";

export default function RouteProgress({ current, total }) {
  const pct = total > 0 ? Math.min(100, (current / total) * 100) : 0;
  return (
    <div className="route-track">
      <div className="route-line" />
      <div className="route-fill" style={{ width: `${pct}%` }} />
      <div className="route-dot" style={{ left: `calc(${pct}% - 6px)` }} />
      <div className="route-flag">⛩️</div>
    </div>
  );
}
