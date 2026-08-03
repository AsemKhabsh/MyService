import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import RequestModel from "@/models/Request";
import { getAuthTokenFromRequest, verifyToken } from "@/lib/jwt";
import { RequestUpdateSchema } from "@/utils/validation";

export async function GET(req, { params }) {
  try {
    const token = getAuthTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    const requestItem = await RequestModel.findById(id)
      .populate("service")
      .populate("user", "name email avatar phone country")
      .populate("statusHistory.updatedBy", "name role");

    if (!requestItem) {
      return NextResponse.json({ success: false, message: "Request not found" }, { status: 404 });
    }

    // Access control: User can view their own requests, admin can view all
    if (decoded.role !== "admin" && requestItem.user._id.toString() !== decoded.id) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      { success: true, data: { request: requestItem } },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/requests/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req, { params }) {
  try {
    const token = getAuthTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const validation = RequestUpdateSchema.safeParse(body);

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

    const existingRequest = await RequestModel.findById(id);
    if (!existingRequest) {
      return NextResponse.json({ success: false, message: "Request not found" }, { status: 404 });
    }

    const { status, paymentStatus, adminNotes, note } = validation.data;

    // Normal users can only cancel their own pending requests
    if (decoded.role !== "admin") {
      if (existingRequest.user.toString() !== decoded.id) {
        return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
      }

      if (status === "Cancelled" && existingRequest.status === "Pending") {
        existingRequest.status = "Cancelled";
        existingRequest.statusHistory.push({
          status: "Cancelled",
          note: note || "Cancelled by customer",
          updatedBy: decoded.id,
          createdAt: new Date(),
        });
        await existingRequest.save();

        return NextResponse.json(
          {
            success: true,
            message: "Request cancelled successfully",
            data: { request: existingRequest },
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { success: false, message: "You are only permitted to cancel pending requests" },
        { status: 403 }
      );
    }

    // Admin updates
    if (status && status !== existingRequest.status) {
      existingRequest.status = status;
      existingRequest.statusHistory.push({
        status: status,
        note: note || `Status updated to ${status}`,
        updatedBy: decoded.id,
        createdAt: new Date(),
      });
    }

    if (paymentStatus) {
      existingRequest.paymentStatus = paymentStatus;
    }

    if (adminNotes !== undefined) {
      existingRequest.adminNotes = adminNotes;
    }

    await existingRequest.save();

    const updated = await RequestModel.findById(id)
      .populate("service")
      .populate("user", "name email avatar")
      .populate("statusHistory.updatedBy", "name role");

    return NextResponse.json(
      {
        success: true,
        message: "Request updated successfully",
        data: { request: updated },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH /api/requests/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
