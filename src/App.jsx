import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';
import Artist from './pages/Artist';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ViewAll from './pages/ViewAll';
import AlbumDetails from './pages/AlbumDetails';
import PlaylistDetails from './pages/PlaylistDetails';
import Favorites from './pages/Favorites';
import Library from './pages/Library';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/library" element={<Library />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/artist" element={<Artist />} />
            {/* Redirect generic artist search to the Artist page for demo purposes */}
            <Route path="/artist/:id" element={<Artist />} />
            <Route path="/view-all" element={<ViewAll />} />
            <Route path="/album/:id" element={<AlbumDetails />} />
            <Route path="/playlist/:id" element={<PlaylistDetails />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
