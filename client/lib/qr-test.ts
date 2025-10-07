import QRCode from 'qrcode';

// Simple test function to verify QR code generation works
export async function testQRGeneration() {
  try {
    const testUrl = 'https://example.com/test';
    const qrDataUrl = await QRCode.toDataURL(testUrl, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256,
    });
    
    console.log('QR Code generation test successful:', qrDataUrl.substring(0, 50) + '...');
    return qrDataUrl;
  } catch (error) {
    console.error('QR Code generation test failed:', error);
    throw error;
  }
}