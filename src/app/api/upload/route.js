import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { getAuthTokenFromRequest, verifyToken } from "@/lib/jwt";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

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

    const formData = await req.formData();
    const file = formData.get("file");
    const folder = formData.get("folder") || "myservices";

    if (!file) {
      return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid file type. Only JPEG, PNG, WEBP, and GIF images are allowed.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "File size exceeds 5MB limit.",
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `myservices/${folder}`,
          resource_type: "image",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json(
      {
        success: true,
        message: "File uploaded successfully",
        data: {
          url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      { success: false, message: "Upload failed: " + error.message },
      { status: 500 }
    );
  }
}
