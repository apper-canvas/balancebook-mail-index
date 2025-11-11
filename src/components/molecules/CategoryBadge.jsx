import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import { cn } from "@/utils/cn";

const CategoryBadge = ({ category, color, icon, size = "default", className }) => {
  const sizes = {
    sm: "text-xs px-2 py-0.5",
    default: "text-xs px-2.5 py-0.5", 
    lg: "text-sm px-3 py-1"
  };

  return (
    <Badge
      className={cn(
        "inline-flex items-center space-x-1.5 border-0",
        sizes[size],
        className
      )}
      style={{
        backgroundColor: `${color}20`,
        color: color
      }}
    >
      {icon && <ApperIcon name={icon} className="w-3 h-3" />}
      <span>{category}</span>
    </Badge>
  );
};

export default CategoryBadge;