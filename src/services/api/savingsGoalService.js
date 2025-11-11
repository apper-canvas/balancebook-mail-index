import savingsGoalsData from "@/services/mockData/savingsGoals.json";

let savingsGoals = [...savingsGoalsData];

const delay = () => new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));

export const savingsGoalService = {
  async getAll() {
    await delay();
    return [...savingsGoals].sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  },

  async getById(id) {
    await delay();
    return savingsGoals.find(goal => goal.Id === parseInt(id));
  },

  async create(goalData) {
    await delay();
    const newGoal = {
      ...goalData,
      Id: Math.max(...savingsGoals.map(g => g.Id)) + 1,
      currentAmount: 0,
      createdAt: new Date().toISOString()
    };
    savingsGoals.push(newGoal);
    return { ...newGoal };
  },

  async update(id, goalData) {
    await delay();
    const index = savingsGoals.findIndex(goal => goal.Id === parseInt(id));
    if (index !== -1) {
      savingsGoals[index] = { ...savingsGoals[index], ...goalData };
      return { ...savingsGoals[index] };
    }
    throw new Error("Savings goal not found");
  },

  async addContribution(id, amount) {
    await delay();
    const index = savingsGoals.findIndex(goal => goal.Id === parseInt(id));
    if (index !== -1) {
      savingsGoals[index].currentAmount += amount;
      return { ...savingsGoals[index] };
    }
    throw new Error("Savings goal not found");
  },

  async delete(id) {
    await delay();
    const index = savingsGoals.findIndex(goal => goal.Id === parseInt(id));
    if (index !== -1) {
      const deleted = savingsGoals.splice(index, 1);
      return deleted[0];
    }
    throw new Error("Savings goal not found");
  },

  async getGoalsSummary() {
    await delay();
    const totalTargetAmount = savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    const totalCurrentAmount = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    const totalRemaining = totalTargetAmount - totalCurrentAmount;
    const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;
    
    const activeGoals = savingsGoals.filter(goal => goal.currentAmount < goal.targetAmount);
    const completedGoals = savingsGoals.filter(goal => goal.currentAmount >= goal.targetAmount);

    return {
      totalTargetAmount,
      totalCurrentAmount,
      totalRemaining,
      overallProgress,
      activeGoalsCount: activeGoals.length,
      completedGoalsCount: completedGoals.length,
      totalGoalsCount: savingsGoals.length
    };
  }
};