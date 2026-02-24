export default function AssignmentsLoading() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-40 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-10 w-44 bg-gray-100 dark:bg-gray-800/50 rounded-lg" />
      </div>
      <div className="grid gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800" />
        ))}
      </div>
    </div>
  );
}
