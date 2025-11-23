import React from 'react';
import { Outlet } from 'react-router-dom';
import { NavBar } from './NavBar';
import { Footer } from './Footer';
import './Layout.scss';

export const Layout: React.FC = () => {
  return (
    <div className="layout">
      <NavBar />
      <main className="layout-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
