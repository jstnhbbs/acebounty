export { auth as middleware } from "@/auth";

export const config = {
  matcher: ["/admin/:path*", "/api/videos", "/api/videos/:path*", "/login"],
};
