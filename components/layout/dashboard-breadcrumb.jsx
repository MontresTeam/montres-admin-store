"use client"
import React,{useState,useEffect} from 'react';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { House } from 'lucide-react';

import { useRouter } from "next/navigation";

const DashboardBreadcrumb = ({ title, text }) => {
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
        <div className='flex flex-wrap items-center justify-between gap-2 mb-6'>
            <h6 className="text-2xl font-semibold">{title}</h6>
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem className="">
                        <BreadcrumbLink href='/' className='flex items-center gap-2 font-medium text-base text-neutral-600 hover:text-primary dark:text-white dark:hover:text-primary'>
                            <House size={16} />
                            Dashboard
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem className="text-base">
                        <BreadcrumbPage>{text}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
        </div>
    );
};

export default DashboardBreadcrumb;