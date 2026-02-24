"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CosmicDistanceLadder() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Cosmic Distance Ladder</CardTitle>
        <p className="text-sm text-muted-foreground">
          Visualize the chain of methods astronomers use to measure distances across the universe.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(234,179,8,0.06)_0%,_transparent_60%)]" />
          <div className="text-center z-10 space-y-4">
            <div className="flex items-center justify-center gap-3 text-sm font-mono">
              <span className="text-green-400 bg-green-400/10 px-2 py-1 rounded">Parallax</span>
              <span className="text-gray-600">→</span>
              <span className="text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">Cepheids</span>
              <span className="text-gray-600">→</span>
              <span className="text-red-400 bg-red-400/10 px-2 py-1 rounded">Type Ia SNe</span>
            </div>
            <p className="text-gray-400 text-sm">
              Each rung calibrates the next — from parsecs to gigaparsecs
            </p>
            <p className="text-gray-500 text-xs">
              d = 1/p (parallax) · P–L relation (Cepheids) · standard candles (SNe Ia)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-md bg-green-950/20 border border-green-900/30 p-3 text-center">
            <p className="text-green-400 text-xs font-semibold mb-1">Rung 1: Parallax</p>
            <p className="text-green-200/60 text-xs">d &lt; 100 pc</p>
            <p className="text-green-200/40 text-[10px] mt-1">Geometric baseline method</p>
          </div>
          <div className="rounded-md bg-yellow-950/20 border border-yellow-900/30 p-3 text-center">
            <p className="text-yellow-400 text-xs font-semibold mb-1">Rung 2: Cepheids</p>
            <p className="text-yellow-200/60 text-xs">d &lt; 30 Mpc</p>
            <p className="text-yellow-200/40 text-[10px] mt-1">Period–luminosity relation</p>
          </div>
          <div className="rounded-md bg-red-950/20 border border-red-900/30 p-3 text-center">
            <p className="text-red-400 text-xs font-semibold mb-1">Rung 3: Type Ia SNe</p>
            <p className="text-red-200/60 text-xs">d &gt; 1 Gpc</p>
            <p className="text-red-200/40 text-[10px] mt-1">Standard candle explosions</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Select Distance Rung
          </label>
          <div className="h-9 bg-muted rounded-md flex items-center px-3">
            <span className="text-sm text-muted-foreground">Parallax · Cepheids · Type Ia SNe</span>
          </div>
        </div>

        <div className="rounded-md bg-yellow-950/30 border border-yellow-900/40 p-3">
          <p className="text-yellow-300 text-sm font-medium mb-1">What you&apos;ll explore</p>
          <ul className="text-yellow-200/70 text-xs space-y-1 list-disc list-inside">
            <li>Step through each rung and see how uncertainties propagate</li>
            <li>Fit Cepheid period–luminosity data to derive distances</li>
            <li>Compare Type Ia supernova light curves as standard candles</li>
          </ul>
        </div>

        <p className="text-center text-muted-foreground text-sm italic">
          Interactive simulation coming soon
        </p>
      </CardContent>
    </Card>
  );
}
