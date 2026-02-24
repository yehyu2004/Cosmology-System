export default function AssignmentDetailLoading() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded" />
        <div>
          <div className="h-7 w-48 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-4 w-32 bg-gray-100 dark:bg-gray-800/50 rounded mt-2" />
        </div>
      </div>
      <div className="h-32 bg-gray-100 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800" />
      <div className="h-48 bg-gray-100 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800" />
    </div>
  );
}
