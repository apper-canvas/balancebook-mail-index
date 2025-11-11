import { getApperClient } from '@/services/apperClient';
import { toast } from 'react-toastify';

export const transactionService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords('transactions_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "amount_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "CreatedOn"}}
        ],
        orderBy: [{"fieldName": "date_c", "sorttype": "DESC"}]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data?.map(transaction => ({
        Id: transaction.Id,
        description: transaction.description_c || transaction.Name,
        amount: transaction.amount_c || 0,
        type: transaction.type_c || 'expense',
        date: transaction.date_c,
        notes: transaction.notes_c || '',
        category: transaction.category_c?.Name || '',
        createdAt: transaction.CreatedOn
      })) || [];
    } catch (error) {
      console.error("Error fetching transactions:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.getRecordById('transactions_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "amount_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "CreatedOn"}}
        ]
      });

      if (!response.success) {
        console.error(response.message);
        return null;
      }

      const transaction = response.data;
      if (!transaction) return null;

      return {
        Id: transaction.Id,
        description: transaction.description_c || transaction.Name,
        amount: transaction.amount_c || 0,
        type: transaction.type_c || 'expense',
        date: transaction.date_c,
        notes: transaction.notes_c || '',
        category: transaction.category_c?.Name || '',
        createdAt: transaction.CreatedOn
      };
    } catch (error) {
      console.error(`Error fetching transaction ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  async getByMonth(month) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords('transactions_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "amount_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "CreatedOn"}}
        ],
        where: [
          {"FieldName": "date_c", "Operator": "StartsWith", "Values": [month]}
        ],
        orderBy: [{"fieldName": "date_c", "sorttype": "DESC"}]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data?.map(transaction => ({
        Id: transaction.Id,
        description: transaction.description_c || transaction.Name,
        amount: transaction.amount_c || 0,
        type: transaction.type_c || 'expense',
        date: transaction.date_c,
        notes: transaction.notes_c || '',
        category: transaction.category_c?.Name || '',
        createdAt: transaction.CreatedOn
      })) || [];
    } catch (error) {
      console.error("Error fetching transactions by month:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getByCategory(category) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords('transactions_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "amount_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "CreatedOn"}}
        ],
        whereGroups: [{
          "operator": "AND",
          "subGroups": [{
            "conditions": [{
              "fieldName": "category_c",
              "operator": "EqualTo",
              "values": [category]
            }],
            "operator": "AND"
          }]
        }],
        orderBy: [{"fieldName": "date_c", "sorttype": "DESC"}]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data?.map(transaction => ({
        Id: transaction.Id,
        description: transaction.description_c || transaction.Name,
        amount: transaction.amount_c || 0,
        type: transaction.type_c || 'expense',
        date: transaction.date_c,
        notes: transaction.notes_c || '',
        category: transaction.category_c?.Name || '',
        createdAt: transaction.CreatedOn
      })) || [];
    } catch (error) {
      console.error("Error fetching transactions by category:", error?.response?.data?.message || error);
      return [];
    }
  },

  async create(transactionData) {
    try {
      const apperClient = getApperClient();
      
      // Get category ID if category name provided
      let categoryId = null;
      if (transactionData.category) {
        const categoryResponse = await apperClient.fetchRecords('categories_c', {
          fields: [{"field": {"Name": "name_c"}}],
          where: [{"FieldName": "name_c", "Operator": "EqualTo", "Values": [transactionData.category]}]
        });
        
        if (categoryResponse.success && categoryResponse.data?.length > 0) {
          categoryId = categoryResponse.data[0].Id;
        }
      }

      const response = await apperClient.createRecord('transactions_c', {
        records: [{
          Name: transactionData.description,
          description_c: transactionData.description,
          amount_c: transactionData.amount,
          type_c: transactionData.type,
          date_c: transactionData.date,
          notes_c: transactionData.notes || '',
          category_c: categoryId
        }]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} transactions: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          const createdTransaction = successful[0].data;
          return {
            Id: createdTransaction.Id,
            description: createdTransaction.description_c || createdTransaction.Name,
            amount: createdTransaction.amount_c || 0,
            type: createdTransaction.type_c || 'expense',
            date: createdTransaction.date_c,
            notes: createdTransaction.notes_c || '',
            category: transactionData.category,
            createdAt: createdTransaction.CreatedOn
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error creating transaction:", error?.response?.data?.message || error);
      return null;
    }
  },

  async update(id, transactionData) {
    try {
      const apperClient = getApperClient();
      
      const updateData = {
        Id: parseInt(id)
      };

      if (transactionData.description) {
        updateData.Name = transactionData.description;
        updateData.description_c = transactionData.description;
      }
      if (transactionData.amount !== undefined) updateData.amount_c = transactionData.amount;
      if (transactionData.type) updateData.type_c = transactionData.type;
      if (transactionData.date) updateData.date_c = transactionData.date;
      if (transactionData.notes !== undefined) updateData.notes_c = transactionData.notes;
      
      // Get category ID if category name provided
      if (transactionData.category) {
        const categoryResponse = await apperClient.fetchRecords('categories_c', {
          fields: [{"field": {"Name": "name_c"}}],
          where: [{"FieldName": "name_c", "Operator": "EqualTo", "Values": [transactionData.category]}]
        });
        
        if (categoryResponse.success && categoryResponse.data?.length > 0) {
          updateData.category_c = categoryResponse.data[0].Id;
        }
      }

      const response = await apperClient.updateRecord('transactions_c', {
        records: [updateData]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} transactions: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          const updatedTransaction = successful[0].data;
          return {
            Id: updatedTransaction.Id,
            description: updatedTransaction.description_c || updatedTransaction.Name,
            amount: updatedTransaction.amount_c || 0,
            type: updatedTransaction.type_c || 'expense',
            date: updatedTransaction.date_c,
            notes: updatedTransaction.notes_c || '',
            category: transactionData.category,
            createdAt: updatedTransaction.CreatedOn
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error updating transaction:", error?.response?.data?.message || error);
      return null;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.deleteRecord('transactions_c', {
        RecordIds: [parseInt(id)]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} transactions: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        return successful.length > 0;
      }
      return false;
    } catch (error) {
      console.error("Error deleting transaction:", error?.response?.data?.message || error);
      return false;
    }
  },

  async getIncomeExpenseTrend(months) {
    try {
      const trendData = await Promise.all(months.map(async (month) => {
        const monthTransactions = await this.getByMonth(month);
        
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
      }));

      return trendData;
    } catch (error) {
      console.error("Error getting income expense trend:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getCategoryBreakdown(month) {
    try {
      const monthTransactions = await this.getByMonth(month);
      const expenseTransactions = monthTransactions.filter(t => t.type === "expense");
      
      const categoryTotals = expenseTransactions.reduce((acc, transaction) => {
        const category = transaction.category || 'Uncategorized';
        acc[category] = (acc[category] || 0) + transaction.amount;
        return acc;
      }, {});

      return Object.entries(categoryTotals).map(([category, amount]) => ({
        category,
        amount
      }));
    } catch (error) {
      console.error("Error getting category breakdown:", error?.response?.data?.message || error);
      return [];
    }
  }
};