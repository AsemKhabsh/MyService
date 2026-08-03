import { CheckCircle2, Clock, XCircle, AlertCircle, FileText } from "lucide-react";
import RequestStatusBadge from "./RequestStatusBadge";

export default function RequestTimeline({ history = [] }) {
  if (!history || history.length === 0) {
    return <p className="text-sm text-base-content/60 italic">No timeline history recorded yet.</p>;
  }

  const getIcon = (status) => {
    switch (status) {
      case "Completed":
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case "In Progress":
        return <Clock className="w-5 h-5 text-info animate-pulse" />;
      case "Accepted":
        return <CheckCircle2 className="w-5 h-5 text-primary" />;
      case "Cancelled":
        return <XCircle className="w-5 h-5 text-error" />;
      default:
        return <AlertCircle className="w-5 h-5 text-warning" />;
    }
  };

  return (
    <ul className="timeline timeline-vertical timeline-compact">
      {history.map((item, idx) => (
        <li key={idx}>
          {idx > 0 && <hr className="bg-base-300" />}
          <div className="timeline-middle my-2">
            {getIcon(item.status)}
          </div>
          <div className="timeline-end timeline-box bg-base-100 border border-base-200 shadow-xs p-3 rounded-xl mb-4 w-full">
            <div className="flex items-center justify-between gap-2 mb-1">
              <RequestStatusBadge status={item.status} />
              <span className="text-xs text-base-content/50">
                {new Date(item.createdAt).toLocaleString()}
              </span>
            </div>
            {item.note && (
              <p className="text-xs text-base-content/80 mt-1 leading-relaxed">
                {item.note}
              </p>
            )}
            {item.updatedBy?.name && (
              <div className="text-[10px] text-base-content/40 mt-1 font-medium">
                Updated by: {item.updatedBy.name} ({item.updatedBy.role})
              </div>
            )}
          </div>
          {idx < history.length - 1 && <hr className="bg-base-300" />}
        </li>
      ))}
    </ul>
  );
}
