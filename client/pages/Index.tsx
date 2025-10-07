import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IdentityVerificationPage } from "@/components/IdentityVerificationPage";
import { ShortCodeResolveResponse } from "@shared/api";

export default function Index() {
  const { shortCode } = useParams<{ shortCode?: string }>();
  const navigate = useNavigate();
  const [templateVersionId, setTemplateVersionId] = useState<number>(1);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputShortCode, setInputShortCode] = useState("");

  const DEMO_SHORTCODE = "AUD5YZ1_hFHx03NMDOsKXZNRtlbh2v7MLFczwNzPZ1xWZchjgpw2eRFzxOYrvN_au9mhlLPaIqaJFyg2G9rEbBfbbBIXEt67xZ1SgwNHk0fuFjL-17kys5LAKB__aG7kbTZ2NBzwfgMYfyLKY3LNg0FC44If_0Pz54CszDyzCDd0FIPKYgZgRhuh7-XAsy0SRrhIwoTwqry8DuPlH5i0HDa87-yyztmlqRFnGKmOmZ9aGvLq911uMv1VSEpa1SPBIdKDlW_9IubmhQWTmDUP_qZOv77U0FyLsg";

  const API_BASE =
    import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL || "";

  useEffect(() => {
    if (shortCode) {
      // If we have a shortcode, resolve it to get template version ID
      resolveShortCode(shortCode);
    }
  }, [shortCode]);

  const resolveShortCode = async (code: string) => {
    setLoading(true);
    setError(null);

    try {
      const resolveResponse = await fetch(
        `${API_BASE}/api/templates-link-generation/resolve?shortCode=${encodeURIComponent(code)}`,
      );
      if (!resolveResponse.ok) {
        throw new Error("Failed to resolve shortcode");
      }

      const resolveData: ShortCodeResolveResponse =
        await resolveResponse.json();
      console.log("Shortcode resolved:", resolveData);

      setTemplateVersionId(resolveData.templateVersionId);
      setUserId(resolveData.userId);
    } catch (err) {
      console.error("Error resolving shortcode:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleShortCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputShortCode.trim()) {
      navigate(`/form/${inputShortCode.trim()}`);
    }
  };

  const handleTryDemo = () => {
    setInputShortCode(DEMO_SHORTCODE);
    navigate(`/form/${DEMO_SHORTCODE}`);
  };

  // If no shortcode in URL, show the shortcode input page
  if (!shortCode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Identity Verification
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter your shortCode to continue
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleShortCodeSubmit}>
            <div>
              <label htmlFor="shortcode" className="sr-only">
                Shortcode
              </label>
              <input
                id="shortcode"
                name="shortcode"
                type="text"
                required
                value={inputShortCode}
                onChange={(e) => setInputShortCode(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder={`Write shortcode here (e.g., ${DEMO_SHORTCODE.slice(0, 20)}...)`}
              />
            </div>
            <div className="space-y-3">
              <button
                type="submit"
                disabled={!inputShortCode.trim()}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-50 text-gray-500">or</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTryDemo}
                className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Try Demo Shortcode
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // If we have a shortcode but are loading, show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-900 text-lg">Loading template...</div>
      </div>
    );
  }

  // If we have an error, show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center">
            <div className="text-red-600 text-lg mb-4">Error: {error}</div>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If we have a shortcode and no error, show the identity verification page
  return (
    <IdentityVerificationPage 
      templateId={templateVersionId} 
      userId={userId} 
      shortCode={shortCode || ""} 
    />
  );
}