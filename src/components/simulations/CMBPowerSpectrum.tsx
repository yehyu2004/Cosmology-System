"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CMBPowerSpectrum() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">CMB Power Spectrum</CardTitle>
        <p className="text-sm text-muted-foreground">
          Analyze the angular power spectrum of the Cosmic Microwave Background — a snapshot of the
          universe at recombination (z ≈ 1100).
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_rgba(251,146,60,0.07)_0%,_transparent_60%)]" />
          <div className="text-center z-10">
            <p className="text-orange-400 text-2xl font-mono mb-3">
              C<sub>ℓ</sub> vs. ℓ
            </p>
            <p className="text-gray-400 text-sm mb-1">
              Temperature anisotropies ΔT/T ≈ 10⁻⁵ encode cosmological parameters
            </p>
            <p className="text-gray-500 text-xs">
              Acoustic peaks reveal Ω<sub>b</sub>, Ω<sub>m</sub>, Ω<sub>Λ</sub>, and H₀
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Ω<sub>b</sub>h² (baryons)
            </label>
            <div className="h-8 bg-muted rounded-md flex items-center px-2">
              <span className="text-xs text-muted-foreground">0.020 – 0.025</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Ω<sub>c</sub>h² (CDM)
            </label>
            <div className="h-8 bg-muted rounded-md flex items-center px-2">
              <span className="text-xs text-muted-foreground">0.10 – 0.14</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              H₀ (km/s/Mpc)
            </label>
            <div className="h-8 bg-muted rounded-md flex items-center px-2">
              <span className="text-xs text-muted-foreground">60 – 80</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              n<sub>s</sub> (spectral index)
            </label>
            <div className="h-8 bg-muted rounded-md flex items-center px-2">
              <span className="text-xs text-muted-foreground">0.93 – 1.00</span>
            </div>
          </div>
        </div>

        <div className="rounded-md bg-orange-950/30 border border-orange-900/40 p-3">
          <p className="text-orange-300 text-sm font-medium mb-1">What you&apos;ll explore</p>
          <ul className="text-orange-200/70 text-xs space-y-1 list-disc list-inside">
            <li>Adjust cosmological parameters and see peak positions shift</li>
            <li>Understand why the first peak constrains spatial curvature</li>
            <li>See how baryon density modulates odd vs. even peak heights</li>
          </ul>
        </div>

        <p className="text-center text-muted-foreground text-sm italic">
          Interactive simulation coming soon
        </p>
      </CardContent>
    </Card>
  );
}
