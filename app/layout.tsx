import type { Metadata } from "next";

import "@/app/globals.css";
import { SplineBackground } from "@/components/layout/spline-background";

export const metadata: Metadata = {
  title: "ClaimFlow AI",
  description: "Premium intelligent reimbursement management operating system"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SplineBackground />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
