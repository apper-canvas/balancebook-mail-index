import { getApperClient } from '@/services/apperClient';
import { toast } from 'react-toastify';

export const budgetService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords('budgets_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "month_c"}},
          {"field": {"Name": "monthly_limit_c"}},
          {"field": {"Name": "spent_c"}},
          {"field": {"Name": "rollover_c"}},
          {"field": {"Name": "category_c"}}
        ],
        orderBy: [{"fieldName": "month_c", "sorttype": "DESC"}]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data?.map(budget => ({
        Id: budget.Id,
        category: budget.category_c?.Name || '',
        month: budget.month_c,
        monthlyLimit: budget.monthly_limit_c || 0,
        spent: budget.spent_c || 0,
        rollover: budget.rollover_c || 0
      })) || [];
    } catch (error) {
      console.error("Error fetching budgets:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.getRecordById('budgets_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "month_c"}},
          {"field": {"Name": "monthly_limit_c"}},
          {"field": {"Name": "spent_c"}},
          {"field": {"Name": "rollover_c"}},
          {"field": {"Name": "category_c"}}
        ]
      });

      if (!response.success) {
        console.error(response.message);
        return null;
      }

      const budget = response.data;
      if (!budget) return null;

      return {
        Id: budget.Id,
        category: budget.category_c?.Name || '',
        month: budget.month_c,
        monthlyLimit: budget.monthly_limit_c || 0,
        spent: budget.spent_c || 0,
        rollover: budget.rollover_c || 0
      };
    } catch (error) {
      console.error(`Error fetching budget ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  async getByMonth(month) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords('budgets_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "month_c"}},
          {"field": {"Name": "monthly_limit_c"}},
          {"field": {"Name": "spent_c"}},
          {"field": {"Name": "rollover_c"}},
          {"field": {"Name": "category_c"}}
        ],
        where: [
          {"FieldName": "month_c", "Operator": "EqualTo", "Values": [month]}
        ]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data?.map(budget => ({
        Id: budget.Id,
        category: budget.category_c?.Name || '',
        month: budget.month_c,
        monthlyLimit: budget.monthly_limit_c || 0,
        spent: budget.spent_c || 0,
        rollover: budget.rollover_c || 0
      })) || [];
    } catch (error) {
      console.error("Error fetching budgets by month:", error?.response?.data?.message || error);
      return [];
    }
  },

  async create(budgetData) {
    try {
      const apperClient = getApperClient();
      
      // Get category ID if category name provided
      let categoryId = null;
      if (budgetData.category) {
        const categoryResponse = await apperClient.fetchRecords('categories_c', {
          fields: [{"field": {"Name": "name_c"}}],
          where: [{"FieldName": "name_c", "Operator": "EqualTo", "Values": [budgetData.category]}]
        });
        
        if (categoryResponse.success && categoryResponse.data?.length > 0) {
          categoryId = categoryResponse.data[0].Id;
        }
      }

      const response = await apperClient.createRecord('budgets_c', {
        records: [{
          Name: `${budgetData.category} - ${budgetData.month}`,
          month_c: budgetData.month,
          monthly_limit_c: budgetData.monthlyLimit,
          spent_c: 0,
          rollover_c: 0,
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
          console.error(`Failed to create ${failed.length} budgets: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          const createdBudget = successful[0].data;
          return {
            Id: createdBudget.Id,
            category: budgetData.category,
            month: createdBudget.month_c,
            monthlyLimit: createdBudget.monthly_limit_c || 0,
            spent: createdBudget.spent_c || 0,
            rollover: createdBudget.rollover_c || 0
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error creating budget:", error?.response?.data?.message || error);
      return null;
    }
  },

  async update(id, budgetData) {
    try {
      const apperClient = getApperClient();
      
      const updateData = {
        Id: parseInt(id)
      };

      if (budgetData.monthlyLimit !== undefined) updateData.monthly_limit_c = budgetData.monthlyLimit;
      if (budgetData.spent !== undefined) updateData.spent_c = budgetData.spent;
      if (budgetData.rollover !== undefined) updateData.rollover_c = budgetData.rollover;
      if (budgetData.month) updateData.month_c = budgetData.month;
      
      // Get category ID if category name provided
      if (budgetData.category) {
        const categoryResponse = await apperClient.fetchRecords('categories_c', {
          fields: [{"field": {"Name": "name_c"}}],
          where: [{"FieldName": "name_c", "Operator": "EqualTo", "Values": [budgetData.category]}]
        });
        
        if (categoryResponse.success && categoryResponse.data?.length > 0) {
          updateData.category_c = categoryResponse.data[0].Id;
        }
      }

      const response = await apperClient.updateRecord('budgets_c', {
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
          console.error(`Failed to update ${failed.length} budgets: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          const updatedBudget = successful[0].data;
          return {
            Id: updatedBudget.Id,
            category: budgetData.category || '',
            month: updatedBudget.month_c,
            monthlyLimit: updatedBudget.monthly_limit_c || 0,
            spent: updatedBudget.spent_c || 0,
            rollover: updatedBudget.rollover_c || 0
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error updating budget:", error?.response?.data?.message || error);
      return null;
    }
  },

  async updateSpent(category, month, amount) {
    try {
      const apperClient = getApperClient();
      
      // First find the budget by category and month
      const findResponse = await apperClient.fetchRecords('budgets_c', {
        fields: [{"field": {"Name": "category_c"}}],
        where: [
          {"FieldName": "month_c", "Operator": "EqualTo", "Values": [month]}
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
        }]
      });

      if (!findResponse.success || !findResponse.data?.length) {
        return null;
      }

      const budgetId = findResponse.data[0].Id;
      
      const response = await apperClient.updateRecord('budgets_c', {
        records: [{
          Id: budgetId,
          spent_c: amount
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
          console.error(`Failed to update spent amount: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          const updatedBudget = successful[0].data;
          return {
            Id: updatedBudget.Id,
            category: category,
            month: updatedBudget.month_c,
            monthlyLimit: updatedBudget.monthly_limit_c || 0,
            spent: updatedBudget.spent_c || 0,
            rollover: updatedBudget.rollover_c || 0
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error updating spent amount:", error?.response?.data?.message || error);
      return null;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.deleteRecord('budgets_c', {
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
          console.error(`Failed to delete ${failed.length} budgets: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        return successful.length > 0;
      }
      return false;
    } catch (error) {
      console.error("Error deleting budget:", error?.response?.data?.message || error);
      return false;
    }
  },

  async getBudgetSummary(month) {
    try {
      const monthBudgets = await this.getByMonth(month);
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
    } catch (error) {
      console.error("Error getting budget summary:", error?.response?.data?.message || error);
      return {
        totalBudget: 0,
        totalSpent: 0,
        remaining: 0,
        percentage: 0,
        categories: 0
      };
    }
  }
};
import { getApperClient } from '@/services/apperClient';
import { toast } from 'react-toastify';

export const budgetService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords('budgets_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "month_c"}},
          {"field": {"Name": "monthly_limit_c"}},
          {"field": {"Name": "spent_c"}},
          {"field": {"Name": "rollover_c"}},
          {"field": {"Name": "category_c"}}
        ],
        orderBy: [{"fieldName": "month_c", "sorttype": "DESC"}]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data?.map(budget => ({
        Id: budget.Id,
        category: budget.category_c?.Name || '',
        month: budget.month_c,
        monthlyLimit: budget.monthly_limit_c || 0,
        spent: budget.spent_c || 0,
        rollover: budget.rollover_c || 0
      })) || [];
    } catch (error) {
      console.error("Error fetching budgets:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.getRecordById('budgets_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "month_c"}},
          {"field": {"Name": "monthly_limit_c"}},
          {"field": {"Name": "spent_c"}},
          {"field": {"Name": "rollover_c"}},
          {"field": {"Name": "category_c"}}
        ]
      });

      if (!response.success) {
        console.error(response.message);
        return null;
      }

      const budget = response.data;
      if (!budget) return null;

      return {
        Id: budget.Id,
        category: budget.category_c?.Name || '',
        month: budget.month_c,
        monthlyLimit: budget.monthly_limit_c || 0,
        spent: budget.spent_c || 0,
        rollover: budget.rollover_c || 0
      };
    } catch (error) {
      console.error(`Error fetching budget ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  async getByMonth(month) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords('budgets_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "month_c"}},
          {"field": {"Name": "monthly_limit_c"}},
          {"field": {"Name": "spent_c"}},
          {"field": {"Name": "rollover_c"}},
          {"field": {"Name": "category_c"}}
        ],
        where: [
          {"FieldName": "month_c", "Operator": "EqualTo", "Values": [month]}
        ]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data?.map(budget => ({
        Id: budget.Id,
        category: budget.category_c?.Name || '',
        month: budget.month_c,
        monthlyLimit: budget.monthly_limit_c || 0,
        spent: budget.spent_c || 0,
        rollover: budget.rollover_c || 0
      })) || [];
    } catch (error) {
      console.error("Error fetching budgets by month:", error?.response?.data?.message || error);
      return [];
    }
  },

  async create(budgetData) {
    try {
      const apperClient = getApperClient();
      
      // Get category ID if category name provided
      let categoryId = null;
      if (budgetData.category) {
        const categoryResponse = await apperClient.fetchRecords('categories_c', {
          fields: [{"field": {"Name": "name_c"}}],
          where: [{"FieldName": "name_c", "Operator": "EqualTo", "Values": [budgetData.category]}]
        });
        
        if (categoryResponse.success && categoryResponse.data?.length > 0) {
          categoryId = categoryResponse.data[0].Id;
        }
      }

      const response = await apperClient.createRecord('budgets_c', {
        records: [{
          Name: `${budgetData.category} - ${budgetData.month}`,
          month_c: budgetData.month,
          monthly_limit_c: budgetData.monthlyLimit,
          spent_c: 0,
          rollover_c: 0,
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
          console.error(`Failed to create ${failed.length} budgets: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          const createdBudget = successful[0].data;
          return {
            Id: createdBudget.Id,
            category: budgetData.category,
            month: createdBudget.month_c,
            monthlyLimit: createdBudget.monthly_limit_c || 0,
            spent: createdBudget.spent_c || 0,
            rollover: createdBudget.rollover_c || 0
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error creating budget:", error?.response?.data?.message || error);
      return null;
    }
  },

  async update(id, budgetData) {
    try {
      const apperClient = getApperClient();
      
      const updateData = {
        Id: parseInt(id)
      };

      if (budgetData.monthlyLimit !== undefined) updateData.monthly_limit_c = budgetData.monthlyLimit;
      if (budgetData.spent !== undefined) updateData.spent_c = budgetData.spent;
      if (budgetData.rollover !== undefined) updateData.rollover_c = budgetData.rollover;
      if (budgetData.month) updateData.month_c = budgetData.month;
      
      // Get category ID if category name provided
      if (budgetData.category) {
        const categoryResponse = await apperClient.fetchRecords('categories_c', {
          fields: [{"field": {"Name": "name_c"}}],
          where: [{"FieldName": "name_c", "Operator": "EqualTo", "Values": [budgetData.category]}]
        });
        
        if (categoryResponse.success && categoryResponse.data?.length > 0) {
          updateData.category_c = categoryResponse.data[0].Id;
        }
      }

      const response = await apperClient.updateRecord('budgets_c', {
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
          console.error(`Failed to update ${failed.length} budgets: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          const updatedBudget = successful[0].data;
          return {
            Id: updatedBudget.Id,
            category: budgetData.category || '',
            month: updatedBudget.month_c,
            monthlyLimit: updatedBudget.monthly_limit_c || 0,
            spent: updatedBudget.spent_c || 0,
            rollover: updatedBudget.rollover_c || 0
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error updating budget:", error?.response?.data?.message || error);
      return null;
    }
  },

  async updateSpent(category, month, amount) {
    try {
      const apperClient = getApperClient();
      
      // First find the budget by category and month
      const findResponse = await apperClient.fetchRecords('budgets_c', {
        fields: [{"field": {"Name": "category_c"}}],
        where: [
          {"FieldName": "month_c", "Operator": "EqualTo", "Values": [month]}
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
        }]
      });

      if (!findResponse.success || !findResponse.data?.length) {
        return null;
      }

      const budgetId = findResponse.data[0].Id;
      
      const response = await apperClient.updateRecord('budgets_c', {
        records: [{
          Id: budgetId,
          spent_c: amount
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
          console.error(`Failed to update spent amount: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          const updatedBudget = successful[0].data;
          return {
            Id: updatedBudget.Id,
            category: category,
            month: updatedBudget.month_c,
            monthlyLimit: updatedBudget.monthly_limit_c || 0,
            spent: updatedBudget.spent_c || 0,
            rollover: updatedBudget.rollover_c || 0
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error updating spent amount:", error?.response?.data?.message || error);
      return null;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.deleteRecord('budgets_c', {
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
          console.error(`Failed to delete ${failed.length} budgets: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        return successful.length > 0;
      }
      return false;
    } catch (error) {
      console.error("Error deleting budget:", error?.response?.data?.message || error);
      return false;
    }
  },

  async getBudgetSummary(month) {
    try {
      const monthBudgets = await this.getByMonth(month);
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
    } catch (error) {
      console.error("Error getting budget summary:", error?.response?.data?.message || error);
      return {
        totalBudget: 0,
        totalSpent: 0,
        remaining: 0,
        percentage: 0,
        categories: 0
      };
    }
  }
};