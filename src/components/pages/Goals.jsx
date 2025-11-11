import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import SavingsGoalCard from "@/components/organisms/SavingsGoalCard";
import Modal from "@/components/molecules/Modal";
import FormField from "@/components/molecules/FormField";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { savingsGoalService } from "@/services/api/savingsGoalService";
import { formatCurrency } from "@/utils/formatCurrency";

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [goalsSummary, setGoalsSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newGoalForm, setNewGoalForm] = useState({
    name: "",
    targetAmount: "",
    deadline: "",
    priority: "medium"
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [goalsData, summaryData] = await Promise.all([
        savingsGoalService.getAll(),
        savingsGoalService.getGoalsSummary()
      ]);
      
      setGoals(goalsData);
      setGoalsSummary(summaryData);
    } catch (err) {
      setError("Failed to load savings goals. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async () => {
    if (!newGoalForm.name || !newGoalForm.targetAmount || !newGoalForm.deadline) {
      toast.error("Please fill in all required fields");
      return;
    }

    const amount = parseFloat(newGoalForm.targetAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid target amount");
      return;
    }

    const deadline = new Date(newGoalForm.deadline);
    if (deadline <= new Date()) {
      toast.error("Deadline must be in the future");
      return;
    }

    try {
      await savingsGoalService.create({
        name: newGoalForm.name,
        targetAmount: amount,
        deadline: deadline.toISOString(),
        priority: newGoalForm.priority
      });
      
      toast.success("Savings goal created successfully!");
      setIsAddModalOpen(false);
      setNewGoalForm({
        name: "",
        targetAmount: "",
        deadline: "",
        priority: "medium"
      });
      loadData();
    } catch (error) {
      toast.error("Failed to create savings goal. Please try again.");
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (loading) return <Loading variant="skeleton" />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Savings Goals</h1>
            <p className="text-gray-600">Track your progress towards financial milestones</p>
          </div>
          
          <Button onClick={() => setIsAddModalOpen(true)}>
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            Add Goal
          </Button>
        </div>

        {/* Goals Summary */}
        {goalsSummary && (
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(goalsSummary.totalTargetAmount)}
                </div>
                <div className="text-sm text-gray-600">Total Target</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-success">
                  {formatCurrency(goalsSummary.totalCurrentAmount)}
                </div>
                <div className="text-sm text-gray-600">Total Saved</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">
                  {formatCurrency(goalsSummary.totalRemaining)}
                </div>
                <div className="text-sm text-gray-600">Remaining</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-info">
                  {goalsSummary.overallProgress.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Overall Progress</div>
              </div>
            </div>
          </Card>
        )}

        {/* Goals Grid */}
        {goals.length === 0 ? (
          <Empty
            title="No savings goals yet"
            description="Set your first savings goal and start working towards your financial dreams"
            actionLabel="Add Goal"
            onAction={() => setIsAddModalOpen(true)}
            icon="Trophy"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => (
              <SavingsGoalCard
                key={goal.Id}
                goal={goal}
                onUpdate={loadData}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Goal Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setNewGoalForm({
            name: "",
            targetAmount: "",
            deadline: "",
            priority: "medium"
          });
        }}
        title="Add New Savings Goal"
        size="lg"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false);
                setNewGoalForm({
                  name: "",
                  targetAmount: "",
                  deadline: "",
                  priority: "medium"
                });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddGoal}
              disabled={!newGoalForm.name || !newGoalForm.targetAmount || !newGoalForm.deadline}
            >
              Add Goal
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormField
            label="Goal Name"
            type="input"
            placeholder="e.g., Emergency Fund, Vacation, New Car"
            value={newGoalForm.name}
            onChange={(e) => setNewGoalForm(prev => ({ ...prev, name: e.target.value }))}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Target Amount"
              type="input"
              inputType="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={newGoalForm.targetAmount}
              onChange={(e) => setNewGoalForm(prev => ({ ...prev, targetAmount: e.target.value }))}
              required
            />

            <FormField
              label="Priority"
              type="select"
              value={newGoalForm.priority}
              onChange={(e) => setNewGoalForm(prev => ({ ...prev, priority: e.target.value }))}
              required
            >
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </FormField>
          </div>

          <FormField
            label="Target Date"
            type="input"
            inputType="date"
            min={getMinDate()}
            value={newGoalForm.deadline}
            onChange={(e) => setNewGoalForm(prev => ({ ...prev, deadline: e.target.value }))}
            required
          />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <ApperIcon name="Lightbulb" className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Tips for successful savings goals:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Make your goals specific and measurable</li>
                  <li>• Set realistic deadlines to stay motivated</li>
                  <li>• Break large goals into smaller milestones</li>
                  <li>• Automate contributions when possible</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Goals;