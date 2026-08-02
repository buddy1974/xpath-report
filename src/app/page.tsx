import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function RootPage() {
  const session = await auth();
  const totpVerified = (session as any)?.totpVerified === true;

  if (session?.user && totpVerified) redirect("/dashboard");
  if (session?.user) redirect("/verify");
  redirect("/sign-in");
}
