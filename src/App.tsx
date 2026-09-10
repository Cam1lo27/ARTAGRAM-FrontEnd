import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AdminRoute } from './components/layout/AdminRoute';
import { LandingPage } from './features/auth/LandingPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { LoginPage } from './features/auth/LoginPage';
import { VerifyPage } from './features/auth/VerifyPage';
import { FeedPage } from './features/feed/FeedPage';
import { ProfilePage } from './features/profile/ProfilePage';
import { CommunityListPage } from './features/community/CommunityListPage';
import { CommunityDetailPage } from './features/community/CommunityDetailPage';
import { CanvasStudioPage } from './features/canvas/CanvasStudioPage';
import { BannerMuralPage } from './features/canvas/BannerMuralPage';
import { PartyLobbyPage } from './features/party/PartyLobbyPage';
import { PartyRoomPage } from './features/party/PartyRoomPage';
import { PersonalChatPage } from './features/chat/PersonalChatPage';
import { AdminDashboardPage } from './features/admin/AdminDashboardPage';

function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verificar" element={<VerifyPage />} />
          <Route path="/perfil/:nombreArtista" element={<ProfilePage />} />

          <Route path="/feed" element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />

          <Route path="/comunidades" element={<ProtectedRoute><CommunityListPage /></ProtectedRoute>} />
          <Route path="/comunidades/:id" element={<ProtectedRoute><CommunityDetailPage /></ProtectedRoute>} />
          <Route path="/comunidades/:id/lienzo" element={<ProtectedRoute><CanvasStudioPage /></ProtectedRoute>} />
          <Route path="/comunidades/:id/banner" element={<ProtectedRoute><BannerMuralPage /></ProtectedRoute>} />

          <Route path="/fiesta" element={<ProtectedRoute><PartyLobbyPage /></ProtectedRoute>} />
          <Route path="/fiesta/:id" element={<ProtectedRoute><PartyRoomPage /></ProtectedRoute>} />

          <Route path="/mensajes" element={<ProtectedRoute><PersonalChatPage /></ProtectedRoute>} />

          <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

export default App;
