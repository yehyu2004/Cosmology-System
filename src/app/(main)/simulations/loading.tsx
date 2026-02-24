export default function SimulationsLoading() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-pulse">
      <div>
        <div className="h-8 w-40 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-4 w-80 bg-gray-100 dark:bg-gray-800/50 rounded mt-2" />
      </div>
      {[1, 2].map((i) => (
        <div key={i} className="space-y-4">
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-36 bg-gray-100 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800" />
            <div className="h-36 bg-gray-100 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800" />
          </div>
        </div>
      ))}
    </div>
  );
}
