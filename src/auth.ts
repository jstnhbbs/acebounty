import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = process.env.ADMIN_EMAIL;
        const password = process.env.ADMIN_PASSWORD;
        if (!email || !password) {
          return null;
        }
        if (
          credentials?.email === email &&
          credentials?.password === password
        ) {
          return { id: "admin", email, name: "Admin" };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const path = request.nextUrl.pathname;
      const method = request.method;
      const isAdmin = path.startsWith("/admin");
      const isVideosApi =
        path === "/api/videos" || /^\/api\/videos\/[^/]+$/.test(path);
      const isWrite = method === "POST" || method === "PATCH" || method === "DELETE";
      if (isAdmin && !isLoggedIn) return false;
      if (isVideosApi && isWrite && !isLoggedIn) return false;
      return true;
    },
  },
});
