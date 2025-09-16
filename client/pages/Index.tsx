import { IdentityVerificationPage } from "@/components/IdentityVerificationPage";

export default function Index() {
  // Use template ID 1 as default
  const templateId = 1;

  return <IdentityVerificationPage templateId={templateId} />;
}
