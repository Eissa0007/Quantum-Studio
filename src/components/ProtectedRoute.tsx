import React from "react";
import { useAuth } from "./AuthProvider";
import { LoginPage } from "./LoginPage";
import { Loader2 } from "lucide-react";
import { useStore } from "../store/useStore";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { showLoginModal, setShowLoginModal } = useStore();

  return (
    <>
      <div className="h-full w-full relative z-0">{children}</div>

      {showLoginModal && !user && !loading && (
        <div className="fixed inset-0 z-[100] bg-[#0F1419]/60 backdrop-blur-md flex items-center justify-center overflow-y-auto w-full h-full p-4 pointer-events-auto">
          <div className="relative">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute -top-4 -right-4 z-50 w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-700"
            >
              ✕
            </button>
            <LoginPage />
          </div>
        </div>
      )}
    </>
  );
};
