"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HubbleExpansion() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Hubble Expansion Simulator</CardTitle>
        <p className="text-sm text-muted-foreground">
          Explore Hubble&apos;s Law: the linear relationship between galaxy recession velocity and distance.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.08)_0%,_transparent_70%)]" />
          <div className="text-center z-10">
            <p className="text-blue-400 text-2xl font-mono mb-3">v = H₀ × d</p>
            <p className="text-gray-400 text-sm mb-1">
              Recession velocity (km/s) scales linearly with distance (Mpc)
            </p>
            <p className="text-gray-500 text-xs">
              H₀ ≈ 70 km/s/Mpc — the current expansion rate of the universe
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Hubble Constant H₀ (km/s/Mpc)
            </label>
            <div className="h-9 bg-muted rounded-md flex items-center px-3">
              <span className="text-sm text-muted-foreground">50 — 100</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Galaxy Distance (Mpc)
            </label>
            <div className="h-9 bg-muted rounded-md flex items-center px-3">
              <span className="text-sm text-muted-foreground">1 — 500</span>
            </div>
          </div>
        </div>

        <div className="rounded-md bg-blue-950/30 border border-blue-900/40 p-3">
          <p className="text-blue-300 text-sm font-medium mb-1">What you&apos;ll explore</p>
          <ul className="text-blue-200/70 text-xs space-y-1 list-disc list-inside">
            <li>Plot recession velocity vs. distance for simulated galaxies</li>
            <li>Adjust H₀ to see how expansion rate changes the slope</li>
            <li>Observe scatter from peculiar velocities at short distances</li>
          </ul>
        </div>

        <p className="text-center text-muted-foreground text-sm italic">
          Interactive simulation coming soon
        </p>
      </CardContent>
    </Card>
  );
}
