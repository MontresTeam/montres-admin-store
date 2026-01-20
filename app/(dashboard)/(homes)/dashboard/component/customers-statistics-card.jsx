
import CustomersStatisticsChart from "@/components/charts/customers-statistics-chart";
import CustomSelect from "@/components/shared/custom-select";
import { Card, CardContent } from "@/components/ui/card";


const CustomersStatisticsCard = () => {
    return (
        <Card className="card h-full rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm bg-white dark:bg-neutral-900 overflow-hidden">
            <CardContent className="card-body p-5 sm:p-6">
                <div className="flex items-center flex-wrap gap-4 justify-between mb-6">
                    <h6 className="font-bold text-xl text-neutral-900 dark:text-white">Customers Statistics</h6>
                    <div className="w-full sm:w-auto">
                        <CustomSelect
                            placeholder="Yearly"
                            options={["Yearly", "Monthly", "Weekly", "Today"]}
                            className="w-full"
                        />
                    </div>
                </div>

                <div className="relative py-4">
                    {/* Floating Stats - Hidden on very small screens if needed, or scaled down */}
                    <div className="absolute top-0 right-0 z-10 animate-in fade-in zoom-in duration-500 delay-100 m-2 sm:m-6">
                        <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white dark:bg-neutral-800 shadow-lg border border-neutral-100 dark:border-neutral-700">
                            <span className="text-sm sm:text-lg font-bold text-green-600 dark:text-green-400">+30%</span>
                        </div>
                    </div>

                    <div className="mt-4 grow min-h-[300px]">
                        <CustomersStatisticsChart />
                    </div>

                    <div className="absolute bottom-0 left-0 z-10 animate-in fade-in zoom-in duration-500 delay-200 m-2 sm:m-6">
                        <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white dark:bg-neutral-800 shadow-lg border border-neutral-100 dark:border-neutral-700">
                            <span className="text-sm sm:text-lg font-bold text-blue-600 dark:text-blue-400">+25%</span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
                            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                
                            </span>
                            <div>
                                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Male</p>
                                <p className="text-lg font-bold text-neutral-900 dark:text-white">20,000</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
                            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">
                             
                            </span>
                            <div>
                                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Female</p>
                                <p className="text-lg font-bold text-neutral-900 dark:text-white">25,000</p>
                            </div>
                        </div>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
};

export default CustomersStatisticsCard;