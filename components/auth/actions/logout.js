"use server";

import { cookies } from "next/headers";


export async function doLogout() {
  try {
    const cookieStore = await cookies(); 

    cookieStore.delete("authjs.session-token"); 

    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { error: "Logout failed. Please try again." };
  }
}
