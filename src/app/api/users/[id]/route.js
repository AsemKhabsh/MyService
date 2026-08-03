import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { getAuthTokenFromRequest, verifyToken } from "@/lib/jwt";

export async function GET(req, { params }) {
  try {
    const token = getAuthTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    const { id } = await params;

    if (decoded.role !== "admin" && decoded.id !== id) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const user = await User.findById(id).select("-password");

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { user } }, { status: 200 });
  } catch (error) {
    console.error("GET /api/users/[id] error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const token = getAuthTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    const { id } = await params;
    const body = await req.json();

    await dbConnect();

    // Normal users can update their own profile details (name, phone, country, avatar)
    if (decoded.role !== "admin") {
      if (decoded.id !== id) {
        return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
      }

      const allowedFields = ["name", "phone", "country", "avatar"];
      const updates = {};
      Object.keys(body).forEach((key) => {
        if (allowedFields.includes(key)) {
          updates[key] = body[key];
        }
      });

      const updatedUser = await User.findByIdAndUpdate(id, { $set: updates }, { new: true }).select("-password");
      return NextResponse.json({ success: true, message: "Profile updated successfully", data: { user: updatedUser } });
    }

    // Admin updates (role, isActive, etc.)
    const updatedUser = await User.findByIdAndUpdate(id, { $set: body }, { new: true }).select("-password");
    if (!updatedUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "User updated successfully", data: { user: updatedUser } });
  } catch (error) {
    console.error("PATCH /api/users/[id] error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
