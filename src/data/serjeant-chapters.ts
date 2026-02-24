export interface SimulationInfo {
  id: string;
  title: string;
  description: string;
}

export interface Chapter {
  number: number;
  title: string;
  simulation?: SimulationInfo;
}

export interface Part {
  number: number;
  title: string;
  color: string;
  bgClass: string;
  iconColor: string;
  chapters: Chapter[];
}

export const textbookParts: Part[] = [
  {
    number: 1,
    title: "The Expanding Universe",
    color: "from-blue-500 to-indigo-600",
    bgClass: "bg-blue-500/10 dark:bg-blue-500/20",
    iconColor: "text-blue-500",
    chapters: [
      {
        number: 1,
        title: "The Expanding Universe",
        simulation: {
          id: "hubble-expansion",
          title: "Hubble Expansion Simulator",
          description:
            "Place galaxies in 2D space and watch them recede. Adjust H₀ and choose any galaxy as the observer to demonstrate the cosmological principle.",
        },
      },
      {
        number: 2,
        title: "The Cosmic Distance Ladder",
        simulation: {
          id: "cosmic-distance-ladder",
          title: "Cosmic Distance Ladder",
          description:
            "Step through parallax, Cepheids, Type Ia supernovae, and the Hubble flow. Each rung calibrates the next.",
        },
      },
      {
        number: 3,
        title: "The Cosmic Microwave Background",
        simulation: {
          id: "cmb-power-spectrum",
          title: "CMB Power Spectrum Explorer",
          description:
            "Adjust Ωm, Ωb, ΩΛ, and h to see how the angular power spectrum changes. Identify acoustic peaks.",
        },
      },
    ],
  },
  {
    number: 2,
    title: "Dark Matter & Structure",
    color: "from-purple-500 to-violet-600",
    bgClass: "bg-purple-500/10 dark:bg-purple-500/20",
    iconColor: "text-purple-500",
    chapters: [
      {
        number: 4,
        title: "Galaxy Rotation Curves & Dark Matter",
        simulation: {
          id: "galaxy-rotation-curve",
          title: "Dark Matter Rotation Curve",
          description:
            "Compare the expected Keplerian decline with observed flat rotation curves. Add a dark matter halo to match observations.",
        },
      },
      {
        number: 5,
        title: "Galaxy Redshift & Spectra",
        simulation: {
          id: "galaxy-redshift",
          title: "Galaxy Redshift & Hubble Diagram",
          description:
            "Watch spectral lines shift as you increase redshift z. Plot galaxies on a Hubble diagram.",
        },
      },
    ],
  },
  {
    number: 3,
    title: "The Friedmann Universe",
    color: "from-amber-500 to-orange-600",
    bgClass: "bg-amber-500/10 dark:bg-amber-500/20",
    iconColor: "text-amber-500",
    chapters: [
      {
        number: 6,
        title: "The Friedmann Equation",
        simulation: {
          id: "friedmann-equation",
          title: "Friedmann Universe Evolution",
          description:
            "Solve the Friedmann equation numerically. See how different Ωm and ΩΛ values determine the fate of the universe.",
        },
      },
      {
        number: 7,
        title: "Big Bang Nucleosynthesis",
        simulation: {
          id: "bbn-abundances",
          title: "Big Bang Nucleosynthesis",
          description:
            "Adjust the baryon-to-photon ratio η and see predicted light element abundances with observational constraints.",
        },
      },
    ],
  },
  {
    number: 4,
    title: "Cosmic Overview",
    color: "from-emerald-500 to-teal-600",
    bgClass: "bg-emerald-500/10 dark:bg-emerald-500/20",
    iconColor: "text-emerald-500",
    chapters: [
      {
        number: 8,
        title: "The Cosmic Timeline",
        simulation: {
          id: "cosmic-timeline",
          title: "Cosmic Timeline",
          description:
            "Interactive timeline from the Big Bang to the present. Click epochs to learn about inflation, recombination, reionization, and galaxy formation.",
        },
      },
    ],
  },
];

export function getAllSimulations(): SimulationInfo[] {
  return textbookParts.flatMap((part) =>
    part.chapters.filter((ch) => ch.simulation).map((ch) => ch.simulation!)
  );
}

export function getSimulationById(id: string): SimulationInfo | undefined {
  return getAllSimulations().find((s) => s.id === id);
}
