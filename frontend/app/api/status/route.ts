import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../db/dbConnect";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    return NextResponse.json(
      { message: "successfully connected to DB" },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
