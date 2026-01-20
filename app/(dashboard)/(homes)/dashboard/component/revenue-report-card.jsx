"use client"
import StatsCard from "@/app/(dashboard)/(homes)/dashboard/component/stats-card";
import GenerateContentChart from "@/components/charts/generate-content-chart";
import CustomSelect from "@/components/shared/custom-select";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

const RevenueReportCard = () => {
  // UAE Dirham currency configuration
  const currencyConfig = {
    symbol: "AED",
    locale: "ar-AE",
    startingBalance: 0,
    format: (amount) => {
      return new Intl.NumberFormat("ar-AE", {
        style: "currency",
        currency: "AED",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    },
  };

  // Initial revenue data for Montres Trading L.L.C (starting from zero)
  const revenueData = {
    earning: 0,
    expense: 0,
    netRevenue: 0,
    growth: 0,
    previousPeriod: {
      earning: 0,
      expense: 0,
    },
  };

  // Stats data for the company
  const companyStats = [
    {
      title: "Total Revenue",
      value: currencyConfig.format(revenueData.earning),
      description: "Starting revenue",
      trend: 0,
    },
    {
      title: "Net Profit",
      value: currencyConfig.format(revenueData.netRevenue),
      description: "After expenses",
      trend: 0,
    },
    {
      title: "Operating Expenses",
      value: currencyConfig.format(revenueData.expense),
      description: "Monthly costs",
      trend: 0,
    },
    {
      title: "Growth Rate",
      value: `${revenueData.growth}%`,
      description: "Since inception",
      trend: 0,
    },
  ];

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
    <Card className="card rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden bg-white dark:bg-neutral-900">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 xl:grid-cols-12">
          {/* Left Column: Chart & Summary */}
          <div className="xl:col-span-7 2xl:col-span-8 border-b xl:border-b-0">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h6 className="font-bold text-xl text-neutral-900 dark:text-white">Revenue Report</h6>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    Montres Trading L.L.C - UAE
                  </p>
                </div>
                <div className="w-full sm:w-auto">
                  <CustomSelect
                    placeholder="Yearly"
                    options={["Yearly", "Monthly", "Weekly", "Today"]}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Revenue Summary Box */}
              <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-5 border border-neutral-100 dark:border-neutral-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
                  {/* Divider for mobile/desktop */}
                  <div className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-12 bg-neutral-200 dark:bg-neutral-700"></div>

                  <div className="text-center sm:text-left sm:pl-4">
                    <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                      Starting Balance
                    </p>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
                      {currencyConfig.format(currencyConfig.startingBalance)}
                    </p>
                  </div>
                  <div className="text-center sm:text-right sm:pr-4">
                    <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                      Current Currency
                    </p>
                    <div className="flex items-center justify-center sm:justify-end gap-2">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 tracking-tight">
                        AED <span className="text-lg font-normal text-neutral-400 ml-1">Example</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-6 mt-6">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                  <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                    Earning:
                    <span className="font-bold text-neutral-900 dark:text-white ml-2">
                      {currencyConfig.format(revenueData.earning)}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                  <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                    Expense:
                    <span className="font-bold text-neutral-900 dark:text-white ml-2">
                      {currencyConfig.format(revenueData.expense)}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                    Net:
                    <span className="font-bold text-neutral-900 dark:text-white ml-2">
                      {currencyConfig.format(revenueData.netRevenue)}
                    </span>
                  </span>
                </div>
              </div>

              <div className="mt-8">
                <div className="-ml-2">
                  <GenerateContentChart />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Stats Grid */}
          <div className="xl:col-span-5 2xl:col-span-4 bg-neutral-50/50 dark:bg-neutral-900/50 xl:border-l border-neutral-200 dark:border-neutral-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1">
              {/* Custom Stats Cards */}
              {companyStats.map((stat, index) => (
                <div
                  key={index}
                  className="p-5 sm:p-6 border-b border-neutral-200 dark:border-neutral-800 last:border-0 sm:last:border-r xl:last:border-r-0 sm:nth-[-2]:border-b-0 xl:nth-[-2]:border-b hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-2 tracking-tight">{stat.value}</p>

                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full ${stat.trend > 0
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : stat.trend < 0
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                        }`}
                    >
                      {stat.trend > 0 ? `+${stat.trend}%` : `${stat.trend}%`}
                    </span>
                    <span className="text-xs text-neutral-400 dark:text-neutral-500">
                      {stat.description}
                    </span>
                  </div>
                </div>
              ))}

              {/* Company Info Card */}
              <div className="p-6 col-span-1 sm:col-span-2 xl:col-span-1 border-t xl:border-t-0 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <span className="text-white font-bold text-lg">MT</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-neutral-900 dark:text-white">Montres Trading L.L.C</h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      United Arab Emirates
                    </p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 border border-yellow-100 dark:border-yellow-900/30 rounded-lg">
                  <p className="text-xs font-medium text-yellow-800 dark:text-yellow-500 flex items-center gap-2">
                    Welcome! Your revenue journey starts here.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueReportCard;
