import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 my-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="btn btn-outline btn-sm"
      >
        <ChevronLeft className="w-4 h-4" /> Previous
      </button>

      <span className="text-xs font-semibold px-3 text-base-content/70">
        Page {page} of {totalPages}
      </span>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="btn btn-outline btn-sm"
      >
        Next <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
