// Basic global declaration so TypeScript doesn't complain.
// For richer typings you can install community type stubs or expand this file.

declare global {
  interface Window {
    cv: any;
    __cvReady?: boolean;
    Module?: any;
    __opencvLoad?: any;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  var cv: any;
}

export {};