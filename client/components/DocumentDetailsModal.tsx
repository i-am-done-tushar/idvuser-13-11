import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DocumentDetailsModalProps {
  trigger: React.ReactNode;
  data?: {
    personalInfo?: {
      firstName?: string;
      lastName?: string;
      dateOfBirth?: string;
      email?: string;
      phoneNumber?: string;
      addressLine?: string;
      city?: string;
      state?: string;
      pinCode?: string;
      country?: string;
      idDocumentNumber?: string;
    };
    documents?: Array<{
      image: string;
      name: string;
      type: string;
      size: string;
    }>;
    biometricVerified?: boolean;
  };
}

export function DocumentDetailsModal({ trigger, data }: DocumentDetailsModalProps) {
  const personalInfo = data?.personalInfo || {
    firstName: "Opinder",
    lastName: "Singh",
    dateOfBirth: "12/08/1997",
    email: "opinder.singh@email.com",
    phoneNumber: "+91 96****1234",
    addressLine: "123, Carter Road,",
    city: "Mumbai",
    state: "Maharashtra",
    pinCode: "353729",
    country: "India",
    idDocumentNumber: "2416238128389",
  };

  const documents = data?.documents || [
    {
      image: "https://api.builder.io/api/v1/image/assets/TEMP/c38cf62b3314c2aa7de5c89dfdfb5b200b0d4976?width=65",
      name: "Filename.jpeg1",
      type: "JPEG",
      size: "Size 2.5 MB",
    },
    {
      image: "https://api.builder.io/api/v1/image/assets/TEMP/c38cf62b3314c2aa7de5c89dfdfb5b200b0d4976?width=65",
      name: "Filename.2png",
      type: "PNG",
      size: "Size 1.4 MB",
    },
  ];

  const biometricVerified = data?.biometricVerified ?? true;

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-[960px] max-h-[90vh] overflow-y-auto p-0 gap-0">
        <div className="flex flex-col gap-5 pb-5">
          <div className="flex h-[52px] px-5 py-2.5 justify-between items-center border-b border-[#D0D4E4] bg-white rounded-t-lg sticky top-0 z-10">
            <h2 className="text-[#323238] font-figtree text-lg font-bold leading-[26px]">
              Arcon Document Submission
            </h2>
          </div>

          <div className="flex flex-col gap-2 px-5">
            <div className="flex flex-col gap-0 rounded-lg bg-[#F6F7FB] p-3 pb-3">
              <div className="flex h-[38px] items-center">
                <h3 className="text-[#323238] font-roboto text-[15px] font-bold leading-3">
                  Personal Information
                </h3>
              </div>
              <div className="flex flex-col gap-2 bg-white p-2 rounded">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pb-2 border-b border-[#DEDEDD]">
                  <div className="flex flex-col">
                    <span className="text-[#323238] font-roboto text-[13px] font-medium leading-[18px]">
                      First Name
                    </span>
                    <span className="text-[#505258] font-roboto text-[13px] font-normal leading-5">
                      {personalInfo.firstName}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[#323238] font-roboto text-[13px] font-medium leading-[18px]">
                      Last Name
                    </span>
                    <span className="text-[#505258] font-roboto text-[13px] font-normal leading-5">
                      {personalInfo.lastName}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[#172B4D] font-roboto text-[13px] font-medium leading-[11.181px]">
                      Date Of Birth
                    </span>
                    <span className="text-[#505258] font-roboto text-[13px] font-normal leading-5">
                      {personalInfo.dateOfBirth}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[#172B4D] font-roboto text-[13px] font-medium leading-[11.181px]">
                      Email
                    </span>
                    <span className="text-[#505258] font-roboto text-[13px] font-normal leading-5 break-all">
                      {personalInfo.email}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pb-4 border-b border-[#DEDEDD]">
                  <div className="flex flex-col">
                    <span className="text-[#323238] font-roboto text-[13px] font-medium leading-[18px]">
                      Phone Number
                    </span>
                    <span className="text-[#505258] font-roboto text-[13px] font-normal leading-5">
                      {personalInfo.phoneNumber}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[#323238] font-roboto text-[13px] font-medium leading-[18px]">
                      Address Line
                    </span>
                    <span className="text-[#505258] font-roboto text-[13px] font-normal leading-5">
                      {personalInfo.addressLine}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[#172B4D] font-roboto text-[13px] font-medium leading-[11.181px]">
                      City
                    </span>
                    <span className="text-[#505258] font-roboto text-[13px] font-normal leading-5">
                      {personalInfo.city}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[#172B4D] font-roboto text-[13px] font-medium leading-[11.181px]">
                      State
                    </span>
                    <span className="text-[#505258] font-roboto text-[13px] font-normal leading-5">
                      {personalInfo.state}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pb-4">
                  <div className="flex flex-col">
                    <span className="text-[#323238] font-roboto text-[13px] font-medium leading-[18px]">
                      Pin Code
                    </span>
                    <span className="text-[#505258] font-roboto text-[13px] font-normal leading-5">
                      {personalInfo.pinCode}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[#172B4D] font-roboto text-[13px] font-medium leading-[18px]">
                      Country
                    </span>
                    <span className="text-[#505258] font-roboto text-[13px] font-normal leading-5">
                      {personalInfo.country}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[#172B4D] font-roboto text-[13px] font-medium leading-[11.181px]">
                      ID Document Number
                    </span>
                    <span className="text-[#505258] font-roboto text-[13px] font-normal leading-5">
                      {personalInfo.idDocumentNumber}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[#172B4D] font-roboto text-[13px] font-medium leading-[11.181px]">
                      State
                    </span>
                    <span className="text-[#505258] font-roboto text-[13px] font-normal leading-5">
                      {personalInfo.state}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-0 rounded-lg bg-[#F6F7FB] p-3 pb-3">
              <div className="flex h-[38px] items-center">
                <h3 className="text-[#323238] font-roboto text-[15px] font-bold leading-3">
                  Document Submitted
                </h3>
              </div>
              <div className="bg-white rounded overflow-x-auto">
                <div className="min-w-[600px]">
                  <div className="grid grid-cols-4 border-b border-[#DEDEDD]">
                    <div className="flex items-center h-[38px] px-2">
                      <span className="text-[#323238] font-figtree text-[13px] font-semibold">
                        Image
                      </span>
                    </div>
                    <div className="flex items-center h-[38px] px-2">
                      <span className="text-[#323238] font-figtree text-[13px] font-semibold">
                        Name
                      </span>
                    </div>
                    <div className="flex items-center h-[38px] px-2">
                      <span className="text-[#323238] font-figtree text-[13px] font-semibold">
                        Type
                      </span>
                    </div>
                    <div className="flex items-center h-[38px] px-2">
                      <span className="text-[#323238] font-figtree text-[13px] font-semibold">
                        Size
                      </span>
                    </div>
                  </div>

                  {documents.map((doc, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-4 border-t border-[#D0D4E4]"
                    >
                      <div className="flex items-center h-[38px] px-2">
                        <div className="w-8 h-8 rounded-[0.8px] border-[0.2px] border-[#8D8F96] bg-white overflow-hidden">
                          <img
                            src={doc.image}
                            alt={doc.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="flex items-center h-[38px] px-2">
                        <span className="text-[#676879] font-roboto text-[13px] font-normal leading-5 truncate">
                          {doc.name}
                        </span>
                      </div>
                      <div className="flex items-center h-[38px] px-2">
                        <span className="text-[#676879] font-roboto text-[13px] font-normal leading-5">
                          {doc.type}
                        </span>
                      </div>
                      <div className="flex items-center h-[38px] px-2">
                        <span className="text-[#676879] font-figtree text-[13px] font-normal leading-5">
                          {doc.size}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-0 rounded-lg bg-[#F6F7FB] p-3 pb-3">
              <div className="flex h-[38px] items-center">
                <h3 className="text-[#323238] font-roboto text-[15px] font-bold leading-3">
                  Biometric Verification
                </h3>
              </div>
              <div className="bg-white p-4 rounded">
                <div className="flex items-center">
                  <span className="text-[#323238] font-roboto text-[13px] font-medium leading-[18px]">
                    {biometricVerified
                      ? "Biometric face capture is successful"
                      : "Biometric verification pending"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg bg-[#F6F7FB] p-3">
              <p className="text-[#323238] font-roboto text-sm font-normal flex-1">
                You've shared your details for identity verification. Do you wish to
                revoke your consent?
              </p>
              <button className="flex h-8 px-2 py-2.5 justify-center items-center rounded text-[#0073EA] font-roboto text-[13px] font-medium hover:bg-[#0073EA]/10 transition-colors whitespace-nowrap">
                Revoke Consent
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
