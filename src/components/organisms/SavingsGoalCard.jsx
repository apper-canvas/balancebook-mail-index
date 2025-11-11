import { useState } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Card from "@/components/atoms/Card";
import Modal from "@/components/molecules/Modal";
import { savingsGoalService } from "@/services/api/savingsGoalService";
import { formatCurrency, formatPercentage } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/dateUtils";
import { cn } from "@/utils/cn";

const SavingsGoalCard = ({ goal, onUpdate }) => {
  const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
  const [contributionAmount, setContributionAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const percentage = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
  const remaining = goal.targetAmount - goal.currentAmount;
  const isCompleted = goal.currentAmount >= goal.targetAmount;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "#ef4444";
      case "medium": return "#f59e0b";
      case "low": return "#10b981";
      default: return "#6b7280";
    }
  };

  const handleContribution = async () => {
    const amount = parseFloat(contributionAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid contribution amount");
      return;
    }

    setIsSubmitting(true);
    try {
      await savingsGoalService.addContribution(goal.Id, amount);
      toast.success(`Added ${formatCurrency(amount)} to ${goal.name}!`);
      setContributionAmount("");
      setIsContributionModalOpen(false);
      onUpdate?.();
    } catch (error) {
      toast.error("Failed to add contribution. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete the goal "${goal.name}"?`)) return;
    
    try {
      await savingsGoalService.delete(goal.Id);
      toast.success("Goal deleted successfully!");
      onUpdate?.();
    } catch (error) {
      toast.error("Failed to delete goal. Please try again.");
    }
  };

  const daysUntilDeadline = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysUntilDeadline < 0;

  return (
    <>
      <Card className="p-6 hover">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold text-gray-900">{goal.name}</h3>
              <div className="flex items-center space-x-2">
                <span 
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: `${getPriorityColor(goal.priority)}20`,
                    color: getPriorityColor(goal.priority)
                  }}
                >
                  {goal.priority} priority
                </span>
                
                {isOverdue ? (
                  <span className="text-xs text-error font-medium">
                    {Math.abs(daysUntilDeadline)} days overdue
                  </span>
                ) : (
                  <span className="text-xs text-gray-600">
                    {daysUntilDeadline} days left
                  </span>
                )}
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="p-2 text-gray-400 hover:text-error"
            >
              <ApperIcon name="Trash2" className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress Circle */}
          <div className="flex items-center justify-center py-4">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke={isCompleted ? "#22c55e" : getPriorityColor(goal.priority)}
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                  animate={{ 
                    strokeDashoffset: 2 * Math.PI * 45 * (1 - Math.min(percentage, 100) / 100)
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-900">
                  {formatPercentage(Math.min(percentage, 100), 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Goal Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Current</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(goal.currentAmount)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Target</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(goal.targetAmount)}
              </span>
            </div>
            
            <div className="flex items-center justify-between border-t pt-3">
              <span className="text-sm font-medium text-gray-700">Remaining</span>
              <span className={cn(
                "font-bold",
                isCompleted ? "text-success" : "text-primary"
              )}>
                {isCompleted ? "Goal Achieved!" : formatCurrency(remaining)}
              </span>
            </div>
          </div>

          {/* Deadline */}
          <div className="border-t pt-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Deadline</span>
              <span className={cn(
                "font-medium",
                isOverdue ? "text-error" : "text-gray-900"
              )}>
                {formatDate(goal.deadline)}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            {isCompleted ? (
              <div className="flex items-center justify-center space-x-2 py-2 bg-success/10 rounded-lg">
                <ApperIcon name="Trophy" className="w-5 h-5 text-success" />
                <span className="text-success font-medium">Goal Completed!</span>
              </div>
            ) : (
              <Button
                className="w-full"
                onClick={() => setIsContributionModalOpen(true)}
              >
                <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
                Add Contribution
              </Button>
            )}
          </div>
        </motion.div>
      </Card>

      {/* Contribution Modal */}
      <Modal
        isOpen={isContributionModalOpen}
        onClose={() => {
          setIsContributionModalOpen(false);
          setContributionAmount("");
        }}
        title={`Add Contribution to ${goal.name}`}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setIsContributionModalOpen(false);
                setContributionAmount("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleContribution}
              disabled={isSubmitting || !contributionAmount}
            >
              {isSubmitting ? "Adding..." : "Add Contribution"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Current Amount</span>
                <div className="font-semibold text-gray-900">
                  {formatCurrency(goal.currentAmount)}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Remaining</span>
                <div className="font-semibold text-primary">
                  {formatCurrency(remaining)}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Contribution Amount
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={contributionAmount}
              onChange={(e) => setContributionAmount(e.target.value)}
              autoFocus
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SavingsGoalCard;