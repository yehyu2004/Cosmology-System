"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GalaxyRotationCurve() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Galaxy Rotation Curve</CardTitle>
        <p className="text-sm text-muted-foreground">
          Compare observed flat rotation curves with Keplerian predictions — key evidence for dark
          matter halos surrounding galaxies.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_60%,_rgba(168,85,247,0.07)_0%,_transparent_60%)]" />
          <div className="text-center z-10">
            <p className="text-purple-400 text-xl font-mono mb-2">
              v(r) vs. r
            </p>
            <div className="flex items-center justify-center gap-6 mb-3 text-xs font-mono">
              <span className="text-gray-500">
                <span className="inline-block w-4 h-0.5 bg-gray-500 align-middle mr-1" />
                Keplerian: v ∝ r<sup>−1/2</sup>
              </span>
              <span className="text-purple-400">
                <span className="inline-block w-4 h-0.5 bg-purple-400 align-middle mr-1" />
                Observed: v ≈ const
              </span>
            </div>
            <p className="text-gray-500 text-xs">
              Flat curves imply M(r) ∝ r — unseen mass dominates at large radii
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Disk Mass (10¹⁰ M☉)
            </label>
            <div className="h-9 bg-muted rounded-md flex items-center px-3">
              <span className="text-sm text-muted-foreground">1 — 20</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Halo Mass (10¹² M☉)
            </label>
            <div className="h-9 bg-muted rounded-md flex items-center px-3">
              <span className="text-sm text-muted-foreground">0.1 — 5</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Halo Scale Radius (kpc)
            </label>
            <div className="h-9 bg-muted rounded-md flex items-center px-3">
              <span className="text-sm text-muted-foreground">5 — 50</span>
            </div>
          </div>
        </div>

        <div className="rounded-md bg-purple-950/30 border border-purple-900/40 p-3">
          <p className="text-purple-300 text-sm font-medium mb-1">What you&apos;ll explore</p>
          <ul className="text-purple-200/70 text-xs space-y-1 list-disc list-inside">
            <li>Decompose contributions from bulge, disk, gas, and dark matter halo</li>
            <li>Fit an NFW profile to reproduce flat rotation curves</li>
            <li>See why Keplerian falloff fails beyond the optical disk</li>
          </ul>
        </div>

        <p className="text-center text-muted-foreground text-sm italic">
          Interactive simulation coming soon
        </p>
      </CardContent>
    </Card>
  );
}
