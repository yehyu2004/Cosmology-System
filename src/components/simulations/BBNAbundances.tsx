"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BBNAbundances() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">BBN Primordial Abundances</CardTitle>
        <p className="text-sm text-muted-foreground">
          Explore Big Bang Nucleosynthesis: how light element abundances (H, D, ³He, ⁴He, ⁷Li)
          depend on the baryon-to-photon ratio η.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,_rgba(34,197,94,0.06)_0%,_transparent_60%)]" />
          <div className="text-center z-10">
            <p className="text-green-400 text-xl font-mono mb-3">
              Abundance vs. η (baryon-to-photon ratio)
            </p>
            <div className="flex items-center justify-center gap-3 mb-2 text-xs font-mono flex-wrap">
              <span className="text-red-400 bg-red-400/10 px-2 py-0.5 rounded">⁴He (Y<sub>p</sub>)</span>
              <span className="text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">D/H</span>
              <span className="text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded">³He/H</span>
              <span className="text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded">⁷Li/H</span>
            </div>
            <p className="text-gray-500 text-xs">
              η ≈ 6.1 × 10⁻¹⁰ — constrained by CMB and deuterium observations
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              η × 10¹⁰ (baryon-to-photon)
            </label>
            <div className="h-9 bg-muted rounded-md flex items-center px-3">
              <span className="text-sm text-muted-foreground">1 — 10</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              N<sub>eff</sub> (neutrino species)
            </label>
            <div className="h-9 bg-muted rounded-md flex items-center px-3">
              <span className="text-sm text-muted-foreground">2 — 4</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Neutron Lifetime (s)
            </label>
            <div className="h-9 bg-muted rounded-md flex items-center px-3">
              <span className="text-sm text-muted-foreground">870 — 890</span>
            </div>
          </div>
        </div>

        <div className="rounded-md bg-green-950/30 border border-green-900/40 p-3">
          <p className="text-green-300 text-sm font-medium mb-1">What you&apos;ll explore</p>
          <ul className="text-green-200/70 text-xs space-y-1 list-disc list-inside">
            <li>Trace how ⁴He mass fraction Y<sub>p</sub> rises gently with η while D/H drops steeply</li>
            <li>See why deuterium is the best &quot;baryometer&quot; of the early universe</li>
            <li>Investigate the cosmological lithium problem (predicted vs. observed ⁷Li)</li>
            <li>Adjust N<sub>eff</sub> to see how extra neutrino species alter freeze-out</li>
          </ul>
        </div>

        <p className="text-center text-muted-foreground text-sm italic">
          Interactive simulation coming soon
        </p>
      </CardContent>
    </Card>
  );
}
