import { db } from "@/db/client";
import { knowledge_source } from "@/db/schema";
import { isAuthorized } from "@/lib/isAuthorized";
import { summarizeMarkdown } from "@/lib/openAi";
import {
  PdfCorruptError,
  PdfEncryptedError,
  PdfImageOnlyError,
  PdfTooLargeError,
} from "@/lib/pdf/errors";
import { NextRequest, NextResponse } from "next/server";

// Maximum execution time for this API route (Vercel)
export const maxDuration = 300;

// Run this route on the Node.js runtime (required for Buffer, file handling, etc.)
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // ------------------------------------------------------------------
    // 1. Authenticate the user
    // ------------------------------------------------------------------
    const user = await isAuthorized();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Detect the request content type
    const contentType = req.headers.get("content-type") || "";

    // ==================================================================
    // Handle File Uploads (PDF / CSV)
    // ==================================================================
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();

      // Type should always be "upload"
      const type = formData.get("type") as string;

      if (type !== "upload") {
        return NextResponse.json(
          { error: "multipart requires type=upload" },
          { status: 400 }
        );
      }

      // Retrieve uploaded file
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json(
          { error: "No file provided" },
          { status: 400 }
        );
      }

      const fileName = file.name;
      const lower = fileName.toLowerCase();

      // Detect file type using extension and MIME type
      const isPdf =
        lower.endsWith(".pdf") ||
        file.type === "application/pdf";

      const isCsv =
        lower.endsWith(".csv") ||
        file.type === "text/csv";

      // Reject unsupported file formats
      if (!isPdf && !isCsv) {
        return NextResponse.json(
          { error: "Only CSV and PDF files are allowed" },
          { status: 400 }
        );
      }

      // Convert uploaded file into a Node.js Buffer
      const bytes = Buffer.from(await file.arrayBuffer());

      try {
       const summary = await summarizeMarkdown(bytes);

await db.insert(knowledge_source).values({
  user_email: user.email,
  type: "pdf",
  name: file.name,
  status: "active",
  content: summary,
});
      } catch (err) {
        // --------------------------------------------------------------
        // Convert internal PDF processing errors into readable messages
        // --------------------------------------------------------------

        // PDF is password protected
        if (err instanceof PdfEncryptedError) {
          return NextResponse.json(
            {
              error:
                "This PDF is password-protected. Please upload an unlocked version.",
            },
            { status: 400 }
          );
        }

        // PDF exceeds supported page limit
        if (err instanceof PdfTooLargeError) {
          return NextResponse.json(
            {
              error: `PDF has ${err.pageCount} pages. Maximum supported is 30 pages — please split the file.`,
            },
            { status: 400 }
          );
        }

        // PDF contains only images (no selectable text)
        if (err instanceof PdfImageOnlyError) {
          return NextResponse.json(
            {
              error:
                "This PDF appears to be scanned or image-based. We can't extract text from it yet — please upload a text-based PDF.",
            },
            { status: 400 }
          );
        }

        // Corrupted or unreadable PDF
        if (err instanceof PdfCorruptError) {
          return NextResponse.json(
            {
              error:
                "Could not read this PDF. The file may be corrupted.",
            },
            { status: 400 }
          );
        }

        // Unknown error
        throw err;
      }

      return NextResponse.json(
        {
          message: `${isPdf ? "PDF" : "CSV"} uploaded successfully`,
        },
        { status: 200 }
      );
    }

    // ==================================================================
    // Handle JSON Requests (Website / Plain Text)
    // ==================================================================
    const body = await req.json();
    const type = body.type as string;

    // ------------------------------------------------------------------
    // Website ingestion
    // ------------------------------------------------------------------
    if (type === "website") {
      // Scrape website content using Firecrawl
      const res = await fetch("https://api.firecrawl.dev/v2/scrape", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY!}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: body.url,
          formats: ["markdown"],
        }),
      });

      // Expected Firecrawl response
      const json = (await res.json().catch(() => null)) as
        | { success: true; data: { markdown: string } }
        | { success: false; error?: string }
        | null;

      // Handle scraping failures
      if (!res.ok || !json || json.success !== true) {
        return NextResponse.json(
          {
            error: "Firecrawl request failed",
            status: res.status,
            message:
              (json &&
                !json.success &&
                json.error) ||
              "Unknown Firecrawl error",
          },
          { status: 502 }
        );
      }

const summary = await summarizeMarkdown(json.data.markdown);
console.log(summary);

      await db.insert(knowledge_source).values({
        user_email:user.email,
        type:"website",
        name:body.url,
        status:"active",
        source_url:body.url,
        content:summary

      })


      return NextResponse.json(
        { message: "Website added successfully" },
        { status: 200 }
      );
    }

    // ------------------------------------------------------------------
    // Plain text ingestion
    // ------------------------------------------------------------------
    if (type === "text") {
      // Validate required fields
      if (!body.content || !body.title) {
        return NextResponse.json(
          {
            error: "title and content are required",
          },
          { status: 400 }
        );
      }

    const summary = await summarizeMarkdown(body.content);

await db.insert(knowledge_source).values({
  user_email: user.email,
  type: "text",
  name: body.title,
  status: "active",
  content: summary,
});

      return NextResponse.json(
        { message: "Text added successfully" },
        { status: 200 }
      );
    }

    // Unknown request type
    return NextResponse.json(
      { error: "unknown type" },
      { status: 400 }
    );
  } catch (error) {
    // Catch unexpected server errors
    console.error("Error in knowledge store:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}