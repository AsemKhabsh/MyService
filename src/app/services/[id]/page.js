"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import ServiceCard from "@/components/ServiceCard";
import { Clock, RefreshCw, CheckCircle2, ShoppingCart, ArrowLeft, Star, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const id = params?.id || params?.slug;

  const [service, setService] = useState(null);
  const [relatedServices, setRelatedServices] = useState([]);
  const [activeImage, setActiveImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [customerMessage, setCustomerMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchServiceDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/services/${id}`);
      const data = await res.json();

      if (data.success && data.data?.service) {
        const s = data.data.service;
        setService(s);
        setActiveImage(s.image);

        // Fetch related services by category
        if (s.category) {
          const relRes = await fetch(`/api/services?category=${encodeURIComponent(s.category)}&limit=4`);
          const relData = await relRes.json();
          if (relData.success && relData.data?.services) {
            setRelatedServices(relData.data.services.filter((item) => item._id !== s._id));
          }
        }
      } else {
        setService(null);
      }
    } catch (error) {
      console.error("Failed to load service detail:", error);
      setService(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchServiceDetail();
  }, [fetchServiceDetail]);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to order this service");
      router.push(`/login?callbackUrl=/services/${id}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service._id,
          customerMessage,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to submit request");
      }

      toast.success("Request submitted successfully!");
      setModalOpen(false);
      router.push("/dashboard/requests");
    } catch (error) {
      toast.error(error.message || "Failed to order service");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-base-content/60">Loading service details...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-error mx-auto" />
        <h2 className="text-2xl font-bold">Service Not Found</h2>
        <p className="text-sm text-base-content/60">The service you are looking for does not exist or has been removed.</p>
        <Link href="/services" className="btn btn-primary btn-sm">
          Browse All Services
        </Link>
      </div>
    );
  }

  const galleryImages = [service.image, ...(service.gallery || [])].filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      {/* Back Button */}
      <div>
        <Link href="/services" className="btn btn-ghost btn-sm gap-2 text-base-content/70">
          <ArrowLeft className="w-4 h-4" /> Back to Services
        </Link>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Gallery & Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Display Image */}
          <div className="space-y-4">
            <div className="relative h-96 w-full rounded-2xl overflow-hidden bg-base-200 border border-base-300 shadow-sm">
              <img src={activeImage} alt={service.title} className="w-full h-full object-cover" />
              {service.isFeatured && (
                <div className="absolute top-4 left-4 bg-secondary text-secondary-content text-xs font-bold px-3 py-1 rounded-full shadow flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-current" /> Featured Service
                </div>
              )}
            </div>

            {/* Gallery Thumbnails */}
            {galleryImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {galleryImages.map((imgUrl, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(imgUrl)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      activeImage === imgUrl ? "border-primary scale-95" : "border-base-300 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Description */}
          <div className="space-y-4">
            <div className="badge badge-primary badge-outline text-xs font-semibold">
              {service.category}
            </div>
            <h1 className="text-3xl font-extrabold text-base-content leading-tight">
              {service.title}
            </h1>

            <div className="prose max-w-none text-base-content/80 text-sm sm:text-base leading-relaxed whitespace-pre-line border-t border-base-200 pt-6">
              {service.description}
            </div>
          </div>

          {/* Features Included */}
          {service.features?.length > 0 && (
            <div className="bg-base-200/60 rounded-2xl p-6 space-y-4 border border-base-300">
              <h3 className="font-bold text-base text-base-content">Features & Deliverables Included</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {service.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-base-content/80">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Order Card Sidebar */}
        <div>
          <div className="sticky top-24 bg-base-100 border border-base-300 rounded-2xl p-6 shadow-md space-y-6">
            <div className="flex items-baseline justify-between border-b border-base-200 pb-4">
              <span className="text-sm font-semibold text-base-content/60">Service Price</span>
              <span className="text-3xl font-extrabold text-primary">${service.price}</span>
            </div>

            <p className="text-xs text-base-content/70 leading-relaxed">
              {service.shortDescription}
            </p>

            <div className="space-y-3 border-y border-base-200 py-4 text-xs font-medium text-base-content/80">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" /> Delivery Time
                </span>
                <span className="font-bold">{service.deliveryTime} Day(s)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-secondary" /> Revisions
                </span>
                <span className="font-bold">{service.revisions} Included</span>
              </div>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="btn btn-primary w-full shadow-md font-bold gap-2 text-base"
            >
              <ShoppingCart className="w-5 h-5" /> Request Service Now
            </button>

            {/* Seller Details */}
            {service.createdBy && (
              <div className="flex items-center gap-3 pt-2 text-xs text-base-content/60">
                <div className="w-8 h-8 rounded-full bg-base-200 overflow-hidden shrink-0">
                  <img src={service.createdBy.avatar || "https://res.cloudinary.com/demo/image/upload/v1571218039/sample.jpg"} alt={service.createdBy.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-semibold text-base-content">{service.createdBy.name}</p>
                  <p className="text-[10px]">Verified Service Provider</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Modal */}
      {modalOpen && (
        <div className="modal modal-open">
          <div className="modal-box rounded-2xl max-w-lg">
            <h3 className="font-bold text-lg text-base-content mb-2">Order Service: {service.title}</h3>
            <p className="text-xs text-base-content/60 mb-4">
              Total Amount: <span className="font-bold text-primary">${service.price}</span>
            </p>

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="label text-xs font-semibold">Special Instructions or Requirements for Provider</label>
                <textarea
                  value={customerMessage}
                  onChange={(e) => setCustomerMessage(e.target.value)}
                  placeholder="Describe any specific requirements, preferences, or details for your order..."
                  className="textarea textarea-bordered w-full text-sm h-32 focus:outline-none"
                ></textarea>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn btn-ghost btn-sm"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Confirm & Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Related Services */}
      {relatedServices.length > 0 && (
        <div className="border-t border-base-200 pt-12 space-y-6">
          <h2 className="text-xl font-bold text-base-content">Related Services in {service.category}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedServices.map((rel) => (
              <ServiceCard key={rel._id} service={rel} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
