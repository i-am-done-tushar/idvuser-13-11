import { useState } from "react";
import { CameraDialog } from "./CameraDialog";
import { UploadDialog } from "./UploadDialog";
import { DocumentConfig } from "@shared/templates";

const API_BASE =
  import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL || "";
const DOCUMENT_DEFINITION_ID = "5c5df74f-9684-413e-849f-c3b4d53e032d";

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: string;
}

interface IdentityDocumentFormProps {
  onComplete?: () => void;
  documentConfig?: DocumentConfig;
}

export function IdentityDocumentForm({
  onComplete,
  documentConfig = {},
}: IdentityDocumentFormProps) {
  const [country, setCountry] = useState("");
  const [selectedDocument, setSelectedDocument] = useState("");
  const [showCameraDialog, setShowCameraDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [documentUploadIds, setDocumentUploadIds] = useState<
    Record<string, { front?: number; back?: number }>
  >({});

  // Function to get file icon based on file type
  const getFileIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_2641_20024)">
        <path
          d="M10.0463 7.62797L3.7207 6.51172V14.7598C3.7207 15.1364 4.02602 15.442 4.40289 15.442H15.3179C15.6945 15.442 16.0001 15.1367 16.0001 14.7598V11.7211L10.0463 7.62797Z"
          fill="#185C37"
        />
        <path
          d="M10.0463 0.558594H4.40289C4.02633 0.558594 3.7207 0.863906 3.7207 1.24078V4.27953L10.0463 8.00047L13.3951 9.11672L15.9998 8.00047V4.27953L10.0463 0.558594Z"
          fill="#21A366"
        />
        <path
          d="M3.7207 4.2793H10.0463V8.00023H3.7207V4.2793Z"
          fill="#107C41"
        />
        <path
          opacity="0.1"
          d="M8.24789 3.53516H3.7207V12.8373H8.24789C8.62414 12.8361 8.92883 12.5314 8.93008 12.1552V4.21703C8.92883 3.84078 8.62414 3.53641 8.24789 3.53516Z"
          fill="black"
        />
        <path
          opacity="0.2"
          d="M7.87602 3.90625H3.7207V13.2088H7.87602C8.25227 13.2075 8.55695 12.9028 8.5582 12.5266V4.58844C8.55664 4.21219 8.25195 3.9075 7.87602 3.90625Z"
          fill="black"
        />
        <path
          opacity="0.2"
          d="M7.87602 3.90625H3.7207V12.4644H7.87602C8.25227 12.4631 8.55695 12.1584 8.5582 11.7822V4.58844C8.55664 4.21219 8.25195 3.9075 7.87602 3.90625Z"
          fill="black"
        />
        <path
          opacity="0.2"
          d="M7.50383 3.90625H3.7207V12.4644H7.50383C7.88008 12.4631 8.18477 12.1584 8.18602 11.7822V4.58844C8.18445 4.21219 7.88008 3.9075 7.50383 3.90625Z"
          fill="black"
        />
        <path
          d="M0.682187 3.90625H7.50406C7.88063 3.90625 8.18625 4.21156 8.18625 4.58844V11.4103C8.18625 11.7869 7.88094 12.0925 7.50406 12.0925H0.682187C0.305312 12.0925 0 11.7872 0 11.4103V4.58844C0 4.21156 0.305312 3.90625 0.682187 3.90625Z"
          fill="url(#paint0_linear_2641_20024)"
        />
        <path
          d="M2.1123 10.2173L3.54699 7.99414L2.2323 5.7832H3.2898L4.0073 7.19727C4.07355 7.33164 4.11887 7.43133 4.14355 7.49727H4.15293C4.20012 7.39008 4.2498 7.28602 4.30168 7.18508L5.06855 5.78414H6.03949L4.69137 7.98195L6.07355 10.2176H5.04043L4.21168 8.6657C4.17262 8.59977 4.13949 8.53039 4.11262 8.45852H4.10043C4.07605 8.52883 4.04387 8.59633 4.00449 8.65945L3.15137 10.2179L2.1123 10.2173Z"
          fill="white"
        />
        <path
          d="M15.3181 0.558594H10.0469V4.27953H16.0003V1.24078C16.0003 0.863906 15.695 0.558594 15.3181 0.558594Z"
          fill="#33C481"
        />
        <path d="M10.0469 8H16.0003V11.7209H10.0469V8Z" fill="#107C41" />
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_2641_20024"
          x1="1.42208"
          y1="3.37341"
          x2="6.76396"
          y2="12.6253"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#18884F" />
          <stop offset="0.5" stopColor="#117E43" />
          <stop offset="1" stopColor="#0B6631" />
        </linearGradient>
        <clipPath id="clip0_2641_20024">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );

  // Function to remove uploaded file and update uploadedDocuments accordingly
  const removeUploadedFile = (fileId: string) => {
    setUploadedFiles((prev) => {
      const next = prev.filter((file) => file.id !== fileId);
      // derive docId from removed file id (strip trailing timestamp)
      const removedDocId = fileId.replace(/-\d+$/, "");
      // if no remaining file for that docId, remove from uploadedDocuments
      const stillExists = next.some(
        (f) => f.id.replace(/-\d+$/, "") === removedDocId,
      );
      if (!stillExists) {
        setUploadedDocuments((docs) => docs.filter((d) => d !== removedDocId));
      }
      return next;
    });
  };

  // helpers for server uploads
  const buildFormData = (file: Blob, filename: string) => {
    const formData = new FormData();
    formData.append("File", file, filename);
    formData.append("DocumentDefinitionId", DOCUMENT_DEFINITION_ID);
    formData.append("Bucket", "string");
    formData.append("UserTemplateSubmissionId", "5");
    return formData;
  };

  const uploadOrUpdateFile = async (
    file: Blob,
    filename: string,
    existingId?: number,
  ) => {
    const formData = buildFormData(file, filename);
    const url = existingId
      ? `${API_BASE}/api/Files/${existingId}`
      : `${API_BASE}/api/Files/upload`;
    const method = existingId ? "PUT" : "POST";
    const res = await fetch(url, { method, body: formData });
    if (!res.ok) throw new Error(`${method} failed: ${res.statusText}`);
    const result = await res.json().catch(() => ({}));
    const returnedId =
      (result &&
        result.file &&
        typeof result.file.id === "number" &&
        result.file.id) ||
      (typeof result.id === "number" && result.id) ||
      (result &&
        result.mapping &&
        typeof result.mapping.fileId === "number" &&
        result.mapping.fileId) ||
      existingId ||
      null;
    if (!returnedId) throw new Error("Upload/Update did not return an id");
    return returnedId as number;
  };

  const uploadFileToServer = async (file: Blob, filename: string) => {
    return uploadOrUpdateFile(file, filename);
  };

  // Get available countries from configuration
  const availableCountries = documentConfig.supportedCountries || [];

  // Get documents for selected country
  const getDocumentsForCountry = (countryName: string) => {
    const countryData = availableCountries.find(
      (c) => c.countryName === countryName,
    );
    return countryData?.documents || [];
  };

  // Get current documents to display
  const currentDocuments = country ? getDocumentsForCountry(country) : [];

  // Default document colors and icons
  const getDocumentStyle = (docName: string) => {
    const styles: Record<string, { color: string; icon: JSX.Element }> = {
      Passport: {
        color: "#5A43D6",
        icon: (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 21.5C10.6975 21.5 9.46833 21.2503 8.3125 20.751C7.15667 20.2517 6.14867 19.5718 5.2885 18.7115C4.42817 17.8513 3.74833 16.8433 3.249 15.6875C2.74967 14.5317 2.5 13.3025 2.5 12C2.5 10.6872 2.74967 9.45542 3.249 8.30475C3.74833 7.15408 4.42817 6.14867 5.2885 5.2885C6.14867 4.42817 7.15667 3.74833 8.3125 3.249C9.46833 2.74967 10.6975 2.5 12 2.5C13.3128 2.5 14.5446 2.74967 15.6953 3.249C16.8459 3.74833 17.8513 4.42817 18.7115 5.2885C19.5718 6.14867 20.2517 7.15408 20.751 8.30475C21.2503 9.45542 21.5 10.6872 21.5 12C21.5 13.3025 21.2503 14.5317 20.751 15.6875C20.2517 16.8433 19.5718 17.8513 18.7115 18.7115C17.8513 19.5718 16.8459 20.2517 15.6953 20.751C14.5446 21.2503 13.3128 21.5 12 21.5ZM12 19.9788C12.5103 19.3019 12.9398 18.6192 13.2885 17.9307C13.6372 17.2422 13.9212 16.4897 14.1405 15.673H9.8595C10.0917 16.5153 10.3789 17.2808 10.7213 17.9693C11.0634 18.6578 11.4897 19.3276 12 19.9788ZM10.0635 19.7038C9.68017 19.1538 9.33592 18.5285 9.03075 17.828C8.72558 17.1273 8.48842 16.409 8.31925 15.673H4.927C5.45517 16.7115 6.1635 17.584 7.052 18.2905C7.9405 18.9968 8.94433 19.4679 10.0635 19.7038ZM13.9365 19.7038C15.0557 19.4679 16.0595 18.9968 16.948 18.2905C17.8365 17.584 18.5448 16.7115 19.073 15.673H15.6807C15.4794 16.4153 15.2262 17.1368 14.921 17.8375C14.616 18.5382 14.2878 19.1603 13.9365 19.7038ZM4.298 14.173H8.0155C7.95267 13.8013 7.90708 13.4369 7.87875 13.0798C7.85058 12.7228 7.8365 12.3628 7.8365 12C7.8365 11.6372 7.85058 11.2773 7.87875 10.9202C7.90708 10.5631 7.95267 10.1987 8.0155 9.827H4.298C4.20183 10.1667 4.12817 10.5198 4.077 10.8865C4.02567 11.2532 4 11.6243 4 12C4 12.3757 4.02567 12.7468 4.077 13.1135C4.12817 13.4802 4.20183 13.8333 4.298 14.173ZM9.51525 14.173H14.4848C14.5474 13.8013 14.5929 13.4402 14.6212 13.0895C14.6494 12.7388 14.6635 12.3757 14.6635 12C14.6635 11.6243 14.6494 11.2612 14.6212 10.9105C14.5929 10.5598 14.5474 10.1987 14.4848 9.827H9.51525C9.45258 10.1987 9.40708 10.5598 9.37875 10.9105C9.35058 11.2612 9.3365 11.6243 9.3365 12C9.3365 12.3757 9.35058 12.7388 9.37875 13.0895C9.40708 13.4402 9.45258 13.8013 9.51525 14.173ZM15.9845 14.173H19.702C19.7982 13.8333 19.8718 13.4802 19.923 13.1135C19.9743 12.7468 20 12.3757 20 12C20 11.6243 19.9743 11.2532 19.923 10.8865C19.8718 10.5198 19.7982 10.1667 19.702 9.827H15.9845C16.0473 10.1987 16.0929 10.5631 16.1212 10.9202C16.1494 11.2773 16.1635 11.6372 16.1635 12C16.1635 12.3628 16.1494 12.7228 16.1212 13.0798C16.0929 13.4369 16.0473 13.8013 15.9845 14.173ZM15.6807 8.327H19.073C18.5385 7.27567 17.835 6.40317 16.9625 5.7095C16.09 5.016 15.0813 4.54167 13.9365 4.2865C14.3198 4.8685 14.6608 5.50508 14.9595 6.19625C15.2583 6.88725 15.4987 7.5975 15.6807 8.327ZM9.8595 8.327H14.1405C13.9083 7.491 13.6163 6.72075 13.2645 6.01625C12.9125 5.31175 12.491 4.64675 12 4.02125C11.509 4.64675 11.0875 5.31175 10.7355 6.01625C10.3837 6.72075 10.0917 7.491 9.8595 8.327ZM4.927 8.327H8.31925C8.50125 7.5975 8.74167 6.88725 9.0405 6.19625C9.33917 5.50508 9.68017 4.8685 10.0635 4.2865C8.91217 4.54167 7.90192 5.01767 7.03275 5.7145C6.16342 6.41117 5.4615 7.282 4.927 8.327Z"
              fill="white"
            />
          </svg>
        ),
      },
      "Driver License": {
        color: "#ED5F00",
        icon: (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.30775 20.5C3.80258 20.5 3.375 20.325 3.025 19.975C2.675 19.625 2.5 19.1974 2.5 18.6923V5.30775C2.5 4.80258 2.675 4.375 3.025 4.025C3.375 3.675 3.80258 3.5 4.30775 3.5H19.6923C20.1974 3.5 20.625 3.675 20.975 4.025C21.325 4.375 21.5 4.80258 21.5 5.30775V18.6923C21.5 19.1974 21.325 19.625 20.975 19.975C20.625 20.325 20.1974 20.5 19.6923 20.5H4.30775ZM4.30775 19H19.6923C19.7693 19 19.8398 18.9679 19.9038 18.9038C19.9679 18.8398 20 18.7692 20 18.6923V5.30775C20 5.23075 19.9679 5.16025 19.9038 5.09625C19.8398 5.03208 19.7693 5 19.6923 5H4.30775C4.23075 5 4.16025 5.03208 4.09625 5.09625C4.03208 5.16025 4 5.23075 4 5.30775V18.6923C4 18.7692 4.03208 18.8398 4.09625 18.9038C4.16025 18.9679 4.23075 19 4.30775 19ZM5.25 16.75H9.75V15.25H5.25V16.75ZM14.55 14.6442L19.1443 10.05L18.075 8.98075L14.55 12.5308L13.125 11.1057L12.0808 12.175L14.55 14.6442ZM5.25 12.75H9.75V11.25H5.25V12.75ZM5.25 8.75H9.75V7.25H5.25V8.75Z"
              fill="white"
            />
          </svg>
        ),
      },
      "State ID": {
        color: "#00B499",
        icon: (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 17.6923C11.0153 17.6923 10.066 17.8509 9.152 18.1683C8.23783 18.4856 7.39225 18.9679 6.61525 19.6152C6.62808 19.7064 6.66342 19.7882 6.72125 19.8605C6.77892 19.933 6.843 19.9795 6.9135 20H17.077C17.1475 19.9795 17.2116 19.933 17.2693 19.8605C17.3269 19.7882 17.3622 19.7064 17.375 19.6152C16.6108 18.9679 15.7718 18.4856 14.8577 18.1683C13.9436 17.8509 12.991 17.6923 12 17.6923ZM12 16.1923C13.15 16.1923 14.225 16.3673 15.225 16.7172C16.225 17.0673 17.15 17.5589 18 18.1923V4.30775C18 4.23075 17.9679 4.16025 17.9038 4.09625C17.8398 4.03208 17.7692 4 17.6923 4H6.30775C6.23075 4 6.16025 4.03208 6.09625 4.09625C6.03208 4.16025 6 4.23075 6 4.30775V18.1923C6.85 17.5589 7.775 17.0673 8.775 16.7172C9.775 16.3673 10.85 16.1923 12 16.1923ZM12 12.5385C11.5192 12.5385 11.1073 12.367 10.7645 12.024C10.4215 11.6812 10.25 11.2693 10.25 10.7885C10.25 10.3077 10.4215 9.89583 10.7645 9.553C11.1073 9.21 11.5192 9.0385 12 9.0385C12.4808 9.0385 12.8927 9.21 13.2355 9.553C13.5785 9.89583 13.75 10.3077 13.75 10.7885C13.75 11.2693 13.5785 11.6812 13.2355 12.024C12.8927 12.367 12.4808 12.5385 12 12.5385ZM6.30775 21.5C5.80258 21.5 5.375 21.325 5.025 20.975C4.675 20.625 4.5 20.1974 4.5 19.6923V4.30775C4.5 3.80258 4.675 3.375 5.025 3.025C5.375 2.675 5.80258 2.5 6.30775 2.5H17.6923C18.1974 2.5 18.625 2.675 18.975 3.025C19.325 3.375 19.5 3.80258 19.5 4.30775V19.6923C19.5 20.1974 19.325 20.625 18.975 20.975C18.625 21.325 18.1974 21.5 17.6923 21.5H6.30775ZM12 14.0385C12.9025 14.0385 13.6698 13.7225 14.302 13.0905C14.934 12.4583 15.25 11.691 15.25 10.7885C15.25 9.886 14.934 9.11867 14.302 8.4865C13.6698 7.8545 12.9025 7.5385 12 7.5385C11.0975 7.5385 10.3302 7.8545 9.698 8.4865C9.066 9.11867 8.75 9.886 8.75 10.7885C8.75 11.691 9.066 12.4583 9.698 13.0905C10.3302 13.7225 11.0975 14.0385 12 14.0385Z"
              fill="white"
            />
          </svg>
        ),
      },
      "Social Security Card": {
        color: "#9C2BAD",
        icon: (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14.077 12.7308H18.6152V11.2308H14.077V12.7308ZM14.077 9.84625H18.6152V8.34625H14.077V9.84625ZM5.38475 15.6538H12.6923V15.2963C12.6923 14.6296 12.3624 14.1058 11.7028 13.725C11.0433 13.3442 10.1552 13.1538 9.0385 13.1538C7.92183 13.1538 7.03367 13.3442 6.374 13.725C5.7145 14.1058 5.38475 14.6296 5.38475 15.2963V15.6538ZM9.0385 11.8463C9.52433 11.8463 9.93742 11.676 10.2777 11.3355C10.6182 10.9952 10.7885 10.5821 10.7885 10.0962C10.7885 9.61025 10.6182 9.19708 10.2777 8.85675C9.93742 8.51642 9.52433 8.34625 9.0385 8.34625C8.55267 8.34625 8.1395 8.51642 7.799 8.85675C7.45867 9.19708 7.2885 9.61025 7.2885 10.0962C7.2885 10.5821 7.45867 10.9952 7.799 11.3355C8.1395 11.676 8.55267 11.8463 9.0385 11.8463ZM4.30775 19.5C3.80258 19.5 3.375 19.325 3.025 18.975C2.675 18.625 2.5 18.1974 2.5 17.6923V6.30775C2.5 5.80258 2.675 5.375 3.025 5.025C3.375 4.675 3.80258 4.5 4.30775 4.5H19.6923C20.1974 4.5 20.625 4.675 20.975 5.025C21.325 5.375 21.5 5.80258 21.5 6.30775V17.6923C21.5 18.1974 21.325 18.625 20.975 18.975C20.625 19.325 20.1974 19.5 19.6923 19.5H4.30775ZM4.30775 18H19.6923C19.7693 18 19.8398 17.9679 19.9038 17.9038C19.9679 17.8398 20 17.7692 20 17.6923V6.30775C20 6.23075 19.9679 6.16025 19.9038 6.09625C19.8398 6.03208 19.7693 6 19.6923 6H4.30775C4.23075 6 4.16025 6.03208 4.09625 6.09625C4.03208 6.16025 4 6.23075 4 6.30775V17.6923C4 17.7692 4.03208 17.8398 4.09625 17.9038C4.16025 17.9679 4.23075 18 4.30775 18Z"
              fill="white"
            />
          </svg>
        ),
      },
    };

    return (
      styles[docName] || {
        color: "#5A43D6",
        icon: (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14.077 12.7308H18.6152V11.2308H14.077V12.7308ZM14.077 9.84625H18.6152V8.34625H14.077V9.84625ZM5.38475 15.6538H12.6923V15.2963C12.6923 14.6296 12.3624 14.1058 11.7028 13.725C11.0433 13.3442 10.1552 13.1538 9.0385 13.1538C7.92183 13.1538 7.03367 13.3442 6.374 13.725C5.7145 14.1058 5.38475 14.6296 5.38475 15.2963V15.6538ZM9.0385 11.8463C9.52433 11.8463 9.93742 11.676 10.2777 11.3355C10.6182 10.9952 10.7885 10.5821 10.7885 10.0962C10.7885 9.61025 10.6182 9.19708 10.2777 8.85675C9.93742 8.51642 9.52433 8.34625 9.0385 8.34625C8.55267 8.34625 8.1395 8.51642 7.799 8.85675C7.45867 9.19708 7.2885 9.61025 7.2885 10.0962C7.2885 10.5821 7.45867 10.9952 7.799 11.3355C8.1395 11.676 8.55267 11.8463 9.0385 11.8463ZM4.30775 19.5C3.80258 19.5 3.375 19.325 3.025 18.975C2.675 18.625 2.5 18.1974 2.5 17.6923V6.30775C2.5 5.80258 2.675 5.375 3.025 5.025C3.375 4.675 3.80258 4.5 4.30775 4.5H19.6923C20.1974 4.5 20.625 4.675 20.975 5.025C21.325 5.375 21.5 5.80258 21.5 6.30775V17.6923C21.5 18.1974 21.325 18.625 20.975 18.975C20.625 19.325 20.1974 19.5 19.6923 19.5H4.30775ZM4.30775 18H19.6923C19.7693 18 19.8398 17.9679 19.9038 17.9038C19.9679 17.8398 20 17.7692 20 17.6923V6.30775C20 6.23075 19.9679 6.16025 19.9038 6.09625C19.8398 6.03208 19.7693 6 19.6923 6H4.30775C4.23075 6 4.16025 6.03208 4.09625 6.09625C4.03208 6.16025 4 6.23075 4 6.30775V17.6923C4 17.7692 4.03208 17.8398 4.09625 17.9038C4.16025 17.9679 4.23075 18 4.30775 18Z"
              fill="white"
            />
          </svg>
        ),
      }
    );
  };

  return (
    <div className="flex flex-col items-start gap-4 self-stretch w-full">
      {/* Country Selection */}
      <div className="flex flex-col items-start self-stretch">
        {/* Label */}
        <div className="flex pb-2 items-start gap-2 self-stretch">
          <div className="flex h-2.5 flex-col justify-center flex-1 text-[#172B4D] font-roboto text-[13px] font-medium leading-[18px]">
            Country
          </div>
        </div>

        {/* Input Container */}
        <div className="flex w-full items-start gap-6">
          {/* Country Dropdown */}
          <div className="flex-1">
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full h-[38px] px-3 py-[8px] rounded border border-[#C3C6D4] bg-white text-[#172B4D] font-roboto text-[13px]"
            >
              <option value="">Select</option>
              {availableCountries.map((countryData) => (
                <option
                  key={countryData.countryName}
                  value={countryData.countryName}
                >
                  {countryData.countryName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Document Type Selection - Only show when a country is selected */}
      {country && currentDocuments.length > 0 && (
        <div className="flex flex-col items-start gap-4 self-stretch">
          {/* Section Header */}
          <div className="flex flex-col items-start gap-1 self-stretch">
            <div className="flex items-center gap-2 self-stretch">
              <div className="text-[#172B4D] font-roboto text-base font-bold leading-[26px]">
                Select the ID Type
              </div>
            </div>
            <div className="self-stretch text-[#676879] font-roboto text-[13px] font-normal leading-5">
              Select the ID you'd like to use for verification.
            </div>
          </div>

          {/* Document Options Grid */}
          <div className="flex flex-col items-start gap-8 self-stretch">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              {currentDocuments.map((docName) => {
                const docId = docName.toLowerCase().replace(/\s+/g, "_");
                const isSelected = selectedDocument === docId;
                const isUploaded = uploadedDocuments.includes(docId);
                const docStyle = getDocumentStyle(docName);

                return (
                  <button
                    key={docId}
                    onClick={() => {
                      if (selectedDocument === docId) {
                        // toggle off
                        setSelectedDocument("");
                        setShowCameraDialog(false);
                        setShowUploadDialog(false);
                      } else {
                        setSelectedDocument(docId);
                      }
                    }}
                    className={`relative flex p-4 pb-3 flex-col items-start gap-3 rounded border transition-all ${
                      isUploaded
                        ? "border-[#00B499] bg-[#EBFFF5]"
                        : isSelected
                          ? "border-[#0073EA] bg-[#F0F8FF]"
                          : "border-[#C3C6D4] bg-white hover:border-[#0073EA]/50"
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className="flex w-8 h-8 p-2 justify-center items-center gap-2 aspect-square rounded"
                      style={{ backgroundColor: docStyle.color }}
                    >
                      {docStyle.icon}
                    </div>

                    {/* Document Name */}
                    <div className="text-[#172B4D] font-roboto text-[14px] font-medium leading-[22px]">
                      {docName}
                    </div>

                    {isUploaded && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-white rounded-full p-1 border border-[#E6F1FD]">
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M6.21967 9.86236L7.71968 11.3624C8.01255 11.6552 8.48745 11.6552 8.78032 11.3624L12.1553 7.98736C12.4482 7.69447 12.4482 7.2196 12.1553 6.9267C11.8624 6.63381 11.3876 6.63381 11.0947 6.9267L8.25 9.77138L7.28033 8.80171C6.98744 8.50883 6.51256 8.50883 6.21967 8.80171C5.92678 9.09458 5.92678 9.56948 6.21967 9.86236Z"
                            fill="#039855"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Upload Methods - Only show when a document is selected */}
      {selectedDocument && (
        <div className="flex flex-col items-start gap-4 self-stretch">
          {/* Section Header */}
          <div className="flex flex-col items-start gap-1 self-stretch">
            <div className="flex items-center gap-2 self-stretch">
              <div className="text-[#172B4D] font-roboto text-base font-bold leading-[26px]">
                Choose a method to upload your document
              </div>
            </div>
          </div>

          {/* Upload Options Grid */}
          {documentConfig.allowCaptureWebcam ||
          documentConfig.allowUploadFromDevice ? (
            <div
              className={`grid gap-6 w-full ${
                documentConfig.allowCaptureWebcam &&
                documentConfig.allowUploadFromDevice
                  ? "grid-cols-1 lg:grid-cols-2"
                  : "grid-cols-1 max-w-md mx-auto"
              }`}
            >
              {/* Camera Upload - Show if allowCaptureWebcam is true */}
              {documentConfig.allowCaptureWebcam && (
                <button
                  onClick={() => setShowCameraDialog(true)}
                  className="flex flex-col justify-center items-center border-2 border-dashed border-[#C3C6D4] rounded-t-lg h-[156px] bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="flex w-[271px] flex-col justify-center items-center gap-2">
                    <div className="flex w-[52px] h-[52px] p-2 justify-center items-center rounded-full bg-[#F6F7FB]">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 25"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1.99805 8.87722C1.99805 8.5269 1.99805 8.35174 2.01267 8.20421C2.15365 6.78127 3.27932 5.6556 4.70226 5.51462C4.84979 5.5 5.03441 5.5 5.40363 5.5C5.5459 5.5 5.61704 5.5 5.67744 5.49634C6.44866 5.44963 7.124 4.96288 7.41219 4.246C7.43476 4.18986 7.45586 4.12657 7.49805 4C7.54024 3.87343 7.56134 3.81014 7.58391 3.754C7.8721 3.03712 8.54744 2.55037 9.31866 2.50366C9.37906 2.5 9.44577 2.5 9.57919 2.5H14.4169C14.5503 2.5 14.617 2.5 14.6774 2.50366C15.4486 2.55037 16.124 3.03712 16.4121 3.754C16.4347 3.81014 16.4558 3.87343 16.498 4C16.5402 4.12657 16.5613 4.18986 16.5839 4.246C16.872 4.96288 17.5474 5.44963 18.3186 5.49634C18.379 5.5 18.4501 5.5 18.5924 5.5C18.9616 5.5 19.1463 5.5 19.2938 5.51462C20.7167 5.6556 21.8424 6.78127 21.9834 8.20421C21.998 8.35174 21.998 8.5269 21.998 8.87722V16.7C21.998 18.3802 21.998 19.2202 21.671 19.862C21.3834 20.4265 20.9245 20.8854 20.36 21.173C19.7182 21.5 18.8782 21.5 17.198 21.5H6.79805C5.11789 21.5 4.27781 21.5 3.63608 21.173C3.07159 20.8854 2.61265 20.4265 2.32503 19.862C1.99805 19.2202 1.99805 18.3802 1.99805 16.7V8.87722Z"
                          stroke="#676879"
                          strokeWidth="1.35"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M11.998 17C14.2071 17 15.998 15.2091 15.998 13C15.998 10.7909 14.2071 9 11.998 9C9.78891 9 7.99805 10.7909 7.99805 13C7.99805 15.2091 9.78891 17 11.998 17Z"
                          stroke="#676879"
                          strokeWidth="1.35"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div className="text-[#323238] text-center font-figtree text-[13px] font-medium">
                      Camera
                    </div>
                    <div className="w-[257px] text-[#676879] text-center font-roboto text-[13px] font-normal leading-5">
                      Take a photo of your document using your camera
                    </div>
                  </div>
                </button>
              )}

              {/* File Upload - Show if allowUploadFromDevice is true */}
              {documentConfig.allowUploadFromDevice && (
                <button
                  onClick={() => setShowUploadDialog(true)}
                  className="flex flex-col justify-center items-center border-2 border-dashed border-[#C3C6D4] rounded-t-lg h-[156px] bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="flex w-[271px] flex-col justify-center items-center gap-2">
                    <div className="flex w-[52px] h-[52px] p-2 justify-center items-center rounded-full bg-[#F6F7FB]">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 25"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M7.76471 12.0294C6.88944 12.0294 6.4518 12.0294 6.09274 12.1256C5.11837 12.3867 4.35729 13.1478 4.09621 14.1221C4 14.4812 4 14.9188 4 15.7941V16.9235C4 18.5049 4 19.2955 4.30775 19.8995C4.57845 20.4308 5.01039 20.8627 5.54168 21.1334C6.14566 21.4412 6.93632 21.4412 8.51765 21.4412H16.4235C18.0049 21.4412 18.7955 21.4412 19.3995 21.1334C19.9308 20.8627 20.3627 20.4308 20.6334 19.8995C20.9412 19.2955 20.9412 18.5049 20.9412 16.9235V15.7941C20.9412 14.9188 20.9412 14.4812 20.845 14.1221C20.5839 13.1478 19.8228 12.3867 18.8485 12.1256C18.4894 12.0294 18.0518 12.0294 17.1765 12.0294M16.2353 8.26471L12.4706 4.5M12.4706 4.5L8.70588 8.26471M12.4706 4.5V15.7941"
                          stroke="#676879"
                          strokeWidth="1.41176"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div className="text-[#323238] text-center font-figtree text-[13px] font-medium">
                      Upload Files
                    </div>
                    <div className="w-[257px] text-[#676879] text-center font-roboto text-[13px] font-normal leading-5">
                      Upload a photo or scan of your document from your device
                    </div>
                  </div>
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[156px] border-2 border-dashed border-[#C3C6D4] rounded-lg bg-gray-50">
              <div className="text-[#676879] font-roboto text-[13px] font-normal text-center">
                No upload methods are currently available.
                <br />
                Please contact support for assistance.
              </div>
            </div>
          )}

          {/* QR Code Upload */}
          <div className="flex flex-col items-center gap-4 self-stretch border-2 border-dashed border-[#C3C6D4] rounded-lg bg-white p-4">
            <div className="flex flex-col sm:flex-row w-full justify-center items-center gap-4">
              <div className="flex justify-center items-center">
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/e4a25327bd6d9a0c88f260c5b3b9c48816547c30?width=220"
                  alt="QR Code"
                  className="w-20 h-20 sm:w-[110px] sm:h-[113px] object-contain"
                />
              </div>
              <div className="flex flex-col justify-center items-start sm:items-start gap-2 text-center sm:text-left">
                <div className="max-w-[214px] flex flex-col items-start gap-3">
                  <div className="self-stretch text-[#676879] text-center font-roboto text-[13px] font-normal leading-5">
                    Continue on another device by scanning the QR code or
                    opening{" "}
                    <span className="text-[#0073EA]">https://google.com</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full flex justify-end items-center mt-2">
              <div className="flex items-center gap-2">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.0003 13.8332V10.4998M10.0003 7.1665H10.0087M18.3337 10.4998C18.3337 15.1022 14.6027 18.8332 10.0003 18.8332C5.39795 18.8332 1.66699 15.1022 1.66699 10.4998C1.66699 5.89746 5.39795 2.1665 10.0003 2.1665C14.6027 2.1665 18.3337 5.89746 18.3337 10.4998Z"
                    stroke="#0073EA"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="text-[#0073EA] font-roboto text-[12px] font-normal leading-5">
                  How does this work?
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Files Uploaded Section */}
      {uploadedFiles.length > 0 && (
        <div className="flex flex-col items-start gap-4 self-stretch">
          {/* Section Header */}
          <div className="flex flex-col items-start gap-1 self-stretch">
            <div className="flex items-center gap-2 self-stretch">
              <div className="text-text-primary font-roboto text-base font-bold leading-[26px]">
                Files Uploaded
              </div>
            </div>
            <div className="self-stretch text-text-secondary font-roboto text-[13px] font-normal leading-5">
              Select the ID you'd like to use for verification.
            </div>
          </div>

          {/* Uploaded Files Grid */}
          <div className="flex flex-wrap items-start gap-4 self-stretch">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex flex-1 min-w-0 max-w-[456px] p-4 flex-col justify-center items-start gap-2 rounded-lg bg-muted"
              >
                <div className="flex justify-between items-start self-stretch">
                  <div className="flex items-center gap-2">
                    <div className="flex p-[7px] justify-center items-center gap-2 rounded border border-border bg-background">
                      {getFileIcon()}
                    </div>
                    <div className="flex flex-col justify-center items-start gap-[2px]">
                      <div className="text-text-primary font-figtree text-[13px] font-medium leading-normal">
                        {file.name}
                      </div>
                      <div className="text-text-muted font-figtree text-xs font-normal leading-5">
                        Size {file.size}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeUploadedFile(file.id)}
                    className="flex w-7 h-7 justify-center items-center gap-2.5 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5"
                        stroke="#676879"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dialogs */}
      <CameraDialog
        isOpen={showCameraDialog}
        onClose={() => setShowCameraDialog(false)}
        previousFileIds={
          selectedDocument ? documentUploadIds[selectedDocument] : undefined
        }
        onUploaded={(side, id) => {
          if (!selectedDocument) return;
          setDocumentUploadIds((prev) => ({
            ...prev,
            [selectedDocument]: {
              ...(prev[selectedDocument] || {}),
              [side]: id,
            },
          }));
        }}
        onSubmit={() => {
          setShowCameraDialog(false);
          if (selectedDocument) {
            const docId = selectedDocument;

            // ensure uploadedDocuments contains docId
            setUploadedDocuments((prevDocs) =>
              prevDocs.includes(docId) ? prevDocs : [...prevDocs, docId],
            );

            // Add uploaded file to the files list, but first remove previous instances of this docId
            const newFile: UploadedFile = {
              id: `${docId}-${Date.now()}`,
              name: `${docId.replace(/_/g, " ")}.jpg`,
              size: "2.5MB",
              type: "image",
            };

            setUploadedFiles((prev) => {
              const filtered = prev.filter(
                (f) => f.id.replace(/-\d+$/, "") !== docId,
              );
              return [...filtered, newFile];
            });

            setSelectedDocument("");
            // call onComplete only when all required documents are uploaded
            const requiredIds = currentDocuments.map((docName) =>
              docName.toLowerCase().replace(/\s+/g, "_"),
            );
            const allUploaded = requiredIds.every(
              (id) => id === docId || uploadedDocuments.includes(id),
            );
            if (allUploaded) onComplete?.();
          }
        }}
      />

      <UploadDialog
        isOpen={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        onSubmit={async (frontFile, backFile) => {
          if (!selectedDocument) return;
          const docId = selectedDocument;

          try {
            const prevIds = documentUploadIds[docId];

            const [frontId, backId] = await Promise.all([
              uploadOrUpdateFile(
                frontFile,
                `${docId}-front.${frontFile.type.includes("pdf") ? "pdf" : "jpg"}`,
                prevIds?.front,
              ),
              uploadOrUpdateFile(
                backFile,
                `${docId}-back.${backFile.type.includes("pdf") ? "pdf" : "jpg"}`,
                prevIds?.back,
              ),
            ]);

            setDocumentUploadIds((prev) => ({
              ...prev,
              [docId]: { front: frontId, back: backId },
            }));

            setUploadedDocuments((prevDocs) =>
              prevDocs.includes(docId) ? prevDocs : [...prevDocs, docId],
            );

            const newFile: UploadedFile = {
              id: `${docId}-${Date.now()}`,
              name: `${docId.replace(/_/g, " ")}.pdf`,
              size: "3MB",
              type: "document",
            };
            setUploadedFiles((prev) => {
              const filtered = prev.filter(
                (f) => f.id.replace(/-\d+$/, "") !== docId,
              );
              return [...filtered, newFile];
            });

            setSelectedDocument("");

            const requiredIds = currentDocuments.map((docName) =>
              docName.toLowerCase().replace(/\s+/g, "_"),
            );
            const allUploaded = requiredIds.every(
              (id) => id === docId || uploadedDocuments.includes(id),
            );
            if (allUploaded) onComplete?.();
          } finally {
            setShowUploadDialog(false);
          }
        }}
      />
    </div>
  );
}
