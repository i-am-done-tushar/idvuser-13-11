import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function ContactAdminSection() {
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    setFile(f || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setSubmitting(true);
    setSuccessMessage(null);

    try {
      // Placeholder: integrate with backend later
      await new Promise((res) => setTimeout(res, 600));

      // Show toast and inline success message
      toast({
        title: "Your request has been sent. Admin will respond shortly.",
        duration: 5000,
      });
      setSuccessMessage(
        "Your request has been sent. Admin will respond shortly.",
      );

      // Reset form
      setSubject("");
      setMessage("");
      setFile(null);
    } catch (err) {
      toast({
        title: "Failed to send request",
        description: "Please try again later.",
        duration: 5000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-text-primary font-roboto text-[22px] font-bold leading-[30px]">
          Contact Administrator
        </h1>
        <p className="text-text-muted font-roboto text-[13px] font-normal leading-[15px]">
          For any questions regarding your verification or account, please
          contact your administrator through this form.
        </p>
      </div>

      <div className="flex justify-center">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-3xl bg-white shadow-sm border border-input-border rounded-lg p-8"
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-50 text-indigo-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 12v4m0 0v4m0-4h4m-4 0H8m8-8V4m0 0V2m0 2h4M4 6h16M4 10h16M4 14h16"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-medium text-text-primary">
                Send a request to administrator
              </h2>
              <p className="text-text-muted text-sm">
                We will respond as soon as possible. Provide as much detail as
                you can.
              </p>
            </div>
          </div>

          {successMessage && (
            <div className="mb-6 px-4 py-3 bg-green-50 border border-green-200 text-green-800 rounded">
              {successMessage}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1 block w-full rounded-md border border-input-border px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300"
                placeholder="Subject"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1 block w-full rounded-md border border-input-border px-4 py-3 text-sm min-h-[160px] focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300"
                rows={6}
                placeholder="Describe your issue or question"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">
                Attachment (optional)
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <span className="inline-block px-3 py-2 rounded-md bg-gray-50 border border-dashed border-input-border text-sm text-text-muted">
                  Choose file
                </span>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span className="text-text-muted text-sm">
                  {file ? file.name : "No file chosen"}
                </span>
              </label>
            </div>

            <div className="flex items-center justify-between pt-4">
              <p className="text-text-muted text-sm">
                For any questions regarding your verification or account, please
                contact your administrator through this form.
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSubject("");
                    setMessage("");
                    setFile(null);
                    setSuccessMessage(null);
                  }}
                  className="px-4 py-2 rounded-md bg-white border border-input-border text-sm"
                >
                  Reset
                </button>

                <button
                  type="submit"
                  disabled={submitting || !subject.trim() || !message.trim()}
                  className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm disabled:opacity-50"
                >
                  {submitting ? "Sending..." : "Send Request"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
