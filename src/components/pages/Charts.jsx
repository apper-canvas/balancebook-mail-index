import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Chart from "react-apexcharts";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import MonthSelector from "@/components/molecules/MonthSelector";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { transactionService } from "@/services/api/transactionService";
import { categoryService } from "@/services/api/categoryService";
import { getCurrentMonth, getLastSixMonths } from "@/utils/dateUtils";
import { formatCurrency } from "@/utils/formatCurrency";

const Charts = () => {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [chartType, setChartType] = useState("pie");
  const [pieChartData, setPieChartData] = useState({ series: [], labels: [] });
  const [lineChartData, setLineChartData] = useState({ series: [], categories: [] });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, [selectedMonth, chartType]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const categoriesData = await categoryService.getAll();
      setCategories(categoriesData);

      if (chartType === "pie") {
        await loadPieChartData(categoriesData);
      } else {
        await loadLineChartData();
      }
    } catch (err) {
      setError("Failed to load chart data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadPieChartData = async (categoriesData) => {
    const categoryBreakdown = await transactionService.getCategoryBreakdown(selectedMonth);
    
    if (categoryBreakdown.length === 0) {
      setPieChartData({ series: [], labels: [] });
      return;
    }

    const series = categoryBreakdown.map(item => item.amount);
    const labels = categoryBreakdown.map(item => item.category);
    
    setPieChartData({ series, labels });
  };

  const loadLineChartData = async () => {
    const months = getLastSixMonths();
    const trendData = await transactionService.getIncomeExpenseTrend(months);
    
    const incomeData = trendData.map(item => item.income);
    const expenseData = trendData.map(item => item.expenses);
    const netData = trendData.map(item => item.net);
    const monthLabels = trendData.map(item => {
      const date = new Date(item.month + "-01");
      return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    });

    setLineChartData({
      series: [
        { name: "Income", data: incomeData },
        { name: "Expenses", data: expenseData },
        { name: "Net", data: netData }
      ],
      categories: monthLabels
    });
  };

  const getCategoryColor = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.color : "#6b7280";
  };

  const pieChartOptions = {
    chart: {
      type: "pie",
      height: 400,
      toolbar: { show: false }
    },
    colors: pieChartData.labels.map(label => getCategoryColor(label)),
    labels: pieChartData.labels,
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      fontSize: "14px",
      fontFamily: "Inter, system-ui, sans-serif"
    },
    plotOptions: {
      pie: {
        donut: {
          size: "0%"
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function(val) {
        return val.toFixed(1) + "%";
      }
    },
    tooltip: {
      y: {
        formatter: function(val) {
          return formatCurrency(val);
        }
      }
    }
  };

  const lineChartOptions = {
    chart: {
      type: "line",
      height: 400,
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    colors: ["#10b981", "#f59e0b", "#3b82f6"],
    stroke: {
      curve: "smooth",
      width: 3
    },
    xaxis: {
      categories: lineChartData.categories,
      labels: {
        style: {
          fontFamily: "Inter, system-ui, sans-serif"
        }
      }
    },
    yaxis: {
      labels: {
        formatter: function(val) {
          return "$" + (val / 1000).toFixed(1) + "k";
        },
        style: {
          fontFamily: "Inter, system-ui, sans-serif"
        }
      }
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontFamily: "Inter, system-ui, sans-serif"
    },
    grid: {
      borderColor: "#e5e7eb"
    },
    tooltip: {
      y: {
        formatter: function(val) {
          return formatCurrency(val);
        }
      }
    },
    markers: {
      size: 6,
      strokeWidth: 2,
      fillOpacity: 1,
      strokeOpacity: 1,
      hover: {
        size: 8
      }
    }
  };

  if (loading) return <Loading variant="skeleton" />;
  if (error) return <Error message={error} onRetry={loadData} />;

  const hasData = chartType === "pie" 
    ? pieChartData.series.length > 0 
    : lineChartData.series.length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Charts</h1>
          <p className="text-gray-600">Visualize your financial data</p>
        </div>
        
        {chartType === "pie" && (
          <MonthSelector
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
          />
        )}
      </div>

      {/* Chart Type Toggle */}
      <div className="flex items-center space-x-4">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <Button
            variant={chartType === "pie" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setChartType("pie")}
            className="rounded-md"
          >
            <ApperIcon name="PieChart" className="w-4 h-4 mr-2" />
            Category Breakdown
          </Button>
          <Button
            variant={chartType === "line" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setChartType("line")}
            className="rounded-md"
          >
            <ApperIcon name="TrendingUp" className="w-4 h-4 mr-2" />
            Income vs Expenses
          </Button>
        </div>
      </div>

      {/* Chart Display */}
      <Card className="p-6">
        {!hasData ? (
          <Empty
            title={
              chartType === "pie" 
                ? "No expense data for this month" 
                : "No transaction data available"
            }
            description={
              chartType === "pie"
                ? "Add some expense transactions to see your spending breakdown"
                : "Add income and expense transactions to see your financial trend"
            }
            actionLabel="View Transactions"
            onAction={() => window.location.href = "/transactions"}
            icon={chartType === "pie" ? "PieChart" : "TrendingUp"}
          />
        ) : (
          <motion.div
            key={chartType}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {chartType === "pie" 
                  ? `Expense Breakdown - ${new Date(selectedMonth + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}`
                  : "Income vs Expenses Trend (Last 6 Months)"
                }
              </h2>
            </div>

            {chartType === "pie" ? (
              <Chart
                options={pieChartOptions}
                series={pieChartData.series}
                type="pie"
                height={400}
              />
            ) : (
              <Chart
                options={lineChartOptions}
                series={lineChartData.series}
                type="line"
                height={400}
              />
            )}
          </motion.div>
        )}
      </Card>

      {/* Chart Insights */}
      {hasData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chartType === "pie" && pieChartData.series.length > 0 && (
            <>
              <Card className="p-6">
                <div className="flex items-center space-x-3">
                  <ApperIcon name="TrendingUp" className="w-8 h-8 text-primary" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {pieChartData.labels[0]}
                    </div>
                    <div className="text-sm text-gray-600">
                      Highest Spending Category
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center space-x-3">
                  <ApperIcon name="DollarSign" className="w-8 h-8 text-success" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(Math.max(...pieChartData.series))}
                    </div>
                    <div className="text-sm text-gray-600">
                      Largest Expense
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center space-x-3">
                  <ApperIcon name="BarChart3" className="w-8 h-8 text-info" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {pieChartData.labels.length}
                    </div>
                    <div className="text-sm text-gray-600">
                      Active Categories
                    </div>
                  </div>
                </div>
              </Card>
            </>
          )}

          {chartType === "line" && lineChartData.series.length > 0 && (
            <>
              <Card className="p-6">
                <div className="flex items-center space-x-3">
                  <ApperIcon name="TrendingUp" className="w-8 h-8 text-success" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(Math.max(...lineChartData.series[0].data))}
                    </div>
                    <div className="text-sm text-gray-600">
                      Highest Monthly Income
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center space-x-3">
                  <ApperIcon name="TrendingDown" className="w-8 h-8 text-warning" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(Math.max(...lineChartData.series[1].data))}
                    </div>
                    <div className="text-sm text-gray-600">
                      Highest Monthly Expenses
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center space-x-3">
                  <ApperIcon name="Wallet" className="w-8 h-8 text-primary" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(lineChartData.series[2].data.slice(-1)[0])}
                    </div>
                    <div className="text-sm text-gray-600">
                      Current Month Net
                    </div>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Charts;