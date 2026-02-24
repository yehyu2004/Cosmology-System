"use client";

import Link from "next/link";
import { FlaskConical } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { textbookParts } from "@/data/serjeant-chapters";

export default function SimulationsPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Simulations</h1>
        <p className="text-gray-500 mt-1">
          Interactive simulations based on &ldquo;Observational Cosmology&rdquo; by Stephen Serjeant
        </p>
      </div>

      {textbookParts.map((part) => (
        <div key={part.number}>
          <div className="flex items-center gap-3 mb-4">
            <Badge
              className={`bg-gradient-to-r ${part.color} text-white border-0`}
            >
              Part {part.number}
            </Badge>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {part.title}
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {part.chapters
              .filter((ch) => ch.simulation)
              .map((ch) => (
                <Link
                  key={ch.simulation!.id}
                  href={`/simulations/${ch.simulation!.id}`}
                >
                  <Card className="h-full hover:border-indigo-500/30 transition-colors cursor-pointer">
                    <CardContent className="flex gap-4 py-4">
                      <div
                        className={`flex items-center justify-center w-12 h-12 rounded-xl shrink-0 ${part.bgClass}`}
                      >
                        <FlaskConical className={`w-6 h-6 ${part.iconColor}`} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Chapter {ch.number}: {ch.title}
                        </p>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {ch.simulation!.title}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {ch.simulation!.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
