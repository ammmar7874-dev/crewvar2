import { useState } from "react";
// TODO: Implement Firebase port connection and quick check-in functionality
import { PortConnectionForm } from "./PortConnectionForm";
import { WhosInPort } from "./WhosInPort";
// import { getConnectionDuration } from "../data/port-connections-data";

const getConnectionDuration = (_startTime: string, _endTime: string) => {
  // Placeholder function
  return "2 hours";
};

export const PortConnectionsDashboard = () => {
  // TODO: Implement Firebase quick check-in and port connection functionality
  const currentShip = {
    shipId: "sample-ship-id",
    shipName: "Sample Ship",
    port: "Sample Port",
  };
  const getConnectionsForShip = (shipId: string, date: string) => {
    // Placeholder function
    console.log("Get connections for ship:", shipId, date);
    return [
      {
        id: "conn-1",
        dockedWithShipName: "Sample Ship 2",
        portName: "Sample Port",
        startTime: "2024-01-01T10:00:00Z",
        endTime: "2024-01-01T12:00:00Z",
      },
    ];
  };
  const removePortConnection = async (connectionId: string) => {
    // Placeholder function
    console.log("Remove port connection:", connectionId);
  };
  const [showPortForm, setShowPortForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});

  if (!currentShip) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-gray-400 text-2xl">🚢</span>
          </div>
          <p className="text-gray-500 text-lg mb-2">No ship selected</p>
          <p className="text-gray-400 text-sm">
            Please select your current ship to manage port connections.
          </p>
        </div>
      </div>
    );
  }

  const currentConnections = getConnectionsForShip(
    currentShip.shipId,
    selectedDate
  );

  const handleRemoveConnection = async (connectionId: string) => {
    setIsLoading((prev) => ({ ...prev, [connectionId]: true }));

    try {
      await removePortConnection(connectionId);
    } catch (error) {
      console.error("Failed to remove connection:", error);
    } finally {
      setIsLoading((prev) => ({ ...prev, [connectionId]: false }));
    }
  };

  // const handleConnect = (userId: string, userName: string) => {
  //     console.log(`Connection request sent to ${userName} (${userId})`);
  //     // In a real app, this would send a connection request
  // };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-2 sm:p-3 lg:p-4">
        <div className="space-y-4 mb-6">
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-[#069B93] flex-shrink-0 mt-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <div className="flex-1 min-w-0 w-full">
                <h1 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 leading-tight">
                  Port Connections
                </h1>
                <p className="text-gray-600 mt-1 text-xs sm:text-sm leading-relaxed break-words overflow-wrap-anywhere">
                  Manage your ship's location and connections with other vessels
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPortForm(true)}
              className="w-full px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-[#069B93] to-[#00A59E] text-white rounded-xl hover:from-[#058a7a] hover:to-[#069B93] transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span className="text-sm sm:text-base">Mark Cruise Line</span>
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3 sm:p-4">
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start space-y-2 sm:space-y-0 sm:space-x-3">
              <div className="w-6 h-6 sm:w-7 sm:h-7 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-blue-900 mb-3 text-sm sm:text-base leading-tight">
                  How Port Connections Work
                </h4>
                <div className="space-y-2">
                  <p className="text-xs sm:text-sm text-blue-700 leading-relaxed">
                    Mark when your ship is docked with another ship in the same
                    port.
                  </p>
                  <p className="text-xs sm:text-sm text-blue-700 leading-relaxed">
                    This allows you to see and connect with crew members from
                    other ships docked nearby.
                  </p>
                  <p className="text-xs sm:text-sm text-blue-700 leading-relaxed font-medium">
                    Stay connected with the maritime community!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Ship Info */}
      <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center space-x-2 mb-4">
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 text-[#069B93] flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <span className="break-words">Your Ship</span>
        </h2>
        <div className="bg-gradient-to-r from-[#069B93]/10 to-[#00A59E]/10 rounded-xl p-4 sm:p-5 border border-[#069B93]/20">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#069B93] rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <svg
                  className="w-6 h-6 sm:w-8 sm:h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                  {currentShip.shipName}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <svg
                    className="w-4 h-4 text-[#069B93] flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-gray-600 font-medium text-sm sm:text-base">
                    {currentShip.port || "No port assigned"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-center sm:justify-end">
              <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-2 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Connections */}
      <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
            <svg
              className="w-6 h-6 text-[#069B93]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            <span>Your Port Connections</span>
          </h2>
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-gray-700">Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#069B93] focus:ring-2 focus:ring-[#069B93]/20 focus:outline-none transition-all duration-200"
            />
          </div>
        </div>

        {currentConnections.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-r from-[#069B93]/20 to-[#00A59E]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-132 h-10 text-[#069B93]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No port connections yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Mark your port status to connect with crew members from other
              ships docked nearby.
            </p>
            <button
              onClick={() => setShowPortForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-[#069B93] to-[#00A59E] text-white rounded-xl hover:from-[#058a7a] hover:to-[#069B93] transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center space-x-2 mx-auto"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span>Mark Cruise Line</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {currentConnections.map((connection) => (
              <div
                key={connection.id}
                className="bg-gradient-to-r from-[#069B93]/5 to-[#00A59E]/5 border border-[#069B93]/20 rounded-xl p-4 hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#069B93] rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                      <svg
                        className="w-6 h-6 sm:w-7 sm:h-7 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base leading-tight">
                        Docked with {connection.dockedWithShipName}
                      </h4>
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 mt-2">
                        <div className="flex items-center space-x-2">
                          <svg
                            className="w-4 h-4 text-[#069B93] flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm text-gray-600">
                            {connection.portName}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <svg
                            className="w-4 h-4 text-[#069B93] flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm text-gray-600">
                            {getConnectionDuration(
                              connection.startTime,
                              connection.endTime
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center sm:justify-end">
                    <button
                      onClick={() => handleRemoveConnection(connection.id)}
                      disabled={isLoading[connection.id]}
                      className="px-4 py-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-all duration-200 disabled:opacity-50 font-medium"
                    >
                      {isLoading[connection.id] ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          <span>Removing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          <span>Remove</span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Who's in Port */}
      {currentConnections.length > 0 && <WhosInPort className="mt-6" />}

      {/* Port Form Modal */}
      {showPortForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Mark Cruise Line
                </h2>
                <button
                  onClick={() => setShowPortForm(false)}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <PortConnectionForm
                onClose={() => setShowPortForm(false)}
                onSuccess={() => {
                  setShowPortForm(false);
                  // Optionally refresh data
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
