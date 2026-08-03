import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import RequestModel from "@/models/Request";
import Service from "@/models/Service";
import { RequestCreateSchema } from "@/utils/validation";
import { getAuthTokenFromRequest, verifyToken } from "@/lib/jwt";

export async function GET(req) {
  try {
    const token = getAuthTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    await dbConnect();

    const query = {};
    if (decoded.role !== "admin") {
      query.user = decoded.id;
    }

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      RequestModel.find(query)
        .populate("service", "title slug price image category deliveryTime")
        .populate("user", "name email avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      RequestModel.countDocuments(query),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          requests,
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
    console.error("GET /api/requests error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const token = getAuthTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    const validation = RequestCreateSchema.safeParse(body);

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

    const { serviceId, customerMessage } = validation.data;

    await dbConnect();

    const service = await Service.findById(serviceId);
    if (!service || !service.isActive) {
      return NextResponse.json(
        { success: false, message: "Service not found or unavailable" },
        { status: 404 }
      );
    }

    const newRequest = await RequestModel.create({
      user: decoded.id,
      service: service._id,
      price: service.price,
      customerMessage: customerMessage || "",
      status: "Pending",
      paymentStatus: "Pending",
      statusHistory: [
        {
          status: "Pending",
          note: "Service request submitted by customer",
          updatedBy: decoded.id,
          createdAt: new Date(),
        },
      ],
    });

    const populatedRequest = await RequestModel.findById(newRequest._id)
      .populate("service", "title slug price image category deliveryTime")
      .populate("user", "name email avatar");

    return NextResponse.json(
      {
        success: true,
        message: "Request submitted successfully",
        data: { request: populatedRequest },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/requests error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
