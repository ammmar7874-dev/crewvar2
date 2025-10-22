import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useQuery,
  useMutation,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContextFirebase";
import logo from "../../assets/images/Home/logo.png";
import { getProfilePhotoUrl } from "../../utils/images";
import { DashboardLayout } from "../../layout/DashboardLayout";
import {
  getCruiseLines,
  getShips,
  getShipsByCruiseLine,
  getCrewMembers,
  sendConnectionRequest,
  getDepartments,
  getRoles,
  getUserConnections,
  getPendingConnectionRequests,
  createOrGetChatRoom,
  trackShipSearch,
} from "../../firebase/firestore";

// Custom Dropdown Component for Mobile-Friendly Selection
interface CustomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ id: string; name: string }>;
  placeholder: string;
  disabled?: boolean;
  label: string;
  maxHeight?: string;
}

const CustomDropdown = ({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  label,
  maxHeight = "200px",
}: CustomDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((option) => option.name === value);

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleOptionClick = (optionName: string) => {
    onChange(optionName);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm("");
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setSearchTerm("");
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      {/* Input Field */}
      <div
        className={`
                    w-full px-3 border rounded-lg cursor-pointer min-h-[48px] flex items-center
                    ${
                      disabled
                        ? "bg-gray-100 cursor-not-allowed border-gray-200 text-gray-500"
                        : "bg-white border-gray-300 hover:border-teal-500 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500"
                    }
                    transition-colors
                `}
        onClick={handleInputClick}
      >
        <div className="flex items-center justify-between w-full">
          <span
            className={`${selectedOption ? "text-gray-900" : "text-gray-500"} text-sm leading-5 truncate max-w-[85%]`}
          >
            {selectedOption ? selectedOption.name : placeholder}
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg top-full left-0 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          {/* Options List */}
          <div className="overflow-y-auto overscroll-contain" style={{ maxHeight }}>
            {/* All Option */}
            <div
              className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 transition-colors ${
                value === ""
                  ? "bg-teal-500 text-white hover:bg-teal-600"
                  : "text-gray-900"
              }`}
              onClick={() => handleOptionClick("")}
            >
              All {label}s
            </div>

            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.id}
                  className={`
                                        px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 transition-colors
                                        ${
                                          value === option.name
                                            ? "bg-teal-500 text-white hover:bg-teal-600"
                                            : "text-gray-900"
                                        }
                                    `}
                  onClick={() => handleOptionClick(option.name)}
                >
                  {option.name}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const ExploreShips = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const queryClient = useQueryClient();
  const [selectedCruiseLine, setSelectedCruiseLine] = useState<string>("");
  const [selectedShip, setSelectedShip] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>("");
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );
  const observerRef = useRef<HTMLDivElement>(null);
  const uniqueLengthRef = useRef<number>(0);
  const [stopInfinite, setStopInfinite] = useState<boolean>(false);

  // Debounce user typing for search input (500ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchInput]);

  // Fetch cruise lines
  const { data: cruiseLines = [], isLoading: cruiseLinesLoading } = useQuery({
    queryKey: ["cruiseLines"],
    queryFn: getCruiseLines,
  });

  // Fetch all ships
  const { data: allShips = [], isLoading: shipsLoading } = useQuery({
    queryKey: ["ships"],
    queryFn: getShips,
  });

  // Fetch departments
  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
  });

  // Fetch all roles for role name mapping
  const { data: allRoles = [] } = useQuery({
    queryKey: ["allRoles"],
    queryFn: getRoles,
  });

  // Fetch user's connections to check if already connected
  const { data: userConnections = [] } = useQuery({
    queryKey: ["userConnections", currentUser?.uid],
    queryFn: () => getUserConnections(currentUser!.uid),
    enabled: !!currentUser?.uid,
  });

  // Fetch pending connection requests
  const { data: pendingRequests = [] } = useQuery({
    queryKey: ["pendingRequests", currentUser?.uid],
    queryFn: () => getPendingConnectionRequests(currentUser!.uid),
    enabled: !!currentUser?.uid,
  });

  // Get the cruise line ID from the selected name
  const selectedCruiseLineId =
    cruiseLines?.find((cl) => cl.name === selectedCruiseLine)?.id || "";

  // Helper functions to get names from IDs
  const getRoleName = (roleId: string) => {
    if (!roleId) return "Not specified";
    const role = allRoles.find((r) => r.id === roleId);
    return role ? role.name : "Not specified";
  };

  const getDepartmentName = (departmentId: string) => {
    if (!departmentId) return "Not specified";
    const department = departments.find((d) => d.id === departmentId);
    return department ? department.name : "Not specified";
  };

  const getShipName = (shipId: string) => {
    if (!shipId) return "No Ship";
    const ship = allShips.find((s) => s.id === shipId);
    return ship ? ship.name : shipId;
  };

  // Check connection status for a member
  const getConnectionStatus = (memberId: string) => {
    // Check if already connected
    const isConnected = userConnections.some(
      (connection) =>
        connection.connectedUserId === memberId ||
        connection.userId === memberId
    );

    if (isConnected) {
      return "connected";
    }

    // Check if there's a pending request
    const hasPendingRequest = pendingRequests.some(
      (request) => request.receiverId === memberId
    );

    if (hasPendingRequest) {
      return "pending";
    }

    return "none";
  };

  // Fetch ships by cruise line
  const { data: shipsByCruiseLine = [], isLoading: shipsByCruiseLineLoading } =
    useQuery({
      queryKey: ["shipsByCruiseLine", selectedCruiseLineId],
      queryFn: () => getShipsByCruiseLine(selectedCruiseLineId),
      enabled: !!selectedCruiseLineId,
    });

  // Fetch crew members with infinite scroll (moved after selectedShipId is defined)

  // Connection request mutation
  const sendConnectionRequestMutation = useMutation(
    async (params: {
      requesterId: string;
      receiverId: string;
      message?: string;
    }) => {
      return await sendConnectionRequest(
        params.requesterId,
        params.receiverId,
        params.message
      );
    },
    {
      onSuccess: () => {
        toast.success(`Connection request sent successfully!`);
        // Refresh connections and pending requests data
        queryClient.invalidateQueries({ queryKey: ["userConnections"] });
        queryClient.invalidateQueries({ queryKey: ["pendingRequests"] });
        queryClient.invalidateQueries({
          queryKey: ["receivedConnectionRequests"],
        });
      },
      onError: (error: any) => {
        console.error("Failed to send connection request:", error);
        toast.error(error.message || "Failed to send connection request");
      },
    }
  );

  // Connection request handler
  const handleConnect = async (memberId: string, memberName: string) => {
    if (!currentUser?.uid) {
      toast.error("You must be logged in to send connection requests");
      return;
    }

    try {
      setLoadingStates((prev) => ({ ...prev, [memberId]: true }));

      await sendConnectionRequestMutation.mutateAsync({
        requesterId: currentUser.uid,
        receiverId: memberId,
        message: `Hi ${memberName}! I'd like to connect with you.`,
      });
    } catch (error: any) {
      console.error("Failed to send connection request:", error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [memberId]: false }));
    }
  };

  // Start chat handler
  const handleStartChat = async (memberId: string, memberName: string) => {
    if (!currentUser?.uid) {
      toast.error("You must be logged in to start a chat");
      return;
    }

    try {
      setLoadingStates((prev) => ({ ...prev, [memberId]: true }));

      // Create or get chat room
      await createOrGetChatRoom(currentUser.uid, memberId);

      // Navigate to chat with the specific user
      navigate(`/chat/${memberId}`);

      toast.success(`Starting chat with ${memberName}`);
    } catch (error: any) {
      console.error("Failed to start chat:", error);
      toast.error(error.message || "Failed to start chat");
    } finally {
      setLoadingStates((prev) => ({ ...prev, [memberId]: false }));
    }
  };

  // View profile handler
  const handleViewProfile = (memberId: string) => {
    // Navigate to member's profile page
    window.location.href = `/crew/${memberId}`;
  };

  // Get available ships based on selected cruise line
  const availableShips = useMemo(() => {
    if (selectedCruiseLine && shipsByCruiseLine) {
      return shipsByCruiseLine;
    }
    // If no cruise line selected, show all ships
    if (!selectedCruiseLine && allShips) {
      return allShips;
    }
    return [];
  }, [selectedCruiseLine, shipsByCruiseLine, allShips]);

  // Get the ship ID from the selected ship name
  const selectedShipId =
    availableShips?.find((ship) => ship.name === selectedShip)?.id || null;

  // Fetch crew members with infinite scroll - only when user has applied search or filters
  const {
    data: crewData,
    isLoading: crewLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["crewMembers", selectedShipId, searchQuery, selectedRole], // Include searchQuery in key
    queryFn: ({ pageParam = 0 }) =>
      getCrewMembers({
        shipId: selectedShipId || undefined,
        roleId: selectedRole || undefined,
        page: pageParam,
        limit: 20,
        currentUserId: currentUser?.uid,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextPage : undefined,
    enabled:
      !!currentUser &&
      (!!searchQuery?.trim() || !!selectedShipId || !!selectedCruiseLine),
  });

  // Flatten all crew data from all pages
  const allCrew = useMemo(() => {
    if (!crewData?.pages) return [];
    const combined = crewData.pages.flatMap((page: any) => page.crew || []);
    const uniqueMap = new Map<string, any>();
    for (const item of combined) {
      const keyCandidate =
        item?.id ||
        item?.userId ||
        item?.uid ||
        (typeof item?.email === "string" ? item.email.toLowerCase() : undefined) ||
        (item?.displayName && item?.currentShipId
          ? `${String(item.displayName).trim().toLowerCase()}|${String(
              item.currentShipId
            )}`
          : undefined);
      if (keyCandidate && !uniqueMap.has(String(keyCandidate))) {
        uniqueMap.set(String(keyCandidate), item);
      } else if (!keyCandidate) {
        const fallback = `${String(item?.displayName || "").trim().toLowerCase()}|${String(
          item?.currentShipId || ""
        )}|${uniqueMap.size}`;
        if (!uniqueMap.has(fallback)) uniqueMap.set(fallback, item);
      }
    }
    return Array.from(uniqueMap.values());
  }, [crewData]);

  // Determine if new pages are adding any unique items
  useEffect(() => {
    const currentLen = Array.isArray(allCrew) ? allCrew.length : 0;
    const hadIncrease = currentLen > uniqueLengthRef.current;
    uniqueLengthRef.current = currentLen;
    // Stop infinite scroll if no increase and API still reports there may be next page
    // Also stop while searching
    const hasActiveSearch = !!searchQuery?.trim();
    setStopInfinite(!hadIncrease || hasActiveSearch);
  }, [allCrew, searchQuery]);

  // Filter crew members based on selections (client-side filtering)
  const filteredCrew = useMemo(() => {
    if (!allCrew) return [];

    return allCrew.filter((member: any) => {
      // For cruise line filtering, we need to check if the member's ship belongs to the selected cruise line
      let matchesCruiseLine = true;
      if (selectedCruiseLine) {
        console.log("selectedCruiseLine", selectedCruiseLine);
        // Find the member's ship and check if it belongs to the selected cruise line
        const memberShip = allShips.find(
          (ship) => ship.id === member.currentShipId
        );
        const memberCruiseLine = memberShip
          ? cruiseLines.find((cl) => cl.id === memberShip.cruiseLineId)
          : null;
        matchesCruiseLine = memberCruiseLine?.name === selectedCruiseLine;
      }

      const matchesShip =
        !selectedShipId || member.currentShipId === selectedShipId;
      const matchesSearch =
        !searchQuery ||
        member.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.departmentId
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        member.roleId?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCruiseLine && matchesShip && matchesSearch;
    });
  }, [
    allCrew,
    selectedCruiseLine,
    selectedShipId,
    searchQuery,
    allShips,
    cruiseLines,
  ]);

  // Infinite scroll observer
  useEffect(() => {
    // Disable observing if we shouldn't fetch more
    if (stopInfinite) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage &&
          !stopInfinite
        ) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, stopInfinite]);

  // Reset ship selection when cruise line changes
  const handleCruiseLineChange = (cruiseLineName: string) => {
    setSelectedCruiseLine(cruiseLineName);
    setSelectedShip(""); // Reset ship selection
  };

  // Handle ship selection and track search for port detection
  const handleShipChange = async (shipName: string) => {
    setSelectedShip(shipName);

    // Track ship search for port detection
    if (currentUser?.uid && userProfile?.currentShipId && shipName) {
      const targetShip = availableShips?.find((ship) => ship.name === shipName);
      if (targetShip?.id) {
        try {
          await trackShipSearch(
            currentUser.uid,
            userProfile.currentShipId,
            targetShip.id
          );
        } catch (error) {
          console.error("Error tracking ship search:", error);
          // Don't show error to user - this is background functionality
        }
      }
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCruiseLine("");
    setSelectedShip("");
    setSelectedRole("");
    setSearchQuery("");
    setSearchInput("");
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 overflow-x-hidden">
        {/* Mobile Header */}
        <div className="bg-teal-600 text-white p-3 sm:p-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-teal-700 rounded-lg transition-colors"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div>
                <h1 className="text-base sm:text-lg font-bold">
                  Find your friends.
                </h1>
                <p className="text-xs text-teal-100">Find friends</p>
              </div>
            </div>
            <Link
              to="/dashboard"
              className="flex items-center hover:bg-teal-700 rounded-lg px-2 sm:px-3 py-2 transition-colors"
            >
              <img
                src={logo}
                alt="Crewvar Logo"
                className="h-5 sm:h-6 w-auto brightness-0 invert"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </Link>
          </div>
        </div>

        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
          {/* Search Section */}
          <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-4">
            <h2 className="text-base sm:text-lg font-semibold text-teal-600 mb-3">
              Search & Filter
            </h2>

            <div className="space-y-3">
              {/* Search Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Friends
                </label>
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none text-base"
                />
              </div>

              {/* Description text */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Find friends who are on your ship or on another ship today.
                </p>
              </div>

              {/* Cruise Line Selection */}
              <CustomDropdown
                value={selectedCruiseLine}
                onChange={handleCruiseLineChange}
                options={cruiseLines || []}
                placeholder="All Cruise Lines"
                disabled={cruiseLinesLoading}
                label="Cruise Line"
                maxHeight="250px"
              />

              {/* Ship Selection */}
              <CustomDropdown
                value={selectedShip}
                onChange={handleShipChange}
                options={availableShips || []}
                placeholder="All Ships"
                disabled={shipsLoading || shipsByCruiseLineLoading}
                label="Ship"
                maxHeight="250px"
              />

              {/* Role Selection */}
              <CustomDropdown
                value={selectedRole}
                onChange={setSelectedRole}
                options={allRoles || []}
                placeholder="All Roles"
                disabled={false}
                label="Role"
                maxHeight="250px"
              />

              {/* Clear Filters Button */}
              {(selectedCruiseLine ||
                selectedShip ||
                selectedRole ||
                searchQuery) && (
                <button
                  onClick={clearAllFilters}
                  className="w-full px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border border-gray-300"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>

          {/* Loading State */}
          {(cruiseLinesLoading ||
            shipsLoading ||
            (crewLoading &&
              (!!searchQuery?.trim() ||
                !!selectedShipId ||
                !!selectedCruiseLine || !!selectedRole))) && (
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                <span className="ml-3 text-gray-600">
                  Loading friends data...
                </span>
              </div>
            </div>
          )}

          {/* Crew Results - Only show when not loading initial data and when filters are applied */}
          {!cruiseLinesLoading &&
            !shipsLoading &&
            (!!searchQuery?.trim() ||
              !!selectedShipId ||
              !!selectedCruiseLine || !!selectedRole) && (
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-teal-600">
                    Possible friends ({filteredCrew.length})
                  </h2>
                  <div className="text-sm text-gray-500">
                    {allCrew.length} total loaded
                  </div>
                </div>

                {filteredCrew.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="h-8 w-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-base">
                      {searchQuery || selectedCruiseLine || selectedShip || selectedRole
                        ? "No matching results found"
                        : "Start searching to find your friends"}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      {searchQuery || selectedCruiseLine || selectedShip || selectedRole
                        ? "Try adjusting your search or filters"
                        : "Use the search bar or filters above to discover crew members"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {filteredCrew.map((member: any) => (
                      <div
                        key={member.id}
                        className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-teal-300 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
                          {/* Avatar and Info */}
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            {/* Avatar */}
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex-shrink-0">
                              <img
                                src={getProfilePhotoUrl(member.profilePhoto)}
                                alt={member.displayName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback to letter avatar if image fails to load
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = "none";
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = `
                                                                    <div class="w-full h-full bg-teal-500 flex items-center justify-center">
                                                                        <span class="text-white font-bold text-sm sm:text-lg">${member.displayName.charAt(
                                                                          0
                                                                        )}</span>
                                                                    </div>
                                                                `;
                                  }
                                }}
                              />
                            </div>

                            {/* Member Info */}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                                {member.displayName}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-600 truncate">
                                {getRoleName(member.roleId) || "Crew Member"}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {getDepartmentName(member.departmentId)} •{" "}
                                {getShipName(member.currentShipId)}
                              </p>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex space-x-2 sm:flex-shrink-0">
                            {(() => {
                              const status = getConnectionStatus(member.id);

                              if (status === "connected") {
                                return (
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() =>
                                        handleStartChat(
                                          member.id,
                                          member.displayName
                                        )
                                      }
                                      disabled={loadingStates[member.id]}
                                      className="flex-1 sm:flex-none px-3 py-2 bg-blue-500 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                      {loadingStates[member.id]
                                        ? "Starting..."
                                        : "Start Chat"}
                                    </button>
                                    <button
                                      disabled
                                      className="flex-1 sm:flex-none px-3 py-2 bg-gray-400 text-white text-xs sm:text-sm font-medium rounded-lg cursor-not-allowed transition-colors"
                                    >
                                      Connected
                                    </button>
                                  </div>
                                );
                              } else if (status === "pending") {
                                return (
                                  <button
                                    disabled
                                    className="flex-1 sm:flex-none px-3 py-2 bg-yellow-500 text-white text-xs sm:text-sm font-medium rounded-lg cursor-not-allowed transition-colors"
                                  >
                                    Pending
                                  </button>
                                );
                              } else {
                                return (
                                  <button
                                    onClick={() =>
                                      handleConnect(
                                        member.id,
                                        member.displayName
                                      )
                                    }
                                    disabled={loadingStates[member.id]}
                                    className="flex-1 sm:flex-none px-3 py-2 bg-[#069B93] text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-[#058a7a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    {loadingStates[member.id]
                                      ? "Sending..."
                                      : "Connect"}
                                  </button>
                                );
                              }
                            })()}
                            <button
                              onClick={() => handleViewProfile(member.id)}
                              className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 text-gray-700 text-xs sm:text-sm rounded-lg hover:border-[#069B93] hover:text-[#069B93] hover:bg-[#069B93]/5 transition-colors font-medium"
                            >
                              View Profile
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Infinite scroll loading indicator */}
                    {isFetchingNextPage && (
                      <div className="flex justify-center py-4">
                        <div className="flex items-center space-x-2 text-teal-600">
                          <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm font-medium">
                            Loading more friends...
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Infinite scroll trigger */}
                    <div ref={observerRef} className="h-4"></div>
                  </div>
                )}
              </div>
            )}

          {/* Message when no filters are applied */}
          {!cruiseLinesLoading &&
            !shipsLoading &&
            !(
              !!searchQuery?.trim() ||
              !!selectedShipId ||
              !!selectedCruiseLine || !!selectedRole
            ) && (
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="h-8 w-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Ready to find your friends?
                  </h3>
                  <p className="text-gray-500 text-base mb-1">
                    Start by searching for a name or selecting a filter above
                  </p>
                  <p className="text-gray-400 text-sm">
                    Use the search bar, cruise line, or ship dropdown to
                    discover crew members
                  </p>
                </div>
              </div>
            )}
        </div>
      </div>
    </DashboardLayout>
  );
};
