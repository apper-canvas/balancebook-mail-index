import Label from "@/components/atoms/Label";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import { cn } from "@/utils/cn";

const FormField = ({ 
  label, 
  type = "input", 
  error, 
  required, 
  children, 
  className,
  ...props 
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label required={required}>{label}</Label>}
      
      {type === "input" && <Input error={error} {...props} />}
      {type === "select" && <Select error={error} {...props}>{children}</Select>}
      {type === "textarea" && (
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm",
            "placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
            error && "border-error focus:ring-error/50 focus:border-error"
          )}
          {...props}
        />
      )}
      
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
};

export default FormField;