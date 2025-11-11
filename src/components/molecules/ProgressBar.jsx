import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import { formatPercentage } from "@/utils/formatCurrency";

const ProgressBar = ({ 
  value, 
  max = 100, 
  className, 
  showLabel = true, 
  size = "default",
  color = "primary" 
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const getColor = () => {
    if (color !== "auto") return color;
    if (percentage < 50) return "success";
    if (percentage < 80) return "warning";
    return "error";
  };

  const currentColor = getColor();
  
  const colors = {
    primary: "bg-primary",
    success: "bg-success",
    warning: "bg-warning", 
    error: "bg-error",
    info: "bg-info"
  };

  const heights = {
    sm: "h-2",
    default: "h-3",
    lg: "h-4"
  };

  return (
    <div className={cn("space-y-2", className)}>
      {showLabel && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium text-gray-900">
            {formatPercentage(percentage)}
          </span>
        </div>
      )}
      
      <div className={cn(
        "bg-gray-200 rounded-full overflow-hidden",
        heights[size]
      )}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={cn(
            "h-full rounded-full transition-colors duration-300",
            colors[currentColor]
          )}
        />
      </div>
    </div>
  );
};

export default ProgressBar;