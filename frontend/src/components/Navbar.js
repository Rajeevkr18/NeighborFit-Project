"use client"

/**
 * Navigation Bar Component
 * Responsive navigation with authentication-aware menu items
 */

import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import "./Navbar.css"

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          {/* Brand logo and name */}
          <Link to="/" className="navbar-brand">
            <span className="brand-icon">🏘️</span>
            NeighborFit
          </Link>

          <div className="navbar-menu">
            <Link to="/neighborhoods" className="navbar-link">
              Explore
            </Link>

            {/* Conditional menu based on authentication status */}
            {isAuthenticated ? (
              <>
                <Link to="/matching" className="navbar-link">
                  Find Matches
                </Link>
                <Link to="/dashboard" className="navbar-link">
                  Dashboard
                </Link>

                {/* User dropdown menu */}
                <div className="navbar-user">
                  <span className="user-name">Hi, {user?.name}</span>
                  <div className="user-dropdown">
                    <Link to="/profile" className="dropdown-item">
                      Profile
                    </Link>
                    <button onClick={handleLogout} className="dropdown-item">
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="navbar-auth">
                <Link to="/login" className="navbar-link">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
