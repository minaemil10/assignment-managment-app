import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    role?: "STUDENT" | "COORDINATOR" | "ADMIN";
    user: {
      id: string;
      role: "STUDENT" | "COORDINATOR" | "ADMIN";
    } & DefaultSession["user"];
  }
}
