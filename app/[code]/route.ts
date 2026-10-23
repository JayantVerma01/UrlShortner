import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Url } from "@/models/Url";


export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

  try {
    await connectToDatabase();
    const doc = await Url.findOne({ shortCode: code }).lean();
    if (!doc) {
      return NextResponse.json({ success: false, error: "Short link not found." }, { status: 404 });
    }
    // Explicit 302 (temporary) so browsers don't cache the mapping.
    return NextResponse.redirect(doc.originalUrl, 302);
  } catch (err) {
    console.error(`GET /${code} failed:`, err);
    return NextResponse.json(
      { success: false, error: "Something went wrong on our side. Please try again later." },
      { status: 500 },
    );
  }
}
