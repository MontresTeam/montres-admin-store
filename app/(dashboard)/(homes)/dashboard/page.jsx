import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import LoadingSkeleton from "@/components/loading-skeleton";
import { Suspense } from "react";
import RevenueReportCard from "./component/revenue-report-card";
import CustomersStatisticsCard from "./component/customers-statistics-card";

const metadata = {
  title: "E-commerce Dashboard | Monters Admin Panel",
  description:
    "Manage orders, monitor sales, and track product performance with the E-commerce Dashboard in Monters Admin Template.",
};


const EcommercePage = () => {
  return (
    <>
      <DashboardBreadcrumb title="Dashboard" text="Dashboard" />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        <div className="md:col-span-12 2xl:col-span-9">
          <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
            <RevenueReportCard />
          </Suspense>
        </div>

        <div className="md:col-span-12 lg:col-span-6 2xl:col-span-3">
          <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
            <CustomersStatisticsCard />
          </Suspense>
        </div>

      </div>
    </>
  )
}
export default EcommercePage;