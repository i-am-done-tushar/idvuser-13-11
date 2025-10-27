import QRCode from 'qrcode';

export interface QRCodeOptions {
  shortCode: string;
  templateVersionId?: number;
  userId?: number;
  sessionId?: string;
  currentStep?: string;
}

/**
 * Generate a QR code data URL for continuing verification on another device
 */
export async function generateQRCodeDataURL(options: QRCodeOptions): Promise<string> {
  try {
    // Use environment variable for base URL or fallback to window.location.origin
    const envBaseUrl = import.meta.env.VITE_QR_BASE_URL || import.meta.env.VITE_FRONTEND_URL;
    const baseUrl = envBaseUrl || window.location.origin;
    // Build verification URL using query parameter for shortcode to avoid long path segment limits
    // /form?code={shortCode}
    const baseFormPath = `${baseUrl}/form`;

    const urlParams = new URLSearchParams();
    // Put shortcode as first param
    urlParams.set('code', options.shortCode);
    if (options.templateVersionId) {
      urlParams.set('templateVersionId', options.templateVersionId.toString());
    }
    if (options.userId) {
      urlParams.set('userId', options.userId.toString());
    }
    if (options.sessionId) {
      urlParams.set('sessionId', options.sessionId);
    }
    if (options.currentStep) {
      urlParams.set('step', options.currentStep);
    }

    const finalUrl = `${baseFormPath}?${urlParams.toString()}`;

    // Generate QR code with options for better mobile scanning
    const qrCodeDataUrl = await QRCode.toDataURL(finalUrl, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256,
    });

    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Extract session information from URL parameters
 */
export function extractSessionFromURL(): Partial<QRCodeOptions> {
  const urlParams = new URLSearchParams(window.location.search);
  
  return {
    templateVersionId: urlParams.get('templateVersionId') ? 
      parseInt(urlParams.get('templateVersionId')!) : undefined,
    userId: urlParams.get('userId') ? 
      parseInt(urlParams.get('userId')!) : undefined,
    sessionId: urlParams.get('sessionId') || undefined,
    currentStep: urlParams.get('step') || undefined,
  };
}