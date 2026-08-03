export default function RequestStatusBadge({ status }) {
  let badgeClass = "badge-ghost";

  switch (status) {
    case "Completed":
      badgeClass = "badge-success text-white";
      break;
    case "In Progress":
      badgeClass = "badge-info text-white";
      break;
    case "Accepted":
      badgeClass = "badge-primary";
      break;
    case "Cancelled":
      badgeClass = "badge-error text-white";
      break;
    case "Pending":
      badgeClass = "badge-warning text-white";
      break;
    case "Paid":
      badgeClass = "badge-success text-white";
      break;
    default:
      badgeClass = "badge-ghost";
  }

  return (
    <span className={`badge badge-sm font-semibold py-2 px-2.5 ${badgeClass}`}>
      {status}
    </span>
  );
}
