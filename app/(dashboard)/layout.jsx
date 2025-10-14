import { cookies } from "next/headers";

// import { auth } from "@/auth";
import { SessionProvider } from "next-auth/react";
import { ClientRoot } from "../client-root";

export default async function DashboardLayout({
  children,
}) {
  try {
    const cookieStore = await cookies();
    const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

    // const session = await auth();

    return (
      <SessionProvider session={null}> 
      {/* <SessionProvider session={session}> */}
        <ClientRoot defaultOpen={defaultOpen}>{children}</ClientRoot>
      </SessionProvider>
    );
  } catch (error) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">Something went wrong!</h2>
        <p className="text-muted-foreground">We couldn't load the layout. Please try again later.</p>
      </div>
    );
  }
}
