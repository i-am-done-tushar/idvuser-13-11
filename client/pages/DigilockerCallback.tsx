import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

/**
 * DigiLocker Callback Handler
 * 
 * This page handles the redirect from DigiLocker after user authentication.
 * DigiLocker redirects to: http://localhost:4200/?code={authCode}&state={shortCode:submissionId}&jti={jti}
 * 
 * This handler:
 * 1. Extracts code, state, and jti from URL
 * 2. Parses state to get shortCode and submissionId
 * 3. Stores data in sessionStorage
 * 4. Redirects to /form/{shortCode}
 */
export default function DigilockerCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const authCode = searchParams.get("code");
    const state = searchParams.get("state");
    const jti = searchParams.get("jti");

    console.log("🔐 DigiLocker callback received:", { authCode, state, jti });

    // Check if this is a DigiLocker callback (has code and state)
    if (!authCode || !state) {
      console.log("ℹ️ Not a DigiLocker callback, redirecting to home");
      // Not a DigiLocker callback, could be normal home page access
      // You might want to navigate to "/" or show landing page
      return;
    }

    try {
      // Parse state to extract shortCode and submissionId
      // Expected format: "shortCode:submissionId"
      const [shortCodeFromState, submissionIdFromState] = state.split(":");

      console.log("📝 Parsed DigiLocker state:", {
        shortCode: shortCodeFromState,
        submissionId: submissionIdFromState,
        jti: jti,
      });

      if (!shortCodeFromState || shortCodeFromState === "unknown") {
        console.error("❌ Invalid shortCode in state:", state);
        alert("Invalid DigiLocker callback state. Please try again.");
        navigate("/");
        return;
      }

      // Store DigiLocker callback data in sessionStorage for the form to process
      sessionStorage.setItem("digilocker_auth_code", authCode);
      sessionStorage.setItem("digilocker_callback_state", state);
      sessionStorage.setItem("digilocker_jti", jti || "");
      sessionStorage.setItem("digilocker_callback_timestamp", Date.now().toString());

      console.log("✅ DigiLocker data stored in sessionStorage");
  console.log(`🔀 Redirecting to: /form?code=${shortCodeFromState}`);

  // Redirect to form page with the shortCode in query string
  // The form will detect the DigiLocker data in sessionStorage and process it
  navigate(`/form?code=${encodeURIComponent(shortCodeFromState)}`, { replace: true });
    } catch (error) {
      console.error("❌ Error parsing DigiLocker callback state:", error);
      alert("Failed to process DigiLocker response. Please try again.");
      navigate("/");
    }
  }, [searchParams, navigate]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Processing DigiLocker Response...
        </h2>
        <p className="text-gray-600">
          Please wait while we redirect you back to the form
        </p>
      </div>
    </div>
  );
}
