export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white">
          Overview
        </h1>

        <p className="text-zinc-500 mt-2">
          Centralized Authentication Platform Dashboard
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <p className="text-zinc-400 text-sm">
            Total Users
          </p>

          <h2 className="text-4xl font-bold text-white mt-2">
            12
          </h2>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <p className="text-zinc-400 text-sm">
            OAuth Apps
          </p>

          <h2 className="text-4xl font-bold text-white mt-2">
            5
          </h2>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <p className="text-zinc-400 text-sm">
            Active Sessions
          </p>

          <h2 className="text-4xl font-bold text-white mt-2">
            18
          </h2>
        </div>
      </div>
    </div>
  );
}