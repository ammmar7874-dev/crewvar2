import React, { useState, useEffect, useMemo } from 'react';
import AppBar from './AppBar';
import DashboardSidebar from './DashboardSidebar';
import Footer from './Footer';
import { useAuth } from '../context/AuthContextFirebase';
import { QuickCheckInDialog } from '../components/common/QuickCheckInDialog';
import { useQuery } from '@tanstack/react-query';
import { getShips } from '../firebase/firestore';

interface ShipAssignment {
    shipId: string;
    shipName: string;
    port: string;
    date: string; // YYYY-MM-DD format
    isConfirmed: boolean;
}

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
    const { userProfile } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showCheckInDialog, setShowCheckInDialog] = useState(false);
    const [currentShip, setCurrentShip] = useState<ShipAssignment | null>(null);

    // Fetch ships data
    const { data: ships = [] } = useQuery({
        queryKey: ['ships'],
        queryFn: getShips
    });

    // Memoize ships to prevent unnecessary re-renders
    const memoizedShips = useMemo(() => ships, [ships.length, ships.map(ship => ship.id).join(',')]);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    // Check if user needs to confirm ship assignment on login
    useEffect(() => {
        // Only check if user profile is loaded
        if (!userProfile) return;

        // Check if onboarding is complete
        const isOnboardingComplete = localStorage.getItem('onboardingComplete') === 'true';

        // Only show quick check-in for users who have completed onboarding
        if (isOnboardingComplete) {
            // Check if we've already shown quick check-in today
            const today = new Date().toDateString(); // e.g., "Mon Dec 23 2024"
            const lastCheckInDate = localStorage.getItem('lastQuickCheckInDate');

            if (lastCheckInDate !== today) {
                console.log('First visit today, showing quick check-in');
                setShowCheckInDialog(true);
                // Mark that we've shown it today
                localStorage.setItem('lastQuickCheckInDate', today);
            } else {
                setShowCheckInDialog(false);
            }
        } else {
            console.log('User has not completed onboarding, skipping quick check-in');
            setShowCheckInDialog(false);
        }

        // Load current ship assignment from Firebase or localStorage
        if (userProfile.currentShipId && memoizedShips.length > 0) {
            const currentShipData = memoizedShips.find(ship => ship.id === userProfile.currentShipId);
            if (currentShipData) {
                const today = new Date().toISOString().split('T')[0];
                setCurrentShip({
                    shipId: currentShipData.id,
                    shipName: currentShipData.name,
                    port: "Current Port",
                    date: today,
                    isConfirmed: true
                });
            }
        } else {
            // Fallback to localStorage
            const savedShip = localStorage.getItem('currentShipAssignment');
            if (savedShip) {
                setCurrentShip(JSON.parse(savedShip));
            }
        }
    }, [userProfile?.id, userProfile?.currentShipId, memoizedShips]);

    // TODO: Implement Firebase ship assignment update function when needed
    // This will be used for confirming ship assignments in the future

    return (
        <div className="min-h-screen bg-gray-50 overflow-x-hidden max-w-[100vw]">
            {/* Internal App Bar */}
            <AppBar
                onToggleSidebar={toggleSidebar}
                setShowCheckInDialog={setShowCheckInDialog}
            />

            <div className="flex w-full max-w-[100vw] overflow-x-hidden">
                {/* Internal Sidebar - Hidden on desktop, shown on mobile */}
                <div className="lg:hidden">
                    <DashboardSidebar
                        isOpen={sidebarOpen}
                        onToggle={toggleSidebar}
                        setShowCheckInDialog={setShowCheckInDialog}
                    />
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
                    {/* Page Content */}
                    <div className="flex-1 p-3 overflow-x-hidden">
                        {children}
                    </div>

                    {/* Footer */}
                    <Footer />
                </div>
            </div>

            {/* Quick Check-In Dialog */}
            <QuickCheckInDialog
                isOpen={showCheckInDialog}
                onClose={() => setShowCheckInDialog(false)}
                currentShip={currentShip}
            />
        </div>
    );
};
