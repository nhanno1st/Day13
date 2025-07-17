import { BrowserRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Header from "./components/Header";
import { LoginPage } from "./pages/LoginPage";
import { TasksPage } from "./pages/TasksPage";
import CreateTaskPage from "./pages/CreateTaskPage";
import UpdateTaskPage from "./pages/UpdateTaskPage";
import { AssigneeMePage } from "./pages/AssigneeMePage";
import { toast } from "react-toastify";
import { useAuthStore } from "./store/useAuthStore";


const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loggedInUser } = useAuthStore();

  useEffect(() => {
    if (!loggedInUser) {
      navigate("/login");
      toast.warning(
        `Access denied. You must log in to view "${location.pathname}".`,
        { toastId: "access-denied-toast" }
      );
      navigate("/login");
    }
  }, [loggedInUser, location.pathname]);

  return loggedInUser ? <>{children}</> : null;
};

export const TaskManage = () => {
  const user = useAuthStore((state) => state.loggedInUser);

  return (
    <BrowserRouter>
      {user && <Header />}

      <Routes>
        <Route index element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <TasksPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <CreateTaskPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/update/:id"
          element={
            <ProtectedRoute>
              <UpdateTaskPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/assignee-me"
          element={
            <ProtectedRoute>
              <AssigneeMePage />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
};
