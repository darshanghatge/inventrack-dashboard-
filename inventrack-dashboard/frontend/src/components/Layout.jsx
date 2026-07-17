import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h2 className="brand">InvenTrack</h2>
        <nav>
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/products">Products</NavLink>
          <NavLink to="/sales">Sales</NavLink>
        </nav>
        <div className="sidebar-footer">
          <span>{user?.name}</span>
          <button onClick={logout}>Log out</button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
