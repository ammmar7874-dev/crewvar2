import React from "react";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./context/AuthContextFirebase";
import { RealtimeProvider } from "./context/RealtimeContextFirebase";
import { AppRoutes } from "./routes";
import { AuthGuard, BanGuard, ConditionalGuards } from "./guards";
import { ErrorBoundary } from "./components/ui";
import { ScrollToTop } from "./layout";
import { MobileWrapper } from "./components/mobile/MobileWrapper";
import GlobalDeepLinkHandler from "./components/auth/GlobalDeepLinkHandler";
import { usePushNotifications } from "./hooks/usePushNotifications";

const AppContent = React.memo(() => {
  // Initialize native push notifications (no-op on web)
  usePushNotifications();
  return (
    <GlobalDeepLinkHandler>
      <MobileWrapper>
        <ErrorBoundary>
          <ScrollToTop />
          <AuthGuard>
            <BanGuard>
              <ConditionalGuards>
                <AppRoutes />
              </ConditionalGuards>
            </BanGuard>
          </AuthGuard>
        </ErrorBoundary>
      </MobileWrapper>
    </GlobalDeepLinkHandler>
  );
});

const App = React.memo(() => {
  return (
    <AuthProvider>
      <RealtimeProvider>
        <ToastContainer
          autoClose={3500}
          draggable={false}
          pauseOnHover={false}
          enableMultiContainer={false}
          closeOnClick={true}
          newestOnTop={true}
          position="top-right"
          hideProgressBar={false}
          rtl={false}
          limit={5}
          style={{
            touchAction: "manipulation",
          }}
        />
        <AppContent />
      </RealtimeProvider>
    </AuthProvider>
  );
});

export default App;
