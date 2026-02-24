"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GalaxyRedshift() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Galaxy Redshift Simulator</CardTitle>
        <p className="text-sm text-muted-foreground">
          Watch spectral absorption and emission lines shift as a galaxy recedes — a direct
          measurement of cosmic expansion through redshift z.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-16 bg-gradient-to-r from-violet-900/20 via-green-900/20 to-red-900/20 blur-sm" />
          </div>
          <div className="text-center z-10">
            <p className="text-emerald-400 text-2xl font-mono mb-3">
              1 + z = λ<sub>obs</sub> / λ<sub>emit</sub>
            </p>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-xs text-blue-300 bg-blue-400/10 px-2 py-0.5 rounded">Hα</span>
              <span className="text-xs text-cyan-300 bg-cyan-400/10 px-2 py-0.5 rounded">Hβ</span>
              <span className="text-xs text-violet-300 bg-violet-400/10 px-2 py-0.5 rounded">Ca II K</span>
              <span className="text-xs text-pink-300 bg-pink-400/10 px-2 py-0.5 rounded">O III</span>
            </div>
            <p className="text-gray-500 text-xs">
              Lines shift redward as z increases — stretching with the expanding universe
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Redshift z
            </label>
            <div className="h-9 bg-muted rounded-md flex items-center px-3">
              <span className="text-sm text-muted-foreground">0.0 — 3.0</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Galaxy Type
            </label>
            <div className="h-9 bg-muted rounded-md flex items-center px-3">
              <span className="text-sm text-muted-foreground">Spiral · Elliptical · Starburst</span>
            </div>
          </div>
        </div>

        <div className="rounded-md bg-emerald-950/30 border border-emerald-900/40 p-3">
          <p className="text-emerald-300 text-sm font-medium mb-1">What you&apos;ll explore</p>
          <ul className="text-emerald-200/70 text-xs space-y-1 list-disc list-inside">
            <li>Slide redshift to watch spectral lines shift across the visible spectrum</li>
            <li>Identify common absorption and emission features (Hα, Ca II, O III)</li>
            <li>Connect observed wavelength shift to recession velocity and distance</li>
          </ul>
        </div>

        <p className="text-center text-muted-foreground text-sm italic">
          Interactive simulation coming soon
        </p>
      </CardContent>
    </Card>
  );
}
