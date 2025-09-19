export function Dashboard() {
  return (
    <div className="flex w-full min-h-screen bg-page-background">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex w-full h-16 items-center justify-between px-8 border-b border-border bg-white">
          <div className="flex items-center gap-4">
            <h1 className="text-text-primary font-roboto text-xl font-bold">
              Dashboard
            </h1>
          </div>
          <button
            onClick={() => (window.location.href = "/")}
            className="text-text-secondary hover:text-text-primary font-roboto text-sm transition-colors"
          >
            Back to Identity Verification
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <div className="space-y-3">
              <h2 className="text-text-primary font-roboto text-2xl font-bold">
                Welcome to your Dashboard
              </h2>
              <p className="text-text-secondary font-roboto text-base max-w-md">
                Your identity has been successfully verified. You now have
                access to your account dashboard.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto mt-12">
              <div className="p-6 bg-white rounded-lg border border-border">
                <h3 className="font-roboto font-semibold text-text-primary mb-2">
                  Profile
                </h3>
                <p className="text-text-secondary text-sm">
                  Manage your personal information
                </p>
              </div>

              <div className="p-6 bg-white rounded-lg border border-border">
                <h3 className="font-roboto font-semibold text-text-primary mb-2">
                  Security
                </h3>
                <p className="text-text-secondary text-sm">
                  View and update security settings
                </p>
              </div>

              <div className="p-6 bg-white rounded-lg border border-border">
                <h3 className="font-roboto font-semibold text-text-primary mb-2">
                  Activity
                </h3>
                <p className="text-text-secondary text-sm">
                  Check your recent activity logs
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
