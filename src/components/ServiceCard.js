import Link from "next/link";
import { Clock, RefreshCw, Star, Tag } from "lucide-react";

export default function ServiceCard({ service }) {
  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group">
      {/* Image Container */}
      <figure className="relative h-48 w-full overflow-hidden bg-base-200">
        <img
          src={service.image || "https://res.cloudinary.com/demo/image/upload/v1571218039/sample.jpg"}
          alt={service.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {service.isFeatured && (
          <div className="absolute top-3 left-3 bg-secondary text-secondary-content text-xs font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" /> Featured
          </div>
        )}
        <div className="absolute bottom-3 right-3 bg-base-100/90 backdrop-blur-sm text-base-content text-xs font-semibold px-2.5 py-1 rounded-lg shadow">
          {service.category}
        </div>
      </figure>

      {/* Card Content */}
      <div className="card-body p-5 flex flex-col justify-between flex-1">
        <div>
          <h3 className="card-title text-base font-bold text-base-content line-clamp-1 group-hover:text-primary transition-colors">
            <Link href={`/services/${service.slug}`}>
              {service.title}
            </Link>
          </h3>
          <p className="text-xs text-base-content/70 line-clamp-2 mt-2 leading-relaxed">
            {service.shortDescription}
          </p>
        </div>

        {/* Specs & Pricing Footer */}
        <div className="border-t border-base-200 pt-4 mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-base-content/60">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {service.deliveryTime}d
            </span>
            <span className="flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5" /> {service.revisions} rev
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs text-base-content/50 block">Starting at</span>
            <span className="text-lg font-extrabold text-primary">${service.price}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
