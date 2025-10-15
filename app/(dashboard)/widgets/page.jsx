import React from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import DefaultCardComponent from "@/app/(dashboard)/components/default-card-component";
import StatCard from "../../../app/(dashboard)/(homes)/dashboard/component/stats-card";

const LineChartPage = () => {
  return (
    <>
      <DashboardBreadcrumb title="Widgets" text="Widgets" />

      <div className="">
        <DefaultCardComponent title="Metrics">
          <div className=" flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-6">
              <StatCard />
            </div>
          </div>
        </DefaultCardComponent>
      </div>
    </>
  );
};
export default LineChartPage;
