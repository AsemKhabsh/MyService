import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Payment from "@/models/Payment";
import { getAuthTokenFromRequest, verifyToken } from "@/lib/jwt";

export async function GET(req) {
  try {
    const token = getAuthTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    await dbConnect();

    const skip = (page - 1) * limit;

    const [payments, total, totalRevenueResult] = await Promise.all([
      Payment.find()
        .populate("user", "name email avatar")
        .populate({
          path: "request",
          populate: { path: "service", select: "title price category" },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Payment.countDocuments(),
      Payment.aggregate([
        { $match: { status: "Succeeded" } },
        { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
      ]),
    ]);

    const totalRevenue = totalRevenueResult[0]?.totalRevenue || 0;

    return NextResponse.json(
      {
        success: true,
        data: {
          payments,
          totalRevenue,
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
    console.error("GET /api/payments error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
