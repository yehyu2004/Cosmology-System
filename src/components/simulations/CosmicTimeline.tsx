"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CosmicTimeline() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Cosmic Timeline</CardTitle>
        <p className="text-sm text-muted-foreground">
          Journey through the major epochs of the universe — from the Big Bang and inflation to the
          present day, spanning 13.8 billion years.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-900/10 via-blue-900/10 to-violet-900/10" />
          <div className="text-center z-10 w-full px-6">
            <p className="text-cyan-400 text-lg font-mono mb-4">
              t = 0 → 13.8 Gyr
            </p>
            <div className="flex items-center justify-between text-[10px] sm:text-xs font-mono w-full max-w-lg mx-auto">
              <div className="text-center">
                <div className="w-2 h-2 rounded-full bg-yellow-400 mx-auto mb-1" />
                <span className="text-yellow-400">Big Bang</span>
                <br />
                <span className="text-gray-600">t = 0</span>
              </div>
              <div className="text-center">
                <div className="w-2 h-2 rounded-full bg-orange-400 mx-auto mb-1" />
                <span className="text-orange-400">BBN</span>
                <br />
                <span className="text-gray-600">~3 min</span>
              </div>
              <div className="text-center">
                <div className="w-2 h-2 rounded-full bg-red-400 mx-auto mb-1" />
                <span className="text-red-400">CMB</span>
                <br />
                <span className="text-gray-600">380 kyr</span>
              </div>
              <div className="text-center">
                <div className="w-2 h-2 rounded-full bg-blue-400 mx-auto mb-1" />
                <span className="text-blue-400">Reionization</span>
                <br />
                <span className="text-gray-600">~400 Myr</span>
              </div>
              <div className="text-center">
                <div className="w-2 h-2 rounded-full bg-violet-400 mx-auto mb-1" />
                <span className="text-violet-400">Today</span>
                <br />
                <span className="text-gray-600">13.8 Gyr</span>
              </div>
            </div>
            <div className="w-full max-w-lg mx-auto mt-2 h-0.5 bg-gradient-to-r from-yellow-500/40 via-red-500/40 to-violet-500/40 rounded" />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="rounded-md bg-yellow-950/20 border border-yellow-900/30 p-2 text-center">
            <p className="text-yellow-400 text-xs font-semibold">Planck Epoch</p>
            <p className="text-yellow-200/50 text-[10px]">t &lt; 10⁻⁴³ s</p>
          </div>
          <div className="rounded-md bg-orange-950/20 border border-orange-900/30 p-2 text-center">
            <p className="text-orange-400 text-xs font-semibold">Inflation</p>
            <p className="text-orange-200/50 text-[10px]">10⁻³⁶ – 10⁻³² s</p>
          </div>
          <div className="rounded-md bg-red-950/20 border border-red-900/30 p-2 text-center">
            <p className="text-red-400 text-xs font-semibold">Matter–Radiation Eq.</p>
            <p className="text-red-200/50 text-[10px]">~47 kyr</p>
          </div>
          <div className="rounded-md bg-violet-950/20 border border-violet-900/30 p-2 text-center">
            <p className="text-violet-400 text-xs font-semibold">Dark Energy Dominance</p>
            <p className="text-violet-200/50 text-[10px]">~9.8 Gyr</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Select Epoch to Explore
          </label>
          <div className="h-9 bg-muted rounded-md flex items-center px-3">
            <span className="text-sm text-muted-foreground">
              Planck · Inflation · BBN · Recombination · Dark Ages · Reionization · Present
            </span>
          </div>
        </div>

        <div className="rounded-md bg-cyan-950/30 border border-cyan-900/40 p-3">
          <p className="text-cyan-300 text-sm font-medium mb-1">What you&apos;ll explore</p>
          <ul className="text-cyan-200/70 text-xs space-y-1 list-disc list-inside">
            <li>Scroll through cosmic history on a logarithmic timescale</li>
            <li>See temperature, density, and dominant energy component at each epoch</li>
            <li>Understand key transitions: nucleosynthesis, recombination, reionization</li>
            <li>Connect physical processes to observable signatures (CMB, element abundances, galaxy surveys)</li>
          </ul>
        </div>

        <p className="text-center text-muted-foreground text-sm italic">
          Interactive simulation coming soon
        </p>
      </CardContent>
    </Card>
  );
}
