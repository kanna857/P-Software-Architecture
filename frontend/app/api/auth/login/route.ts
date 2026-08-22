import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Forward credentials to the FastAPI backend
    const backendRes = await fetch("http://127.0.0.1:8000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!backendRes.ok) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const data = await backendRes.json();

    // Set the cookie server-side so the middleware can read it
    const response = NextResponse.json({ success: true });
    response.cookies.set("auth_token", data.token, {
      path: "/",
      maxAge: 86400,       // 24 hours
      httpOnly: false,     // Allow JS to read it too
      sameSite: "lax",     // Works inside iframes & navigations
    });

    return response;
  } catch (err) {
    console.error("Auth proxy error:", err);
    return NextResponse.json({ error: "Login service unavailable" }, { status: 503 });
  }
}
