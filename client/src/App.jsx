import { Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import HomePage from './pages/user/HomePage.jsx';
import ToursPage from './pages/user/ToursPage.jsx';
import TourDetailPage from './pages/user/TourDetailPage.jsx';
import AuthPage from './pages/user/AuthPage.jsx';
import DashboardPage from './pages/user/DashboardPage.jsx';
import AdminPage from './pages/admin/AdminPage.jsx';

const App = () => (
  <div className="app-shell">
    <Header />
    <main className="app-main">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tours" element={<ToursPage />} />
        <Route path="/tours/:id" element={<TourDetailPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </main>
    <Footer />
      </div>
);

export default App;
