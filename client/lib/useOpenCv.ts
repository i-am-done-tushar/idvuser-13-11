// helper: src/lib/useOpenCv.ts
import { useEffect, useState } from "react";

export function useOpenCv(src = "https://docs.opencv.org/4.x/opencv.js") {
  const [cvRef, setCvRef] = useState<any | null>(null);
  useEffect(() => {
    let script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => setCvRef((window as any).cv ?? null);
    script.onerror = () => setCvRef(null);
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, [src]);
  return cvRef;
}
