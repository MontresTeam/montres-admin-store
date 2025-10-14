"use client";


import { AppSidebar } from "@/components/app-sidebar";
import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import ThemeCustomizer from "@/components/theme-customizer/theme-customizer";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";

export function ClientRoot({
  defaultOpen,
  children,
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <main className="grow-[1] flex flex-col">
          <SidebarInset>
            <Header />
          </SidebarInset>
          <div className="bg-neutral-100 dark:bg-[#1e2734] md:p-6 p-4 flex-1">
            {children}
          </div>
          <Footer />
        </main>
        <ThemeCustomizer />
        <Toaster position="top-center" reverseOrder={false} />
      </SidebarProvider>
    </ThemeProvider>
  );
}
