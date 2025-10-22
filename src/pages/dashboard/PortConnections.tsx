import { PortConnectionsDashboard } from "../../components/port/PortConnectionsDashboard";
import { DashboardLayout } from "../../layout/DashboardLayout";

export const PortConnections = () => {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-[#B9F3DF] via-[#E8F8F5] to-[#B9F3DF] overflow-x-hidden">
        <div className="w-full max-w-full mx-auto px-2 sm:px-3 lg:px-4 py-3 sm:py-4 lg:py-5">
          {/* Header */}
          <div className="mb-3 sm:mb-4 lg:mb-6">
            <div className="flex items-start space-x-2 sm:space-x-3">
              <button
                onClick={() => (window.location.href = "/dashboard")}
                className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 text-[#069B93] hover:bg-[#069B93] hover:text-white flex-shrink-0 mt-1"
              >
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>
              <div className="flex-1 min-w-0 w-full">
                <h1 className="text-sm sm:text-base lg:text-lg font-bold text-gray-800 mb-1 leading-tight break-words">
                  Update where you are
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed break-words overflow-wrap-anywhere">
                  Manage your ship's port connections and location updates
                </p>
              </div>
            </div>
          </div>

          <div className="w-full">
            <PortConnectionsDashboard />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
