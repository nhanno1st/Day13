import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { AiFillProfile, AiOutlineLogout } from "react-icons/ai";
import { HiOutlineClipboardList, HiOutlinePlusCircle, HiOutlineUser } from "react-icons/hi";
import { useAuthStore } from "../store/useAuthStore";

const Header = () => {
  const loggedInUser = useAuthStore((state) => state.loggedInUser);
  const { logOut } = useAuthStore();
  const location = useLocation();

  if (!loggedInUser) return null;

  const navItems = useMemo(() => [
    { path: "/tasks", label: "Tasks", icon: <HiOutlineClipboardList size={18} />, exact: true },
    { path: "/create", label: "Create Task", icon: <HiOutlinePlusCircle size={18} />, exact: false },
    { path: "/assignee-me", label: "Assigned to Me", icon: <HiOutlineUser size={18} />, exact: false },
  ], []);

  const isActive = (path: string, exact: boolean) => {
    return exact ? location.pathname === path : location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logOut();
    toast.success("Logged out successfully");
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-10">
        <Link
          to="/tasks"
          className="flex items-center space-x-2 text-2xl font-bold text-blue-600 hover:text-blue-800 transition"
        >
          <AiFillProfile className="text-3xl" />
          <span className="tracking-tight">TaskManager</span>
        </Link>

          <nav className="flex space-x-2">
            {navItems.map(({ path, label, icon, exact }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(path, exact)
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:text-blue-700 hover:bg-gray-100"
                }`}
              >
                {icon}
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition duration-200"
        >
          <AiOutlineLogout size={18} />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
