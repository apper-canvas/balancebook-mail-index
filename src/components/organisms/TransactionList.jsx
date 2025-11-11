import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import TransactionForm from "@/components/organisms/TransactionForm";
import { transactionService } from "@/services/api/transactionService";
import { categoryService } from "@/services/api/categoryService";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import Error from "@/components/ui/Error";
import CategoryBadge from "@/components/molecules/CategoryBadge";
import { cn } from "@/utils/cn";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/dateUtils";

const TransactionList = ({ selectedMonth, limit = null, onFormOpenChange, refreshTrigger }) => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

useEffect(() => {
    loadData();
  }, [selectedMonth, refreshTrigger]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [transactionsData, categoriesData] = await Promise.all([
        selectedMonth ? transactionService.getByMonth(selectedMonth) : transactionService.getAll(),
        categoryService.getAll()
      ]);
      
      const displayTransactions = limit ? transactionsData.slice(0, limit) : transactionsData;
      setTransactions(displayTransactions);
      setCategories(categoriesData);
    } catch (err) {
      setError("Failed to load transactions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleDelete = async (transactionId) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;
    
    try {
      await transactionService.delete(transactionId);
      toast.success("Transaction deleted successfully!");
      loadData();
    } catch (error) {
      toast.error("Failed to delete transaction. Please try again.");
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingTransaction(null);
  };

  const getCategoryInfo = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? { color: category.color, icon: category.icon } : { color: "#6b7280", icon: "Tag" };
  };

  const calculateRunningBalance = () => {
    let balance = 0;
    return transactions.map(transaction => {
      if (transaction.type === "income") {
        balance += transaction.amount;
      } else {
        balance -= transaction.amount;
      }
      return { ...transaction, runningBalance: balance };
    });
  };

  if (loading) return <Loading variant="skeleton" />;
  if (error) return <Error message={error} onRetry={loadData} />;
  if (transactions.length === 0) {
    return (
      <Empty
title="No transactions found"
        description="Start tracking your finances by adding your first transaction"
        actionLabel="Add Transaction"
        onAction={() => {
          if (onFormOpenChange) {
            onFormOpenChange(true);
          } else {
            setIsFormOpen(true);
          }
        }}
        icon="Receipt"
      />
    );
  }

  const transactionsWithBalance = calculateRunningBalance();

  return (
    <>
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {limit ? "Recent Transactions" : "All Transactions"}
              </h3>
              <p className="text-sm text-gray-600">
                {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
              </p>
            </div>
{!limit && (
              <Button onClick={() => {
                if (onFormOpenChange) {
                  onFormOpenChange(true);
                } else {
                  setIsFormOpen(true);
                }
              }}>
                <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
                Add Transaction
              </Button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactionsWithBalance.map((transaction, index) => {
                const categoryInfo = getCategoryInfo(transaction.category);
                return (
                  <motion.tr
                    key={transaction.Id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.description}
                        </div>
                        {transaction.notes && (
                          <div className="text-sm text-gray-500 truncate max-w-[200px]">
                            {transaction.notes}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <CategoryBadge
                        category={transaction.category}
                        color={categoryInfo.color}
                        icon={categoryInfo.icon}
                      />
                    </td>
                    
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(transaction.date)}
                    </td>
                    
                    <td className="px-6 py-4 text-right">
                      <span className={cn(
                        "text-sm font-medium",
                        transaction.type === "income" ? "text-success" : "text-gray-900"
                      )}>
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 text-right">
                      <span className={cn(
                        "text-sm font-medium",
                        transaction.runningBalance >= 0 ? "text-success" : "text-error"
                      )}>
                        {formatCurrency(transaction.runningBalance)}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(transaction)}
                        >
                          <ApperIcon name="Edit" className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(transaction.Id)}
                          className="text-error hover:text-error"
                        >
                          <ApperIcon name="Trash2" className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <TransactionForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        transaction={editingTransaction}
        onSuccess={loadData}
      />
    </>
  );
};

export default TransactionList;