import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Service from "@/models/Service";
import { ServiceSchema } from "@/utils/validation";
import { getAuthTokenFromRequest, verifyToken } from "@/lib/jwt";
import User from "@/models/User";

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

// GET /api/services - Public list with search, filter, sort, pagination
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const isFeatured = searchParams.get("isFeatured");
    const sort = searchParams.get("sort") || "newest"; // newest, oldest, price_asc, price_desc
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "9", 10);
    const includeInactive = searchParams.get("includeInactive") === "true";

    await dbConnect();

    const query = {};

    if (!includeInactive) {
      query.isActive = true;
    }

    if (category) {
      query.category = category;
    }

    if (isFeatured === "true") {
      query.isFeatured = true;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { shortDescription: { $regex: search, $options: "i" } },
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortOptions = { createdAt: -1 };
    if (sort === "oldest") sortOptions = { createdAt: 1 };
    if (sort === "price_asc") sortOptions = { price: 1 };
    if (sort === "price_desc") sortOptions = { price: -1 };
    if (sort === "title_asc") sortOptions = { title: 1 };

    const skip = (page - 1) * limit;

    const [services, total] = await Promise.all([
      Service.find(query)
        .populate("createdBy", "name avatar email")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Service.countDocuments(query),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          services,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit) || 1,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/services error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch services" },
      { status: 500 }
    );
  }
}

// POST /api/services - Admin only create service
export async function POST(req) {
  try {
    const token = getAuthTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const validation = ServiceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    await dbConnect();

    let baseSlug = slugify(validation.data.title);
    let uniqueSlug = baseSlug;
    let counter = 1;

    while (await Service.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const newService = await Service.create({
      ...validation.data,
      slug: uniqueSlug,
      createdBy: decoded.id,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Service created successfully",
        data: { service: newService },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/services error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
