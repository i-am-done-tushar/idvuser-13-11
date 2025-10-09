import path from "path";
import "dotenv/config";
import * as express from "express";
import express__default from "express";
import cors from "cors";
const handleDemo = (req, res) => {
  const response = {
    message: "Hello from Express server"
  };
  res.status(200).json(response);
};
const mockTemplate = {
  id: 1,
  name: "Identity Verification Template",
  description: "Standard identity verification process",
  createdBy: 1,
  createdByName: "System Admin",
  createdByEmail: "admin@idv.local",
  updatedBy: null,
  updatedByName: "",
  updatedByEmail: "",
  createdAt: "2025-01-14T11:28:19.173459+00:00",
  updatedAt: null,
  versions: [
    {
      versionId: 2,
      templateId: 1,
      versionNumber: 2,
      isActive: true,
      enforceRekyc: true,
      rekycDeadline: "2025-12-31",
      changeSummary: "Updated personal information fields",
      isDeleted: false,
      createdBy: 1,
      createdByName: "System Admin",
      createdByEmail: "admin@idv.local",
      updatedBy: null,
      updatedByName: "",
      updatedByEmail: "",
      createdAt: "2025-01-14T12:11:23.594132",
      updatedAt: "2025-01-14T12:11:23.594132",
      rowVersionBase64: "CN3ztexinqA=",
      sections: [
        {
          id: 5,
          templateVersionId: 2,
          name: "Personal Information",
          description: "Basic personal information for identity verification",
          orderIndex: 1,
          sectionType: "personalInformation",
          isActive: true,
          createdBy: 1,
          createdByName: "System Admin",
          createdByEmail: "admin@idv.local",
          updatedBy: null,
          updatedByName: null,
          updatedByEmail: null,
          createdAt: "2025-01-14T12:11:23.778971+00:00",
          updatedAt: null,
          fieldMappings: [
            {
              id: 5,
              templateSectionId: 5,
              structure: {
                fields: [
                  { name: "firstName", type: "string", required: true },
                  { name: "lastName", type: "string", required: true },
                  { name: "middleName", type: "string", required: false },
                  { name: "dateOfBirth", type: "date", required: true },
                  { name: "email", type: "email", required: true },
                  { name: "phoneNumber", type: "string", required: true },
                  { name: "gender", type: "enum", required: false, options: ["Male", "Female", "Non-Binary", "Prefer Not To Say"] },
                  { name: "address", type: "string", required: true },
                  { name: "city", type: "string", required: true },
                  { name: "postalCode", type: "string", required: true }
                ]
              },
              captureAllowed: false,
              uploadAllowed: false
            }
          ]
        },
        {
          id: 4,
          templateVersionId: 2,
          name: "Identity Document",
          description: "Government-issued identification document verification",
          orderIndex: 2,
          sectionType: "documents",
          isActive: true,
          createdBy: 1,
          createdByName: "System Admin",
          createdByEmail: "admin@idv.local",
          updatedBy: null,
          updatedByName: null,
          updatedByEmail: null,
          createdAt: "2025-01-14T12:11:23.718873+00:00",
          updatedAt: null,
          fieldMappings: [
            {
              id: 4,
              templateSectionId: 4,
              structure: {
                fields: [
                  { name: "documentType", type: "enum", required: true, options: ["passport", "driversLicense", "nationalId"] },
                  { name: "documentNumber", type: "string", required: true },
                  { name: "expiryDate", type: "date", required: false }
                ]
              },
              captureAllowed: true,
              uploadAllowed: true
            }
          ]
        },
        {
          id: 6,
          templateVersionId: 2,
          name: "Capture Selfie",
          description: "Live selfie capture for biometric verification",
          orderIndex: 3,
          sectionType: "biometrics",
          isActive: true,
          createdBy: 1,
          createdByName: "System Admin",
          createdByEmail: "admin@idv.local",
          updatedBy: null,
          updatedByName: null,
          updatedByEmail: null,
          createdAt: "2025-01-14T12:11:23.784691+00:00",
          updatedAt: null,
          fieldMappings: [
            {
              id: 6,
              templateSectionId: 6,
              structure: {},
              captureAllowed: true,
              uploadAllowed: false
            }
          ]
        }
      ]
    }
  ]
};
const handleGetTemplate = (req, res) => {
  const { id } = req.params;
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: "Invalid template ID" });
  }
  const template = { ...mockTemplate, id: Number(id) };
  res.json(template);
};
const API_BASE_URL = "http://10.10.2.133:8080";
const handleResolveShortCode = async (req, res) => {
  const { shortCode } = req.params;
  if (!shortCode) {
    return res.status(400).json({ error: "Short code is required" });
  }
  try {
    const response = await fetch(`${API_BASE_URL}/api/templates-link-generation/resolve/${shortCode}`, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to resolve shortcode: ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error resolving shortcode:", error);
    res.status(500).json({ error: "Failed to resolve shortcode" });
  }
};
const mockTemplateVersion = {
  versionId: 2,
  templateId: 2,
  versionNumber: 1,
  isActive: true,
  enforceRekyc: false,
  rekycDeadline: null,
  changeSummary: null,
  isDeleted: false,
  createdBy: 1,
  createdByName: "System Admin",
  createdByEmail: "admin@idv.local",
  updatedBy: null,
  updatedByName: null,
  updatedByEmail: null,
  createdAt: "2025-09-22T12:47:34.652137",
  updatedAt: "2025-09-22T12:47:34.65219",
  rowVersionBase64: "CN36BE2wYVI=",
  sections: [
    {
      id: 4,
      templateVersionId: 2,
      name: "Personal Information",
      description: "Please provide your basic personal information to begin the identity verification process.",
      orderIndex: 1,
      sectionType: "personalInformation",
      isActive: true,
      createdBy: 1,
      createdByName: "System Admin",
      createdByEmail: "admin@idv.local",
      updatedBy: null,
      updatedByName: null,
      updatedByEmail: null,
      createdAt: "2025-09-22T12:47:34.67911+00:00",
      updatedAt: null,
      fieldMappings: [
        {
          id: 4,
          templateSectionId: 4,
          structure: {
            fields: [
              { name: "firstName", type: "string", required: true },
              { name: "lastName", type: "string", required: true },
              { name: "middleName", type: "string", required: false },
              { name: "dateOfBirth", type: "date", required: true },
              { name: "email", type: "email", required: true },
              { name: "phoneNumber", type: "string", required: true },
              { name: "gender", type: "enum", required: false },
              { name: "address", type: "string", required: true },
              { name: "city", type: "string", required: true },
              { name: "postalCode", type: "string", required: true }
            ]
          },
          captureAllowed: false,
          uploadAllowed: false
        }
      ]
    },
    {
      id: 5,
      templateVersionId: 2,
      name: "Document Verification",
      description: "Choose a valid government-issued ID (like a passport, driver's license, or national ID) and upload a clear photo of it.",
      orderIndex: 2,
      sectionType: "documents",
      isActive: true,
      createdBy: 1,
      createdByName: "System Admin",
      createdByEmail: "admin@idv.local",
      updatedBy: null,
      updatedByName: null,
      updatedByEmail: null,
      createdAt: "2025-09-22T12:47:34.709319+00:00",
      updatedAt: null,
      fieldMappings: [
        {
          id: 5,
          templateSectionId: 5,
          structure: {},
          captureAllowed: false,
          uploadAllowed: false
        }
      ]
    },
    {
      id: 6,
      templateVersionId: 2,
      name: "Biometric Verification",
      description: "Take a live selfie to confirm you are the person in the ID document. Make sure you're in a well-lit area and your face is clearly visible.",
      orderIndex: 3,
      sectionType: "biometrics",
      isActive: true,
      createdBy: 1,
      createdByName: "System Admin",
      createdByEmail: "admin@idv.local",
      updatedBy: null,
      updatedByName: null,
      updatedByEmail: null,
      createdAt: "2025-09-22T12:47:34.717199+00:00",
      updatedAt: null,
      fieldMappings: [
        {
          id: 6,
          templateSectionId: 6,
          structure: {},
          captureAllowed: false,
          uploadAllowed: false
        }
      ]
    }
  ],
  invitees: [
    {
      id: 1,
      name: "System Admin",
      email: "admin@idv.local",
      status: "INVITED"
    }
  ]
};
const mockTemplateVersion2Sections = {
  ...mockTemplateVersion,
  versionId: 3,
  sections: [
    {
      ...mockTemplateVersion.sections[0],
      // Personal Information
      id: 7
    },
    {
      ...mockTemplateVersion.sections[2],
      // Biometrics only
      id: 8,
      orderIndex: 2
    }
  ]
};
const mockTemplateVersionDifferentOrder = {
  ...mockTemplateVersion,
  versionId: 4,
  sections: [
    {
      ...mockTemplateVersion.sections[2],
      // Biometrics first
      orderIndex: 1
    },
    {
      ...mockTemplateVersion.sections[0],
      // Personal Info second
      orderIndex: 2
    },
    {
      ...mockTemplateVersion.sections[1],
      // Documents third
      orderIndex: 3
    }
  ]
};
const handleGetTemplateVersionDirect = (req, res) => {
  const { versionId } = req.params;
  if (!versionId || isNaN(Number(versionId))) {
    return res.status(400).json({ error: "Invalid version ID" });
  }
  const id = Number(versionId);
  switch (id) {
    case 1:
      res.json(mockTemplateVersion);
      break;
    case 2:
      res.json(mockTemplateVersion2Sections);
      break;
    case 3:
      res.json(mockTemplateVersionDifferentOrder);
      break;
    default:
      res.json(mockTemplateVersion);
      break;
  }
};
function createServer() {
  const app2 = express__default();
  app2.use(cors());
  app2.use(express__default.json());
  app2.use(express__default.urlencoded({ extended: true }));
  app2.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });
  app2.get("/api/demo", handleDemo);
  app2.get("/api/templates/:id", handleGetTemplate);
  app2.get(
    "/api/templates-link-generation/resolve/:shortCode",
    handleResolveShortCode
  );
  app2.get("/api/links/resolve", (req, res, next) => {
    const shortCode = req.query.shortCode;
    if (!shortCode) {
      return res.status(400).json({ error: "shortCode query parameter is required" });
    }
    const modifiedReq = { ...req, params: { ...req.params, shortCode } };
    handleResolveShortCode(modifiedReq, res);
  });
  app2.get("/api/TemplateVersion/:versionId", handleGetTemplateVersionDirect);
  return app2;
}
const app = createServer();
const port = process.env.PORT || 3e3;
const __dirname = import.meta.dirname;
const distPath = path.join(__dirname, "../spa");
app.use(express.static(distPath));
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  res.sendFile(path.join(distPath, "index.html"));
});
app.listen(port, () => {
  console.log(`🚀 Fusion Starter server running on port ${port}`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
});
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});
process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
//# sourceMappingURL=node-build.mjs.map
