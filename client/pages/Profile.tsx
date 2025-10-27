import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  validatePassword,
  isPasswordValid,
  passwordsMatch,
} from "@/lib/password-validation";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  // Try to get user profile from sessionStorage if available
  const stored = (() => {
    try {
      const raw = sessionStorage.getItem("idv_user_profile");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  })();

  const user = stored || {
    fullName: "Sahil Angad",
    email: "sahil@example.com",
    employeeId: "EMP-0001",
    department: "Engineering",
    role: "Administrator",
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // MFA state
  const storedMfa = (() => {
    try {
      const raw = sessionStorage.getItem("idv_mfa_settings");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  })();

  const [mfa, setMfa] = useState<any>(
    storedMfa || {
      enabled: false,
      method: null,
      value: null,
      enforced: !!(stored && (stored as any).mfaEnforced),
    },
  );

  const [mfaSetupOpen, setMfaSetupOpen] = useState(false);
  const [mfaManageOpen, setMfaManageOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<"email" | "phone">(
    "email",
  );
  const [mfaContactValue, setMfaContactValue] = useState<string>(
    (stored && (stored as any).email) || "",
  );
  const [verificationSent, setVerificationSent] = useState(false);
  const [sentCodeExpiresAt, setSentCodeExpiresAt] = useState<number | null>(
    null,
  );
  const [enteredCode, setEnteredCode] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<string | null>(
    null,
  );
  const [confirmDisableOpen, setConfirmDisableOpen] = useState(false);
  const [confirmCode, setConfirmCode] = useState("");

  const toast = useToast();

  const validation = validatePassword(newPassword);
  const doesMatch = passwordsMatch(newPassword, confirmPassword);

  const handleChangePassword = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!currentPassword) {
      toast.toast({
        title: "Current Password Required",
        description: "Please enter your current password.",
        variant: "destructive",
      });
      return;
    }

    if (!isPasswordValid(newPassword)) {
      toast.toast({
        title: "Weak Password",
        description: "New password does not meet the password policy.",
        variant: "destructive",
      });
      return;
    }

    if (!doesMatch) {
      toast.toast({
        title: "Password Mismatch",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // NOTE: No backend available in this demo. In production call your change-password API here.
      await new Promise((res) => setTimeout(res, 1000));

      // Success
      toast.toast({
        title: "Success",
        description: "Password updated successfully.",
        duration: 3000,
      });
      setIsDialogOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      toast.toast({
        title: "Password change unsuccessful.",
        description:
          "Ensure the current password is correct and meets policy requirements.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Persist MFA settings
  useEffect(() => {
    try {
      sessionStorage.setItem("idv_mfa_settings", JSON.stringify(mfa));
    } catch (e) {
      // ignore
    }
  }, [mfa]);

  const sendVerificationCode = async (
    method: "email" | "phone",
    value: string,
  ) => {
    setVerificationStatus(null);
    setVerificationSent(false);
    try {
      await new Promise((r) => setTimeout(r, 700));
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 3 * 60 * 1000;
      const payload = { code, expiresAt, method, value };
      sessionStorage.setItem("idv_mfa_verification", JSON.stringify(payload));
      setSentCodeExpiresAt(expiresAt);
      setVerificationSent(true);
      toast.toast({
        title: "Verification code sent",
        description: `A verification code was sent to your ${method === "email" ? "email" : "phone"}.`,
      });
    } catch (err) {
      console.error(err);
      setVerificationStatus("network");
      toast.toast({
        title: "Network Error",
        description:
          "We couldn't send the verification code. Please try again.",
        variant: "destructive",
      });
    }
  };

  const verifyCode = (code: string) => {
    try {
      const raw = sessionStorage.getItem("idv_mfa_verification");
      if (!raw) return { ok: false, reason: "no_code" };
      const payload = JSON.parse(raw);
      if (Date.now() > payload.expiresAt)
        return { ok: false, reason: "expired" };
      if (payload.code !== code) return { ok: false, reason: "incorrect" };
      return { ok: true, payload };
    } catch (e) {
      return { ok: false, reason: "error" };
    }
  };

  const handleStartMfaSetup = () => {
    setSelectedMethod("email");
    setMfaContactValue((stored && (stored as any).email) || "");
    setVerificationSent(false);
    setEnteredCode("");
    setVerificationStatus(null);
    setMfaSetupOpen(true);
  };

  const handleSendCodeForSetup = async () => {
    if (!mfaContactValue) {
      toast.toast({
        title: "Contact required",
        description: "Please provide an email or phone number.",
        variant: "destructive",
      });
      return;
    }
    await sendVerificationCode(selectedMethod, mfaContactValue);
  };

  const handleVerifyAndEnable = () => {
    const res = verifyCode(enteredCode.trim());
    if (!res.ok) {
      if (res.reason === "expired") {
        setVerificationStatus("expired");
        toast.toast({
          title: "Code expired",
          description: "Code expired. Please request a new code.",
          variant: "destructive",
        });
        return;
      }
      setVerificationStatus("incorrect");
      toast.toast({
        title: "Incorrect code",
        description: "Incorrect code. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setMfa({
      enabled: true,
      method: selectedMethod,
      value: mfaContactValue,
      enforced: false,
    });
    setMfaSetupOpen(false);
    setVerificationSent(false);
    setEnteredCode("");
    toast.toast({
      title: "MFA configured",
      description: "MFA successfully configured for your account.",
    });
  };

  const handleSendConfirmCode = async () => {
    if (!mfa.method || !mfa.value) {
      toast.toast({
        title: "No MFA method",
        description: "No MFA method configured.",
        variant: "destructive",
      });
      return;
    }
    await sendVerificationCode(mfa.method, mfa.value);
  };

  const handleConfirmDisable = () => {
    const res = verifyCode(confirmCode.trim());
    if (!res.ok) {
      if (res.reason === "expired") {
        toast.toast({
          title: "Code expired",
          description: "Code expired. Please request a new code.",
          variant: "destructive",
        });
        return;
      }
      toast.toast({
        title: "Incorrect code",
        description: "Incorrect code. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setMfa({ enabled: false, method: null, value: null, enforced: false });
    setConfirmDisableOpen(false);
    setMfaManageOpen(false);
    toast.toast({
      title: "MFA disabled",
      description:
        "MFA has been disabled. You can re-enable it anytime to enhance your account security.",
    });
  };

  const handleChangeMfaMethod = () => {
    setMfaManageOpen(false);
    setSelectedMethod(mfa.method === "email" ? "phone" : "email");
    setMfaContactValue(mfa.value || (stored && (stored as any).email) || "");
    setVerificationSent(false);
    setEnteredCode("");
    setMfaSetupOpen(true);
  };

  return (
    <div className="w-full min-h-screen bg-page-background p-6 lg:p-8">
      <div className="max-w-3xl mx-auto bg-white border border-border rounded-lg shadow-sm p-6">
        <h1 className="text-text-primary font-roboto text-[22px] font-bold mb-4">
          Profile
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-text-muted">Full Name</label>
            <div className="text-text-primary font-medium">{user.fullName}</div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-text-muted">Email Address</label>
            <div className="text-text-primary font-medium">{user.email}</div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-text-muted">Employee ID</label>
            <div className="text-text-primary font-medium">
              {user.employeeId}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-text-muted">Department / Role</label>
            <div className="text-text-primary font-medium">
              {user.department} / {user.role}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
            Change Password
          </Button>
        </div>

        {/* MFA Section */}
        <div className="border-t pt-6 mb-6">
          <h2 className="text-text-primary font-roboto text-[16px] font-semibold mb-2">
            MFA Configuration
          </h2>

          {mfa.enforced ? (
            <div className="text-text-primary">
              MFA Enabled by Administrator
            </div>
          ) : mfa.enabled ? (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-text-muted">Status</div>
                <div className="text-text-primary font-medium">
                  MFA enabled via {mfa.method === "email" ? "Email" : "Phone"}
                </div>
              </div>
              <div>
                <Button
                  variant="outline"
                  onClick={() => setMfaManageOpen(true)}
                >
                  Change or Disable MFA
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="text-sm text-text-muted">Status</div>
                <div className="text-text-primary font-medium">
                  MFA is not enabled for your account.
                </div>
              </div>
              <div>
                <Button onClick={handleStartMfaSetup}>Enable MFA</Button>
              </div>
            </div>
          )}
        </div>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => setIsDialogOpen(open)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
              <div>
                <label className="text-sm text-text-muted">
                  Current Password
                </label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="text-sm text-text-muted">New Password</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                />
                <div className="mt-2 space-y-1">
                  <div
                    className={`text-sm ${validation.requirements.minLength ? "text-green-600" : "text-red-600"}`}
                  >
                    Minimum 8 characters
                  </div>
                  <div
                    className={`text-sm ${validation.requirements.hasUppercase ? "text-green-600" : "text-red-600"}`}
                  >
                    Includes uppercase letter
                  </div>
                  <div
                    className={`text-sm ${validation.requirements.hasNumber ? "text-green-600" : "text-red-600"}`}
                  >
                    Includes number
                  </div>
                  <div
                    className={`text-sm ${validation.requirements.hasSpecialChar ? "text-green-600" : "text-red-600"}`}
                  >
                    Includes special character
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm text-text-muted">
                  Confirm New Password
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
                {!doesMatch && confirmPassword.length > 0 && (
                  <p className="text-sm text-red-600 mt-1">
                    Passwords do not match.
                  </p>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Password"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* MFA Setup Dialog */}
        <Dialog
          open={mfaSetupOpen}
          onOpenChange={(open) => setMfaSetupOpen(open)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configure MFA</DialogTitle>
            </DialogHeader>

            <div className="mt-4 space-y-4">
              <div>
                <div className="text-sm text-text-muted mb-2">
                  Select verification method
                </div>
                <div className="flex gap-4 items-center">
                  <label
                    className={`p-3 border rounded cursor-pointer ${selectedMethod === "email" ? "border-primary bg-primary/5" : "border-border"}`}
                  >
                    <input
                      type="radio"
                      name="mfa"
                      checked={selectedMethod === "email"}
                      onChange={() => {
                        setSelectedMethod("email");
                        setMfaContactValue(
                          (stored && (stored as any).email) || "",
                        );
                      }}
                      className="mr-2"
                    />{" "}
                    Email
                  </label>

                  <label
                    className={`p-3 border rounded cursor-pointer ${selectedMethod === "phone" ? "border-primary bg-primary/5" : "border-border"}`}
                  >
                    <input
                      type="radio"
                      name="mfa"
                      checked={selectedMethod === "phone"}
                      onChange={() => {
                        setSelectedMethod("phone");
                        setMfaContactValue("");
                      }}
                      className="mr-2"
                    />{" "}
                    Phone (SMS)
                  </label>
                </div>

                <p className="text-sm text-text-muted mt-2">
                  {selectedMethod === "email"
                    ? "You will receive a verification code on your registered email each time you log in."
                    : "You will receive a one-time password (OTP) via SMS for each login attempt."}
                </p>
              </div>

              <div>
                <label className="text-sm text-text-muted">
                  {selectedMethod === "email"
                    ? "Email Address"
                    : "Phone Number"}
                </label>
                <Input
                  value={mfaContactValue}
                  onChange={(e) => setMfaContactValue(e.target.value)}
                  placeholder={
                    selectedMethod === "email"
                      ? (stored && (stored as any).email) || "you@domain.com"
                      : "+91xxxxxxxxxx"
                  }
                />
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleSendCodeForSetup}>
                  Send Code
                </Button>
                {verificationSent && (
                  <div className="text-sm text-text-muted">
                    Code sent. Expires in 3 minutes.
                  </div>
                )}
              </div>

              {verificationSent && (
                <div>
                  <label className="text-sm text-text-muted">
                    Enter verification code
                  </label>
                  <Input
                    value={enteredCode}
                    onChange={(e) => setEnteredCode(e.target.value)}
                    placeholder="6-digit code"
                  />
                  <div className="flex justify-end gap-2 mt-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setVerificationSent(false);
                        setEnteredCode("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleVerifyAndEnable}>
                      Verify & Enable
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* MFA Manage Dialog */}
        <Dialog
          open={mfaManageOpen}
          onOpenChange={(open) => setMfaManageOpen(open)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage MFA</DialogTitle>
            </DialogHeader>

            <div className="mt-4 space-y-4">
              <div>
                <div className="text-sm text-text-muted">Current method</div>
                <div className="text-text-primary font-medium">
                  {mfa.method === "email" ? "Email" : "Phone"}{" "}
                  {mfa.value ? `(${mfa.value})` : ""}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleChangeMfaMethod}>
                  Change MFA Method
                </Button>
                <Button
                  onClick={() => {
                    setConfirmDisableOpen(true);
                    handleSendConfirmCode();
                  }}
                >
                  Disable MFA
                </Button>
              </div>

              {confirmDisableOpen && (
                <div className="mt-4 border p-4 rounded">
                  <div className="text-sm text-text-muted mb-2">
                    Disabling MFA will reduce your account security. Are you
                    sure you want to continue?
                  </div>
                  <div className="text-sm text-text-muted mb-2">
                    A confirmation code will be sent to your configured method.
                    Enter it below to confirm.
                  </div>

                  <div className="mb-2">
                    <Button variant="outline" onClick={handleSendConfirmCode}>
                      Send Confirmation Code
                    </Button>
                    <div className="text-sm text-text-muted mt-2">
                      {verificationSent
                        ? "Code sent. Expires in 3 minutes."
                        : ""}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-text-muted">
                      Enter confirmation code
                    </label>
                    <Input
                      value={confirmCode}
                      onChange={(e) => setConfirmCode(e.target.value)}
                      placeholder="6-digit code"
                    />
                  </div>

                  <div className="flex justify-end gap-2 mt-3">
                    <Button
                      variant="outline"
                      onClick={() => setConfirmDisableOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleConfirmDisable}>
                      Confirm Disable
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
