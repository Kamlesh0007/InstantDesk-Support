import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const result = await sql`SELECT NOW()`;

    return Response.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("NEON ERROR:", error);

    return Response.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}