import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import BudgetCard from "@/components/organisms/BudgetCard";
import MonthSelector from "@/components/molecules/MonthSelector";
import Modal from "@/components/molecules/Modal";
import FormField from "@/components/molecules/FormField";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { budgetService } from "@/services/api/budgetService";
import { categoryService } from "@/services/api/categoryService";
import { transactionService } from "@/services/api/transactionService";
import { getCurrentMonth } from "@/utils/dateUtils";
import { formatCurrency } from "@/utils/formatCurrency";

const Budgets = () => {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [budgetSummary, setBudgetSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newBudgetForm, setNewBudgetForm] = useState({
    category: "",
    monthlyLimit: ""
  });

  useEffect(() => {
    loadData();
  }, [selectedMonth]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [budgetsData, categoriesData, budgetSummaryData, monthTransactions] = await Promise.all([
        budgetService.getByMonth(selectedMonth),
        categoryService.getAll(),
        budgetService.getBudgetSummary(selectedMonth),
        transactionService.getByMonth(selectedMonth)
      ]);

      // Update spent amounts based on actual transactions
      const expenseCategories = monthTransactions
        .filter(t => t.type === "expense")
        .reduce((acc, transaction) => {
          acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
          return acc;
        }, {});

      const updatedBudgets = budgetsData.map(budget => ({
        ...budget,
        spent: expenseCategories[budget.category] || 0
      }));

      setBudgets(updatedBudgets);
      setCategories(categoriesData.filter(cat => cat.name !== "Income"));
      setBudgetSummary(budgetSummaryData);
    } catch (err) {
      setError("Failed to load budget data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBudget = async () => {
    if (!newBudgetForm.category || !newBudgetForm.monthlyLimit) {
      toast.error("Please fill in all fields");
      return;
    }

    const amount = parseFloat(newBudgetForm.monthlyLimit);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid budget amount");
      return;
    }

    try {
      await budgetService.create({
        category: newBudgetForm.category,
        monthlyLimit: amount,
        month: selectedMonth
      });
      
      toast.success("Budget created successfully!");
      setIsAddModalOpen(false);
      setNewBudgetForm({ category: "", monthlyLimit: "" });
      loadData();
    } catch (error) {
      toast.error("Failed to create budget. Please try again.");
    }
  };

  const getCategoryInfo = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? { color: category.color, icon: category.icon } : { color: "#6b7280", icon: "Tag" };
  };

  const availableCategories = categories.filter(cat => 
    !budgets.some(budget => budget.category === cat.name)
  );

  if (loading) return <Loading variant="skeleton" />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Budgets</h1>
            <p className="text-gray-600">Set and track your spending limits</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <MonthSelector
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
            />
            
            <Button onClick={() => setIsAddModalOpen(true)}>
              <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
              Add Budget
            </Button>
          </div>
        </div>

        {/* Budget Summary */}
        {budgetSummary && (
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(budgetSummary.totalBudget)}
                </div>
                <div className="text-sm text-gray-600">Total Budget</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">
                  {formatCurrency(budgetSummary.totalSpent)}
                </div>
                <div className="text-sm text-gray-600">Total Spent</div>
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold ${budgetSummary.remaining >= 0 ? "text-success" : "text-error"}`}>
                  {formatCurrency(budgetSummary.remaining)}
                </div>
                <div className="text-sm text-gray-600">
                  {budgetSummary.remaining >= 0 ? "Remaining" : "Over Budget"}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {budgetSummary.percentage.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Budget Used</div>
              </div>
            </div>
          </Card>
        )}

        {/* Budget Cards */}
        {budgets.length === 0 ? (
          <Empty
            title="No budgets set"
            description="Create your first budget to start tracking your spending limits"
            actionLabel="Add Budget"
            onAction={() => setIsAddModalOpen(true)}
            icon="Target"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.map((budget) => (
              <BudgetCard
                key={budget.Id}
                budget={budget}
                categoryInfo={getCategoryInfo(budget.category)}
                onUpdate={loadData}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Budget Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setNewBudgetForm({ category: "", monthlyLimit: "" });
        }}
        title="Add New Budget"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false);
                setNewBudgetForm({ category: "", monthlyLimit: "" });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddBudget}
              disabled={!newBudgetForm.category || !newBudgetForm.monthlyLimit}
            >
              Add Budget
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormField
            label="Category"
            type="select"
            value={newBudgetForm.category}
            onChange={(e) => setNewBudgetForm(prev => ({ ...prev, category: e.target.value }))}
            required
          >
            <option value="">Select a category</option>
            {availableCategories.map((category) => (
              <option key={category.Id} value={category.name}>
                {category.name}
              </option>
            ))}
          </FormField>

          <FormField
            label="Monthly Budget Limit"
            type="input"
            inputType="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={newBudgetForm.monthlyLimit}
            onChange={(e) => setNewBudgetForm(prev => ({ ...prev, monthlyLimit: e.target.value }))}
            required
          />

          {availableCategories.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <ApperIcon name="Info" className="w-5 h-5 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  You have budgets set for all available categories. You can still edit existing budgets.
                </p>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default Budgets;