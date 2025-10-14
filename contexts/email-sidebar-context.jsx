"use client";
import React, { createContext, useContext, useState } from "react";

const EmailSidebarContext = createContext(undefined);

export const EmailSidebarProvider = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const openSidebar = () => setIsSidebarOpen(true);
    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <EmailSidebarContext.Provider value={{ isSidebarOpen, openSidebar, closeSidebar }}>
            {children}
        </EmailSidebarContext.Provider>
    );
};

export const useEmailSidebar = () => {
    const context = useContext(EmailSidebarContext);
    if (!context) {
        throw new Error("useEmailSidebar must be used within EmailSidebarProvider");
    }
    return context;
};
