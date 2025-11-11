import { useState } from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import { formatMonthYear, getCurrentMonth } from "@/utils/dateUtils";
import { cn } from "@/utils/cn";

const MonthSelector = ({ selectedMonth, onMonthChange, className }) => {
  const [currentDate, setCurrentDate] = useState(new Date(selectedMonth + "-01"));

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
    
    const monthString = newDate.getFullYear() + "-" + String(newDate.getMonth() + 1).padStart(2, "0");
    onMonthChange(monthString);
  };

  const goToCurrentMonth = () => {
    const currentMonth = getCurrentMonth();
    const newDate = new Date(currentMonth + "-01");
    setCurrentDate(newDate);
    onMonthChange(currentMonth);
  };

  const isCurrentMonth = selectedMonth === getCurrentMonth();

  return (
    <div className={cn("flex items-center space-x-4", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigateMonth(-1)}
        className="p-2"
      >
        <ApperIcon name="ChevronLeft" className="w-4 h-4" />
      </Button>

      <div className="flex items-center space-x-3">
        <h2 className="text-lg font-semibold text-gray-900 min-w-[140px] text-center">
          {formatMonthYear(currentDate)}
        </h2>
        
        {!isCurrentMonth && (
          <Button
            variant="ghost"
            size="sm"
            onClick={goToCurrentMonth}
            className="text-primary hover:text-primary/80"
          >
            <ApperIcon name="Calendar" className="w-4 h-4 mr-1" />
            Current
          </Button>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => navigateMonth(1)}
        className="p-2"
      >
        <ApperIcon name="ChevronRight" className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default MonthSelector;