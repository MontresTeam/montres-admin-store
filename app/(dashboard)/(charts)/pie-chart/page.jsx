"use client"
import React,{useState,useEffect} from 'react';
import DefaultCardComponent from "@/app/(dashboard)/components/default-card-component";
import BasicPieChart from "@/components/charts/basic-pie-chart";
import DonutChart from "@/components/charts/donut-chart";
import MultipleSeriesChart from "@/components/charts/multiple-series-chart";
import RadarChart from "@/components/charts/radar-chart";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import LoadingSkeleton from "@/components/loading-skeleton";
import { Metadata } from "next";
import { Suspense } from "react";
import { useRouter } from "next/navigation";

const metadata = {
    title: "Pie Charts & Data Visualization | Monters Admin Dashboard",
    description:
        "Explore various interactive chart components for analytics and data visualization in the Monters Admin Dashboard template built with Next.js and Tailwind CSS.",
};

const PieChartPage = () => {
  const router = useRouter();

        const [isAllowed, setIsAllowed] = useState(false);
      const [checked, setChecked] = useState(false); // to prevent flash
    
      useEffect(() => {
        // Get adminData from localStorage
        const adminDataJSON = localStorage.getItem("adminData");
        const adminData = adminDataJSON ? JSON.parse(adminDataJSON) : null;
    
        // Allowed roles
        const allowedRoles = ["ceo", "sales", "developer"];
    
        if (!adminData || !allowedRoles.includes(adminData.role)) {
          router.replace("/admin/login"); // redirect unauthorized users
        } else {
          setIsAllowed(true); // user is allowed
        }
    
        setChecked(true); // check complete
      }, [router]);
    
      // Prevent page from rendering until check is done
      if (!checked) return null;
      if (!isAllowed) return null;
    
    return (
        <>
            <DashboardBreadcrumb title="Pie Chart" text="Pie Chart" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <DefaultCardComponent title="Basic Pie Chart">
                    <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
                        <BasicPieChart />
                    </Suspense>
                </DefaultCardComponent>

                <DefaultCardComponent title="Donut Chart">
                    <div className="text-center flex flex-wrap items-start gap-5 justify-center">
                        <div className="relative">
                            <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
                                <DonutChart />
                            </Suspense>
                            <div className="absolute start-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                                <span className="text-lg text-secondary-light font-medium">Total Value</span>
                                <h4 className="mb-0">72</h4>
                            </div>
                        </div>

                        <div className="max-w-[290px] w-full">
                            <div className="flex items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-600 pb-3 mb-3">
                                <span className="text-neutral-600 dark:text-neutral-200 font-medium text-sm">Label</span>
                                <span className="text-neutral-600 dark:text-neutral-200 font-medium text-sm">Value</span>
                                <span className="text-neutral-600 dark:text-neutral-200 font-medium text-sm">%</span>
                            </div>
                            <div className="flex items-center justify-between gap-3 mb-3">
                                <span className="text-neutral-600 dark:text-neutral-200 font-medium text-sm flex items-center gap-3">
                                    <span className="w-3 h-3 bg-green-600 rounded-full"></span> Label 1
                                </span>
                                <span className="text-neutral-600 dark:text-neutral-200 font-medium text-sm">12</span>
                                <span className="text-neutral-600 dark:text-neutral-200 font-medium text-sm"> 30.6% </span>
                            </div>
                            <div className="flex items-center justify-between gap-3 mb-3">
                                <span className="text-neutral-600 dark:text-neutral-200 font-medium text-sm flex items-center gap-3">
                                    <span className="w-3 h-3 bg-primary rounded-full"></span> Label 2
                                </span>
                                <span className="text-neutral-600 dark:text-neutral-200 font-medium text-sm">22</span>
                                <span className="text-neutral-600 dark:text-neutral-200 font-medium text-sm">  42.9%</span>
                            </div>
                            <div className="flex items-center justify-between gap-3 mb-3">
                                <span className="text-neutral-600 dark:text-neutral-200 font-medium text-sm flex items-center gap-3">
                                    <span className="w-3 h-3 bg-cyan-600 rounded-full"></span> Label 3
                                </span>
                                <span className="text-neutral-600 dark:text-neutral-200 font-medium text-sm">12</span>
                                <span className="text-neutral-600 dark:text-neutral-200 font-medium text-sm"> 24.6% </span>
                            </div>
                            <div className="flex items-center justify-between gap-3 mb-3">
                                <span className="text-neutral-600 dark:text-neutral-200 font-medium text-sm flex items-center gap-3">
                                    <span className="w-3 h-3 bg-red-600 rounded-full"></span> Label 4
                                </span>
                                <span className="text-neutral-600 dark:text-neutral-200 font-medium text-sm">12</span>
                                <span className="text-neutral-600 dark:text-neutral-200 font-medium text-sm"> 26.6% </span>
                            </div>
                            <div className="flex items-center justify-between gap-3 mb-3">
                                <span className="text-neutral-600 dark:text-neutral-200 font-medium text-sm flex items-center gap-3">
                                    <span className="w-3 h-3 bg-orange-500 rounded-full"></span> Label 5
                                </span>
                                <span className="text-neutral-600 dark:text-neutral-200 font-medium text-sm">7</span>
                                <span className="text-neutral-600 dark:text-neutral-200 font-medium text-sm"> 13.3% </span>
                            </div>
                            <div className="flex items-center justify-between gap-3 mb-3">
                                <span className="text-neutral-600 dark:text-neutral-200 font-medium text-sm flex items-center gap-3">
                                    <span className="w-3 h-3 bg-yellow-600 rounded-full"></span> Label 6
                                </span>
                                <span className="text-neutral-600 dark:text-neutral-200 font-medium text-sm">7</span>
                                <span className="text-neutral-600 dark:text-neutral-200 font-medium text-sm"> 15.3% </span>
                            </div>
                        </div>
                    </div>
                </DefaultCardComponent>

                <DefaultCardComponent title="Radar Chart">
                    <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
                        <RadarChart />
                    </Suspense>
                </DefaultCardComponent>

                <DefaultCardComponent title="Multiple series">
                    <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
                        <MultipleSeriesChart />
                    </Suspense>
                </DefaultCardComponent>

            </div>
        </>
    );
};
export default PieChartPage;
