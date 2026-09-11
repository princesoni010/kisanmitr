import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import OnboardingPage from "./pages/OnboardingPage";
import HomePage from "./pages/HomePage";
import DocumentAnalysisPage from "./pages/DocumentAnalysisPage";
import FraudCheckPage from "./pages/FraudCheckPage";
import SchemesPage from "./pages/SchemesPage";
import SchemeDetailPage from "./pages/SchemeDetailPage";
import ProfilePage from "./pages/ProfilePage";
import { LanguageProvider } from "./contexts/LanguageContext";

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<OnboardingPage />} />
          <Route element={<MainLayout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/document-analysis" element={<DocumentAnalysisPage />} />
            <Route path="/fraud-check" element={<FraudCheckPage />} />
            <Route path="/schemes" element={<SchemesPage />} />
            <Route path="/schemes/:id" element={<SchemeDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
