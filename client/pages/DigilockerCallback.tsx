import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

/**
 * DigiLocker Callback Handler
 * 
 * This page handles the redirect from DigiLocker after user authentication.
 * It extracts the authorization code and state, then redirects back to the form.
 * 
 * URL format: /digilocker-callback?code={authCode}&state={shortCode:submissionId}
 */
export default function DigilockerCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const authCode = searchParams.get("code");
    const state = searchParams.get("state");

    console.log("🔐 DigiLocker callback received:", { authCode, state });

    if (!authCode || !state) {
      console.error("❌ Missing authCode or state in DigiLocker callback");
      navigate("/");
      return;
    }

    try {
      // Parse state to extract shortCode and submissionId
      // Expected format: "shortCode:submissionId"
      const [shortCodeFromState, submissionIdFromState] = state.split(":");

      console.log("📝 Parsed state:", {
        shortCode: shortCodeFromState,
        submissionId: submissionIdFromState,
      });

      if (!shortCodeFromState || shortCodeFromState === "unknown") {
        console.error("❌ Invalid shortCode in state");
        navigate("/");
        return;
      }

      // Store DigiLocker data in sessionStorage for the form to process
      sessionStorage.setItem("digilocker_auth_code", authCode);
      sessionStorage.setItem("digilocker_callback_state", state);
      sessionStorage.setItem("digilocker_callback_timestamp", Date.now().toString());

      // Redirect back to the form page with the shortCode
      // The form will detect the DigiLocker data in sessionStorage and process it
      console.log(`✅ Redirecting to: /form/${shortCodeFromState}`);
      navigate(`/form/${shortCodeFromState}`, { replace: true });
    } catch (error) {
      console.error("❌ Error parsing DigiLocker callback state:", error);
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
