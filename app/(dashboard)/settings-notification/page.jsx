
import DashboardBreadcrumb from '@/components/layout/dashboard-breadcrumb';
import ClientFirebaseWrapper from './client-wrapper';


export default function NotificationPage() {
    return (
        <>
            <DashboardBreadcrumb title="Notification" text="Notification" />
            <div className="rounded-xl border border-border bg-white dark:bg-[#273142] p-6 shadow-sm">
                <ClientFirebaseWrapper />
            </div>
        </>
    );
}
