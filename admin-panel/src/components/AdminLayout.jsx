import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { SquaresFour, Package, ShoppingCart, Browsers, Megaphone, Gear, SignOut, ChatCircleDots, Newspaper, Stack, Rows } from '@phosphor-icons/react';

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          CHRONYX ADMIN
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} end>
            <SquaresFour size={20} /> Dashboard
          </NavLink>
          <NavLink to="/products" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <Package size={20} /> Products
          </NavLink>
          <NavLink to="/orders" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <ShoppingCart size={20} /> Orders
          </NavLink>
          <NavLink to="/contacts" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <ChatCircleDots size={20} /> Contacts
          </NavLink>
          <NavLink to="/content" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <Browsers size={20} /> Content
          </NavLink>
          <NavLink to="/journal" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <Newspaper size={20} /> Journal
          </NavLink>
          <NavLink to="/collections" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <Stack size={20} /> Collections
          </NavLink>
          <NavLink to="/navigation" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <Rows size={20} /> Navigation
          </NavLink>
          <NavLink to="/marketing" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <Megaphone size={20} /> Marketing
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <Gear size={20} /> Settings
          </NavLink>
        </nav>
        <div style={{ padding: '24px' }}>
          <button className="nav-item" onClick={async () => await supabase.auth.signOut()} style={{ width: '100%', background: 'none', border: 'none', justifyContent: 'flex-start', padding: '12px 0', cursor: 'pointer' }}>
            <SignOut size={20} /> Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Admin User</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--border-color)' }}></div>
          </div>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
