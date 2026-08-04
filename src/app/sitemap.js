import dbConnect from "@/lib/dbConnect";
import Service from "@/models/Service";

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  let serviceUrls = [];

  try {
    await dbConnect();
    const services = await Service.find({ isActive: true }).select("_id slug updatedAt").lean();

    serviceUrls = services.map((service) => ({
      url: `${baseUrl}/services/${service._id || service.slug}`,
      lastModified: service.updatedAt ? new Date(service.updatedAt).toISOString() : new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch (error) {
    console.error("Error generating sitemap services:", error);
  }

  const staticUrls = [
    {
      url: baseUrl,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  return [...staticUrls, ...serviceUrls];
}
