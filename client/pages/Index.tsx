import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { IdentityVerificationPage } from "@/components/IdentityVerificationPage";
import { ShortCodeResolveResponse } from "@shared/api";

export default function Index() {
  const { shortCode } = useParams<{ shortCode?: string }>();
  const [templateVersionId, setTemplateVersionId] = useState<number>(1); // Default template ID
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE =
  import.meta.env.VITE_API_BASE ||
  import.meta.env.VITE_API_URL ||
  "";

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
      // Step 1: Resolve shortcode to get template version ID
      const resolveResponse = await fetch(`${API_BASE}/api/templates-link-generation/resolve/${code}`);
      if (!resolveResponse.ok) {
        throw new Error("Failed to resolve shortcode");
      }
      
      const resolveData: ShortCodeResolveResponse = await resolveResponse.json();
      console.log("Shortcode resolved:", resolveData);
      
      // Set both template version ID and user ID
      setTemplateVersionId(resolveData.templateVersionId);
      setUserId(resolveData.userId);
      
    } catch (err) {
      console.error("Error resolving shortcode:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-page-background flex items-center justify-center">
        <div className="text-text-primary font-roboto text-lg">Loading template...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen bg-page-background flex items-center justify-center">
        <div className="text-destructive font-roboto text-lg">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <IdentityVerificationPage 
      templateId={templateVersionId}
      userId={userId}
    />
  );
}
