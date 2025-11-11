import budgetsData from "@/services/mockData/budgets.json";

let budgets = [...budgetsData];

const delay = () => new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));

export const budgetService = {
  async getAll() {
    await delay();
    return [...budgets];
  },

  async getById(id) {
    await delay();
    return budgets.find(budget => budget.Id === parseInt(id));
  },

  async getByMonth(month) {
    await delay();
    return budgets.filter(budget => budget.month === month);
  },

  async create(budgetData) {
    await delay();
    const newBudget = {
      ...budgetData,
      Id: Math.max(...budgets.map(b => b.Id)) + 1,
      spent: 0,
      rollover: 0
    };
    budgets.push(newBudget);
    return { ...newBudget };
  },

  async update(id, budgetData) {
    await delay();
    const index = budgets.findIndex(budget => budget.Id === parseInt(id));
    if (index !== -1) {
      budgets[index] = { ...budgets[index], ...budgetData };
      return { ...budgets[index] };
    }
    throw new Error("Budget not found");
  },

  async updateSpent(category, month, amount) {
    await delay();
    const budget = budgets.find(b => b.category === category && b.month === month);
    if (budget) {
      budget.spent = amount;
      return { ...budget };
    }
    return null;
  },

  async delete(id) {
    await delay();
    const index = budgets.findIndex(budget => budget.Id === parseInt(id));
    if (index !== -1) {
      const deleted = budgets.splice(index, 1);
      return deleted[0];
    }
    throw new Error("Budget not found");
  },

  async getBudgetSummary(month) {
    await delay();
    const monthBudgets = budgets.filter(budget => budget.month === month);
    const totalBudget = monthBudgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
    const totalSpent = monthBudgets.reduce((sum, b) => sum + b.spent, 0);
    const remaining = totalBudget - totalSpent;
    const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    return {
      totalBudget,
      totalSpent,
      remaining,
      percentage,
      categories: monthBudgets.length
    };
  }
};