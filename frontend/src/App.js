import './App.css';
import { useAuth } from './hooks/useAuth';
import LoginPage from './components/LoginPage';
import MainApp from './components/MainApp';

function AppContent() {
  const { user, loading, error } = useAuth();

  if (loading) {
    return <div className="App">Checking authentication…</div>;
  }

  if (error) {
    return <div className="App">Authentication error: {error}</div>;
  }

  return user ? <MainApp /> : <LoginPage />;
}

function App() {
  return <AppContent />;
}

export default App;
