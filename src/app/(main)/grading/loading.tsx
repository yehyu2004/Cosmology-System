export default function GradingLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div>
        <div className="h-8 w-28 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-4 w-64 bg-gray-100 dark:bg-gray-800/50 rounded mt-2" />
      </div>
      <div className="h-10 w-full sm:w-96 bg-gray-100 dark:bg-gray-800/50 rounded-lg" />
      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        <div className="w-full md:w-80 h-64 bg-gray-100 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800" />
        <div className="flex-1 h-96 bg-gray-100 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800" />
      </div>
    </div>
  );
}
