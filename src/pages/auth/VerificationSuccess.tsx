import React from "react";
import { useNavigate } from "react-router-dom";

const VerificationSuccess: React.FC = () => {
  const navigate = useNavigate();

  const handleReturnToApp = () => {
    // Try to redirect to the app using deep link
    window.location.href = "com.crewvar.app://dashboard";
  };

  const handleContinueOnWeb = () => {
    // Navigate to web onboarding
    navigate("/onboarding", {
      state: {
        message: "Email verified successfully! Please complete your profile.",
      },
    });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#B9F3DF" }}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Email Verified Successfully! 🎉
              </h1>
              <p className="text-gray-600">
                Your email has been verified. You can now access all features.
              </p>
            </div>

            {/* Content */}
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-900">
                      Verification Complete
                    </h4>
                    <p className="text-sm text-green-700 mt-1">
                      Your email address has been successfully verified. You can
                      now explore ships, view profiles, and connect with crew
                      members.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">📱</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-900">
                      Return to Your Mobile App
                    </h4>
                    <p className="text-sm text-blue-700 mt-1">
                      If you have the Crewvar app installed on your mobile
                      device, click the button below to return to the app.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleReturnToApp}
                  className="w-full px-6 py-3 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors font-medium"
                >
                  Return to Mobile App
                </button>

                <button
                  onClick={handleContinueOnWeb}
                  className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:border-[#069B93] hover:text-[#069B93] transition-colors font-medium"
                >
                  Continue on Web Browser
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-center mb-2">
                  <svg
                    className="w-5 h-5 text-yellow-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm font-medium text-yellow-800">
                    Cross-Device Verification
                  </p>
                </div>
                <p className="text-sm text-yellow-700">
                  You verified your email on a different device than where you
                  signed up. Use the buttons above to return to your preferred
                  platform.
                </p>
              </div>
              <p className="text-sm text-gray-500">
                Need help? Contact support for assistance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationSuccess;





