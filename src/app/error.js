"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("Unhandled runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center space-y-6">
      <div className="w-20 h-20 rounded-full bg-warning/10 text-warning flex items-center justify-center">
        <AlertTriangle className="w-10 h-10" />
      </div>
      <h1 className="text-3xl font-extrabold text-base-content">Something went wrong!</h1>
      <p className="text-sm text-base-content/60 max-w-md mx-auto">
        An unhandled exception occurred while rendering this page.
      </p>
      <button onClick={() => reset()} className="btn btn-primary btn-sm gap-2 font-semibold shadow">
        <RefreshCw className="w-4 h-4" /> Try Again
      </button>
    </div>
  );
}
