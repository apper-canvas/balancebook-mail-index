import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import { cn } from "@/utils/cn";
import { formatCurrency } from "@/utils/formatCurrency";

const MetricCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  trendValue, 
  color = "primary",
  className,
  format = "currency"
}) => {
  const colors = {
    primary: "text-primary bg-primary/10",
    success: "text-success bg-success/10", 
    warning: "text-warning bg-warning/10",
    error: "text-error bg-error/10",
    info: "text-info bg-info/10"
  };

  const formatValue = (val) => {
    if (format === "currency") return formatCurrency(val);
    if (format === "percentage") return `${val}%`;
    if (format === "number") return val.toLocaleString();
    return val;
  };

  return (
    <Card className={cn("p-6 hover", className)} hover>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", colors[color])}>
            <ApperIcon name={icon} className="w-6 h-6" />
          </div>
          
          {trend && (
            <div className="flex items-center space-x-1">
              <ApperIcon 
                name={trend === "up" ? "TrendingUp" : "TrendingDown"} 
                className={cn(
                  "w-4 h-4",
                  trend === "up" ? "text-success" : "text-error"
                )} 
              />
              <span className={cn(
                "text-xs font-medium",
                trend === "up" ? "text-success" : "text-error"
              )}>
                {trendValue}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">
            {formatValue(value)}
          </p>
        </div>
      </motion.div>
    </Card>
  );
};

export default MetricCard;