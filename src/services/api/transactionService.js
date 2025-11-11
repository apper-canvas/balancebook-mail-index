import transactionsData from "@/services/mockData/transactions.json";

let transactions = [...transactionsData];

const delay = () => new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));

export const transactionService = {
  async getAll() {
    await delay();
    return [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  async getById(id) {
    await delay();
    return transactions.find(transaction => transaction.Id === parseInt(id));
  },

  async getByMonth(month) {
    await delay();
    return transactions.filter(transaction => {
      const transactionMonth = transaction.date.substring(0, 7);
      return transactionMonth === month;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  async getByCategory(category) {
    await delay();
    return transactions.filter(transaction => transaction.category === category);
  },

  async create(transactionData) {
    await delay();
    const newTransaction = {
      ...transactionData,
      Id: Math.max(...transactions.map(t => t.Id)) + 1,
      createdAt: new Date().toISOString()
    };
    transactions.push(newTransaction);
    return { ...newTransaction };
  },

  async update(id, transactionData) {
    await delay();
    const index = transactions.findIndex(transaction => transaction.Id === parseInt(id));
    if (index !== -1) {
      transactions[index] = { ...transactions[index], ...transactionData };
      return { ...transactions[index] };
    }
    throw new Error("Transaction not found");
  },

  async delete(id) {
    await delay();
    const index = transactions.findIndex(transaction => transaction.Id === parseInt(id));
    if (index !== -1) {
      const deleted = transactions.splice(index, 1);
      return deleted[0];
    }
    throw new Error("Transaction not found");
  },

  async getIncomeExpenseTrend(months) {
    await delay();
    const trendData = months.map(month => {
      const monthTransactions = transactions.filter(t => t.date.substring(0, 7) === month);
      const income = monthTransactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
      const expenses = monthTransactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        month,
        income,
        expenses,
        net: income - expenses
      };
    });
    return trendData;
  },

  async getCategoryBreakdown(month) {
    await delay();
    const monthTransactions = transactions.filter(t => 
      t.date.substring(0, 7) === month && t.type === "expense"
    );
    
    const categoryTotals = monthTransactions.reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
      return acc;
    }, {});

    return Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount
    }));
  }
};