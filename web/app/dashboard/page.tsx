export default function CustomerDashboard() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold text-blue-600">
            VALLEYFIX CUSTOMER PORTAL
          </p>

          <h1 className="mt-3 text-3xl font-bold text-slate-900">
            Welcome to your dashboard!
          </h1>

          <p className="mt-3 text-slate-600">
            You have successfully reached the customer dashboard.
            We'll add your bookings, quotes, payments and notifications here.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "My Bookings",
              "Quotes",
              "Payments",
              "Notifications",
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-slate-200 p-5"
              >
                <h2 className="font-semibold text-slate-800">{item}</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Coming soon
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}