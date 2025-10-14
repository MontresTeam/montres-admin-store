"use client";

import { createContext, ReactNode, useContext, useState } from "react";
import { EmailSidebarProvider } from "./email-sidebar-context";



const LoadingContext = createContext(undefined);

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      <EmailSidebarProvider>
        {children}
      </EmailSidebarProvider>
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};
