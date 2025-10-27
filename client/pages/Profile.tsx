import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { validatePassword, isPasswordValid, passwordsMatch } from "@/lib/password-validation";
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

  const toast = useToast();

  const validation = validatePassword(newPassword);
  const doesMatch = passwordsMatch(newPassword, confirmPassword);

  const handleChangePassword = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!currentPassword) {
      toast.toast({ title: "Current Password Required", description: "Please enter your current password.", variant: "destructive" });
      return;
    }

    if (!isPasswordValid(newPassword)) {
      toast.toast({ title: "Weak Password", description: "New password does not meet the password policy.", variant: "destructive" });
      return;
    }

    if (!doesMatch) {
      toast.toast({ title: "Password Mismatch", description: "New password and confirmation do not match.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      // NOTE: No backend available in this demo. In production call your change-password API here.
      await new Promise((res) => setTimeout(res, 1000));

      // Success
      toast.toast({ title: "Success", description: "Password updated successfully.", duration: 3000 });
      setIsDialogOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      toast.toast({ title: "Password change unsuccessful.", description: "Ensure the current password is correct and meets policy requirements.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-page-background p-6 lg:p-8">
      <div className="max-w-3xl mx-auto bg-white border border-border rounded-lg shadow-sm p-6">
        <h1 className="text-text-primary font-roboto text-[22px] font-bold mb-4">Profile</h1>

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
            <div className="text-text-primary font-medium">{user.employeeId}</div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-text-muted">Department / Role</label>
            <div className="text-text-primary font-medium">{user.department} / {user.role}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setIsDialogOpen(true)}>Change Password</Button>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => setIsDialogOpen(open)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
              <div>
                <label className="text-sm text-text-muted">Current Password</label>
                <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" />
              </div>

              <div>
                <label className="text-sm text-text-muted">New Password</label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" />
                <div className="mt-2 space-y-1">
                  <div className={`text-sm ${validation.requirements.minLength ? "text-green-600" : "text-red-600"}`}>
                    Minimum 8 characters
                  </div>
                  <div className={`text-sm ${validation.requirements.hasUppercase ? "text-green-600" : "text-red-600"}`}>
                    Includes uppercase letter
                  </div>
                  <div className={`text-sm ${validation.requirements.hasNumber ? "text-green-600" : "text-red-600"}`}>
                    Includes number
                  </div>
                  <div className={`text-sm ${validation.requirements.hasSpecialChar ? "text-green-600" : "text-red-600"}`}>
                    Includes special character
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm text-text-muted">Confirm New Password</label>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
                {!doesMatch && confirmPassword.length > 0 && (
                  <p className="text-sm text-red-600 mt-1">Passwords do not match.</p>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Updating..." : "Update Password"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
