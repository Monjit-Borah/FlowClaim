import React from "react";
import Script from "next/script";

export function SplineBackground() {
  return (
    <>
      <Script
        type="module"
        src="https://unpkg.com/@splinetool/viewer@1.12.73/build/spline-viewer.js"
        strategy="afterInteractive"
      />
      <div className="fixed inset-0 z-0 overflow-hidden">
        {React.createElement("spline-viewer", {
          id: "logo",
          class: "block h-full w-full scale-[1.08]",
          url: "https://prod.spline.design/JMoqbh3mSTLAvW8N/scene.splinecode"
        })}
      </div>
    </>
  );
}
