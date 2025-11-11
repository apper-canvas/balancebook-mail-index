import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden lg:block" />
      
      {/* Mobile Navigation */}
      <MobileNav />
      
      {/* Main Content */}
      <div className="lg:ml-64 pt-20 lg:pt-0">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;