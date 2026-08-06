import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import SurveiPage from "@/pages/SurveiPage";
import LoginPage from "@/pages/admin/LoginPage";
import AdminLayout from "@/components/layout/AdminLayout";
import DashboardPage from "@/pages/admin/DashboardPage";
import QuestionPage from "@/pages/admin/QuestionPage";
import FeedbackPage from "@/pages/admin/FeedbackPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SurveiPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="questions" element={<QuestionPage />} />
          <Route path="feedback" element={<FeedbackPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
