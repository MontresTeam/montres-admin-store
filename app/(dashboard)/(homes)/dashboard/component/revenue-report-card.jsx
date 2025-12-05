import StatsCard from '@/app/(dashboard)/(homes)/dashboard/component/stats-card';
import GenerateContentChart from '@/components/charts/generate-content-chart';
import CustomSelect from '@/components/shared/custom-select';
import { Card, CardContent } from '@/components/ui/card';

const RevenueReportCard = () => {
  // UAE Dirham currency configuration
  const currencyConfig = {
    symbol: 'AED',
    locale: 'ar-AE',
    startingBalance: 0,
    format: (amount) => {
      return new Intl.NumberFormat('ar-AE', {
        style: 'currency',
        currency: 'AED',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    }
  };

  // Initial revenue data for Montres Trading L.L.C (starting from zero)
  const revenueData = {
    earning: 0,
    expense: 0,
    netRevenue: 0,
    growth: 0,
    previousPeriod: {
      earning: 0,
      expense: 0
    }
  };

  // Stats data for the company
  const companyStats = [
    {
      title: "Total Revenue",
      value: currencyConfig.format(revenueData.earning),
      description: "Starting revenue",
      trend: 0,
      icon: "💰"
    },
    {
      title: "Net Profit",
      value: currencyConfig.format(revenueData.netRevenue),
      description: "After expenses",
      trend: 0,
      icon: "📈"
    },
    {
      title: "Operating Expenses",
      value: currencyConfig.format(revenueData.expense),
      description: "Monthly costs",
      trend: 0,
      icon: "📊"
    },
    {
      title: "Growth Rate",
      value: `${revenueData.growth}%`,
      description: "Since inception",
      trend: 0,
      icon: "🚀"
    }
  ];

  return (
    <Card className="card rounded-lg border-0 !p-0">
      <CardContent className='p-0'>
        <div className="grid grid-cols-1 2xl:grid-cols-12">
          <div className="xl:col-span-12 2xl:col-span-6">
            <div className="card-body p-6">
              <div className="flex items-center flex-wrap gap-2 justify-between">
                <div>
                  <h6 className="mb-0 font-bold text-lg">Revenue Report</h6>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    Montres Trading L.L.C - UAE
                  </p>
                </div>
                <CustomSelect
                  placeholder="Yearly"
                  options={["Yearly", "Monthly", "Weekly", "Today"]}
                />
              </div>
              
              {/* Revenue Summary */}
              <div className="mt-6 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Starting Balance</p>
                    <p className="text-xl font-bold text-green-600">
                      {currencyConfig.format(currencyConfig.startingBalance)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Currency</p>
                    <p className="text-xl font-bold text-blue-600">AED - درهم</p>
                  </div>
                </div>
              </div>

              <ul className="flex flex-wrap items-center mt-6 gap-4">
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-xs bg-green-500"></span>
                  <span className="text-secondary-light text-sm font-semibold">
                    Earning: 
                    <span className="text-neutral-600 dark:text-neutral-200 font-bold ml-1">
                      {currencyConfig.format(revenueData.earning)}
                    </span>
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-xs bg-red-500"></span>
                  <span className="text-secondary-light text-sm font-semibold">
                    Expense: 
                    <span className="text-neutral-600 dark:text-neutral-200 font-bold ml-1">
                      {currencyConfig.format(revenueData.expense)}
                    </span>
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-xs bg-blue-500"></span>
                  <span className="text-secondary-light text-sm font-semibold">
                    Net: 
                    <span className="text-neutral-600 dark:text-neutral-200 font-bold ml-1">
                      {currencyConfig.format(revenueData.netRevenue)}
                    </span>
                  </span>
                </li>
              </ul>

              <div className="mt-8">
                <div className="-m-4">
                  <GenerateContentChart />
                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-12 2xl:col-span-6 2xl:border-l border-neutral-200 dark:border-neutral-600">
            <div className="grid grid-cols-1 sm:grid-cols-2">
              {/* Custom Stats Cards */}
              {companyStats.map((stat, index) => (
                <div key={index} className="p-6 border-b border-r border-neutral-200 dark:border-neutral-600">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold mt-2">
                        {stat.value}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        {stat.description}
                      </p>
                    </div>
                    <div className="text-2xl">
                      {stat.icon}
                    </div>
                  </div>
                  <div className={`mt-3 text-sm font-medium ${
                    stat.trend > 0 ? 'text-green-600' : 
                    stat.trend < 0 ? 'text-red-600' : 'text-neutral-500'
                  }`}>
                    {stat.trend > 0 ? `+${stat.trend}%` : `${stat.trend}%`} from start
                  </div>
                </div>
              ))}
              
              {/* Company Info Card */}
              <div className="p-6 border-b border-r border-neutral-200 dark:border-neutral-600">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold text-lg">MT</span>
                  </div>
                  <h4 className="font-bold text-lg">Montres Trading L.L.C</h4>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    United Arab Emirates
                  </p>
                  <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                      🎉 Welcome! Your revenue journey starts here.
                    </p>
                  </div>
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