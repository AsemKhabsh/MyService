import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Service from "@/models/Service";
import { ServiceSchema } from "@/utils/validation";
import { getAuthTokenFromRequest, verifyToken } from "@/lib/jwt";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    await dbConnect();

    let service = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      service = await Service.findById(id).populate("createdBy", "name avatar email");
    }

    if (!service) {
      service = await Service.findOne({ slug: id }).populate("createdBy", "name avatar email");
    }

    if (!service) {
      return NextResponse.json(
        { success: false, message: "Service not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: { service } },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/services/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const token = getAuthTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    await dbConnect();

    let service = await Service.findById(id);
    if (!service) {
      return NextResponse.json({ success: false, message: "Service not found" }, { status: 404 });
    }

    const updatedService = await Service.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Service updated successfully",
        data: { service: updatedService },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT /api/services/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const token = getAuthTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    await dbConnect();

    const service = await Service.findByIdAndDelete(id);
    if (!service) {
      return NextResponse.json({ success: false, message: "Service not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: "Service deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/services/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
