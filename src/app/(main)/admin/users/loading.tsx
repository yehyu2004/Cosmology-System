export default function UsersLoading() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-pulse">
      <div>
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-4 w-32 bg-gray-100 dark:bg-gray-800/50 rounded mt-2" />
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-9 w-24 bg-gray-100 dark:bg-gray-800/50 rounded-lg" />
        ))}
      </div>
      <div className="h-10 w-full bg-gray-100 dark:bg-gray-800/50 rounded-lg" />
      <div className="h-64 bg-gray-100 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800" />
    </div>
  );
}
