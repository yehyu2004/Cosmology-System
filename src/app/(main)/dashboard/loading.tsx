export default function DashboardLoading() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-pulse">
      {/* Welcome */}
      <div>
        <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-4 w-48 bg-gray-100 dark:bg-gray-800/50 rounded mt-2" />
      </div>
      {/* Stats */}
      <div>
        <div className="h-5 w-24 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800" />
          ))}
        </div>
      </div>
      {/* Quick Start */}
      <div>
        <div className="h-5 w-28 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-gray-100 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800" />
          ))}
        </div>
      </div>
    </div>
  );
}
