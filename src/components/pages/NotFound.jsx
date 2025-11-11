import { useNavigate } from "react-router-dom";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="space-y-6">
          {/* 404 Icon */}
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center">
              <ApperIcon name="Search" className="w-12 h-12 text-blue-600" />
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900">404</h1>
            <h2 className="text-xl font-semibold text-gray-700">Page Not Found</h2>
            <p className="text-gray-600">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button 
              onClick={() => navigate("/")}
              className="w-full"
            >
              <ApperIcon name="Home" className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate(-1)}
              className="w-full"
            >
              <ApperIcon name="ArrowLeft" className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>

          {/* Quick Links */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-3">Quick Links:</p>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/transactions")}
                className="text-xs"
              >
                Transactions
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/budgets")}
                className="text-xs"
              >
                Budgets
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/goals")}
                className="text-xs"
              >
                Goals
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/charts")}
                className="text-xs"
              >
                Charts
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NotFound;