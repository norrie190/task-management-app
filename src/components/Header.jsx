import { Link } from 'react-router-dom';
import '../styles/header.css';

export default function Header() {
  return (
    <header className="premium-header">
      <div className="header-main">
        <h1 className="app-title">TaskFlow</h1>
        <div className="subtitle-buttons">
          <Link to="/dashboard" className="subtitle-button">Dashboard</Link>
          <Link to="/admin" className="subtitle-button">Admin</Link>
        </div>
      </div>
    </header>
  );
}