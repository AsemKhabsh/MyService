import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center space-y-6">
      <div className="w-20 h-20 rounded-full bg-error/10 text-error flex items-center justify-center">
        <FileQuestion className="w-10 h-10" />
      </div>
      <h1 className="text-4xl font-extrabold text-base-content">404 — Page Not Found</h1>
      <p className="text-sm text-base-content/60 max-w-md mx-auto">
        The page or service resource you requested could not be found or may have been moved.
      </p>
      <Link href="/" className="btn btn-primary btn-sm gap-2 font-semibold shadow">
        <ArrowLeft className="w-4 h-4" /> Return to Home
      </Link>
    </div>
  );
}
