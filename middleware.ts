import { authMiddleware } from "@clerk/nextjs";
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that don't require authentication
const publicRoutes = ["/", "/sign-in", "/sign-up", "/api/stickers"];

const isPublicPath = (path: string) => {
  return publicRoutes.some(
    (publicPath) => path === publicPath || path.startsWith(`${publicPath}/`)
  );
};

// Create middleware handler
export default authMiddleware({
  debug: true,  // Enable debug mode
  publicRoutes,
  beforeAuth: (req: NextRequest) => {
    if (isPublicPath(req.nextUrl.pathname)) {
      return NextResponse.next();
    }
    return null;
  },
  afterAuth: async (auth: { userId: string | null }, req: NextRequest) => {
    // Handle public routes
    if (isPublicPath(req.nextUrl.pathname)) {
      return NextResponse.next();
    }

    // Handle unauthenticated users
    if (!auth.userId) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }

    // ✅ Fetch user data to get the real role
    const user = await clerkClient.users.getUser(auth.userId);
    const role = user.publicMetadata?.role as string | undefined;

    // Special handling for API routes
    if (req.nextUrl.pathname.startsWith("/api/")) {
      // For admin API routes, verify admin role
      if (req.nextUrl.pathname.startsWith("/api/admin/")) {
        if (role !== "admin") {
          console.log("Access denied to admin API route");
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
      }
      // For dealer API routes, verify dealer role
      if (req.nextUrl.pathname.startsWith("/api/dealer/")) {
        if (role !== "dealer") {
          console.log("Access denied to dealer API route");
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
      }
      return NextResponse.next();
    }

    console.log("User role:", role);

    // Handle admin routes
    if (req.nextUrl.pathname.startsWith("/admin")) {
      if (role !== "admin") {
        console.log("Access denied to admin route");
        return NextResponse.redirect(new URL("/", req.url));
      }
      console.log("Access granted to admin route");
      return NextResponse.next();
    }

    // Handle dealer routes
    if (req.nextUrl.pathname.startsWith("/dealer") && role !== "dealer") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Auto-redirect from home → role dashboard
    if (req.nextUrl.pathname === "/") {
      if (role === "admin") {
        return NextResponse.redirect(new URL("/admin", req.url));
      } else if (role === "dealer") {
        return NextResponse.redirect(new URL("/dealer", req.url));
      }
    }

    return NextResponse.next();
  },
});

// Export the Clerk middleware configuration
export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)",
    "/",
    "/(api|auth|admin|dealer)(.*)"],
};