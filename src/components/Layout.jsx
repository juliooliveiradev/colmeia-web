import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="hex" aria-hidden="true" />
          <div>
            <strong>Colmeia Urbana</strong>
            <small>Apiários comunitários</small>
          </div>
        </div>
        <nav>
          <NavLink to="/" end>
            Painel
          </NavLink>
          <NavLink to="/colmeias">Colmeias</NavLink>
        </nav>
        <div className="sidebar-user">
          <p>{user?.name}</p>
          <button type="button" className="link-button" onClick={logout}>
            Sair
          </button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
