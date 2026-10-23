import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { generateShortCode, isDuplicateKeyError, validateUrl } from "@/lib/url";
import { Url } from "@/models/Url";


const MAX_ATTEMPTS = 5;

function fail(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Request body must be valid JSON.", 400);
  }

  const result = validateUrl((body as { url?: unknown } | null)?.url);
  if (!result.ok) return fail(result.error, 400);

  try {
    await connectToDatabase();

    // Insert and rely on the unique index; on a duplicate-key error pick a
    // new code. No check-then-insert race.
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const shortCode = generateShortCode();
      try {
        await Url.create({ originalUrl: result.url, shortCode });
        return NextResponse.json(
          {
            success: true,
            originalUrl: result.url,
            shortCode,
            shortUrl: `${new URL(request.url).origin}/${shortCode}`,
          },
          { status: 201 },
        );
      } catch (err) {
        if (!isDuplicateKeyError(err)) throw err;
      }
    }
    console.error("Could not generate a unique short code after retries");
    return fail("Could not generate a unique short code. Please try again.", 500);
  } catch (err) {
    console.error("POST /api/shorten failed:", err);
    return fail("Something went wrong on our side. Please try again later.", 500);
  }
}
