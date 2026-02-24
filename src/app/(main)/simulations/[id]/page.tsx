"use client";

import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSimulationById } from "@/data/serjeant-chapters";

const simulationComponents: Record<string, React.ComponentType> = {
  "hubble-expansion": dynamic(() => import("@/components/simulations/HubbleExpansion"), { ssr: false }),
  "cosmic-distance-ladder": dynamic(() => import("@/components/simulations/CosmicDistanceLadder"), { ssr: false }),
  "cmb-power-spectrum": dynamic(() => import("@/components/simulations/CMBPowerSpectrum"), { ssr: false }),
  "galaxy-rotation-curve": dynamic(() => import("@/components/simulations/GalaxyRotationCurve"), { ssr: false }),
  "galaxy-redshift": dynamic(() => import("@/components/simulations/GalaxyRedshift"), { ssr: false }),
  "friedmann-equation": dynamic(() => import("@/components/simulations/FriedmannEquation"), { ssr: false }),
  "bbn-abundances": dynamic(() => import("@/components/simulations/BBNAbundances"), { ssr: false }),
  "cosmic-timeline": dynamic(() => import("@/components/simulations/CosmicTimeline"), { ssr: false }),
};

export default function SimulationViewPage() {
  const params = useParams();
  const router = useRouter();
  const simId = params.id as string;
  const simInfo = getSimulationById(simId);
  const SimComponent = simulationComponents[simId];

  if (!simInfo || !SimComponent) {
    return (
      <div className="p-6 text-center text-gray-500">
        Simulation not found.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {simInfo.title}
          </h1>
          <p className="text-sm text-gray-500">{simInfo.description}</p>
        </div>
      </div>

      <SimComponent />
    </div>
  );
}
