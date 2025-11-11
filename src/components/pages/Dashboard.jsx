import { useState, useEffect } from "react";
import MetricCard from "@/components/molecules/MetricCard";
import TransactionList from "@/components/organisms/TransactionList";
import MonthSelector from "@/components/molecules/MonthSelector";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { transactionService } from "@/services/api/transactionService";
import { budgetService } from "@/services/api/budgetService";
import { savingsGoalService } from "@/services/api/savingsGoalService";
import { getCurrentMonth } from "@/utils/dateUtils";

const Dashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [dashboardData, setDashboardData] = useState({
    balance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    budgetHealth: 0,
    savingsGoals: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, [selectedMonth]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const [transactions, budgetSummary, goalsSummary] = await Promise.all([
        transactionService.getByMonth(selectedMonth),
        budgetService.getBudgetSummary(selectedMonth),
        savingsGoalService.getGoalsSummary()
      ]);

      const income = transactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = transactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      const balance = income - expenses;
      const budgetHealth = budgetSummary.totalBudget > 0 
        ? ((budgetSummary.totalBudget - budgetSummary.totalSpent) / budgetSummary.totalBudget) * 100
        : 100;

      setDashboardData({
        balance,
        monthlyIncome: income,
        monthlyExpenses: expenses,
        budgetHealth: Math.max(budgetHealth, 0),
        savingsGoals: goalsSummary.overallProgress
      });
    } catch (err) {
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading variant="skeleton" />;
  if (error) return <Error message={error} onRetry={loadDashboardData} />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Track your financial health and goals</p>
        </div>
        
        <MonthSelector
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
        />
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Monthly Balance"
          value={dashboardData.balance}
          icon="Wallet"
          color={dashboardData.balance >= 0 ? "success" : "error"}
          trend={dashboardData.balance >= 0 ? "up" : "down"}
          trendValue={`${dashboardData.balance >= 0 ? "+" : ""}${(dashboardData.balance / 1000).toFixed(1)}k`}
        />
        
        <MetricCard
          title="Monthly Income"
          value={dashboardData.monthlyIncome}
          icon="TrendingUp"
          color="primary"
          format="currency"
        />
        
        <MetricCard
          title="Monthly Expenses"
          value={dashboardData.monthlyExpenses}
          icon="TrendingDown"
          color="warning"
          format="currency"
        />
        
        <MetricCard
          title="Budget Health"
          value={dashboardData.budgetHealth}
          icon="Target"
          color={
            dashboardData.budgetHealth >= 80 ? "success" :
            dashboardData.budgetHealth >= 50 ? "warning" : "error"
          }
          format="percentage"
        />
      </div>

      {/* Savings Goals Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Savings Progress"
          value={dashboardData.savingsGoals}
          icon="PiggyBank"
          color="info"
          format="percentage"
        />
        
        <MetricCard
          title="Active Goals"
          value={4}
          icon="Trophy"
          color="warning"
          format="number"
        />
        
        <MetricCard
          title="This Month Saved"
          value={500}
          icon="Coins"
          color="success"
          format="currency"
        />
      </div>

      {/* Recent Transactions */}
      <div className="space-y-6">
        <TransactionList 
          selectedMonth={selectedMonth} 
          limit={10} 
        />
      </div>
    </div>
  );
};

export default Dashboard;