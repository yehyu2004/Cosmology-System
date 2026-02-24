"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FriedmannEquation() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Friedmann Equation Solver</CardTitle>
        <p className="text-sm text-muted-foreground">
          Evolve the scale factor a(t) under different matter, radiation, and dark energy densities
          using the Friedmann equations.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_50%,_rgba(239,68,68,0.06)_0%,_transparent_60%)]" />
          <div className="text-center z-10">
            <p className="text-red-400 text-lg font-mono mb-1">
              H² = (8πG/3)ρ − k/a²
            </p>
            <p className="text-red-400/70 text-sm font-mono mb-3">
              ä/a = −(4πG/3)(ρ + 3p)
            </p>
            <div className="flex items-center justify-center gap-4 text-xs font-mono">
              <span className="text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded">
                Ω<sub>r</sub> (radiation)
              </span>
              <span className="text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">
                Ω<sub>m</sub> (matter)
              </span>
              <span className="text-violet-400 bg-violet-400/10 px-2 py-0.5 rounded">
                Ω<sub>Λ</sub> (dark energy)
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Ω<sub>m</sub> (matter)
            </label>
            <div className="h-8 bg-muted rounded-md flex items-center px-2">
              <span className="text-xs text-muted-foreground">0.0 – 1.0</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Ω<sub>Λ</sub> (dark energy)
            </label>
            <div className="h-8 bg-muted rounded-md flex items-center px-2">
              <span className="text-xs text-muted-foreground">0.0 – 1.0</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Ω<sub>r</sub> (radiation)
            </label>
            <div className="h-8 bg-muted rounded-md flex items-center px-2">
              <span className="text-xs text-muted-foreground">0.0 – 0.01</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Curvature k
            </label>
            <div className="h-8 bg-muted rounded-md flex items-center px-2">
              <span className="text-xs text-muted-foreground">−1 · 0 · +1</span>
            </div>
          </div>
        </div>

        <div className="rounded-md bg-red-950/30 border border-red-900/40 p-3">
          <p className="text-red-300 text-sm font-medium mb-1">What you&apos;ll explore</p>
          <ul className="text-red-200/70 text-xs space-y-1 list-disc list-inside">
            <li>Plot a(t) for matter-dominated, radiation-dominated, and Λ-dominated eras</li>
            <li>Observe the transition from deceleration to acceleration</li>
            <li>Compare open, flat, and closed universe geometries</li>
            <li>See how the ΛCDM concordance model (Ω<sub>m</sub>=0.3, Ω<sub>Λ</sub>=0.7) evolves</li>
          </ul>
        </div>

        <p className="text-center text-muted-foreground text-sm italic">
          Interactive simulation coming soon
        </p>
      </CardContent>
    </Card>
  );
}
