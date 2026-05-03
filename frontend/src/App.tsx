import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import TopBar from './components/TopBar';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import RecordPage from './pages/RecordPage';
import KifuListPage from './pages/KifuListPage';
import InitialSetupPage from './pages/InitialSetupPage';
import InitialListPage from './pages/InitialListPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <TopBar />
        <Routes>
          <Route path="/" element={<Navigate to="/signin" />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/record/:kifuId" element={<RecordPage />} />
          <Route path="/kifu" element={<KifuListPage />} />
          <Route path="/setup" element={<InitialSetupPage />} />
          <Route path="/initial" element={<InitialListPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
