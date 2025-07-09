"use client"

/**
 * Home Page Component
 * Landing page with hero section, features, and call-to-action
 */

import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import "./Home.css"

const Home = () => {
  const { isAuthenticated } = useAuth()

  return (
    <div className="home">
      {/* Hero section with main value proposition */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div>
              <h1 className="hero-title">
                Find Your Perfect
                <span className="text-gradient"> Neighborhood</span>
              </h1>
              <p className="hero-subtitle">
                Discover neighborhoods that match your lifestyle, preferences, and budget. Our AI-powered matching
                algorithm analyzes thousands of data points to find your ideal home.
              </p>

              {/* Dynamic CTA based on authentication status */}
              <div className="hero-actions">
                {isAuthenticated ? (
                  <Link to="/matching" className="btn btn-primary btn-large">
                    Find My Match
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="btn btn-primary btn-large">
                      Get Started Free
                    </Link>
                    <Link to="/neighborhoods" className="btn btn-outline btn-large">
                      Explore Neighborhoods
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Visual example of neighborhood match */}
            <div className="hero-image">
              <div className="hero-card">
                <div className="card-header">
                  <h3>Your Perfect Match</h3>
                  <span className="match-score">94% Match</span>
                </div>
                <div className="card-content">
                  <h4>Downtown District</h4>
                  <p>Urban lifestyle • Great walkability • Excellent dining</p>
                  <div className="features">
                    <span className="feature">🚶‍♂️ Walkable</span>
                    <span className="feature">🏫 Great Schools</span>
                    <span className="feature">🛡️ Safe</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature highlights section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">How NeighborFit Works</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Smart Analysis</h3>
              <p>
                Our algorithm analyzes walkability, safety, schools, amenities, and more to understand each
                neighborhood's character.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Personal Matching</h3>
              <p>Tell us your preferences, budget, and lifestyle needs. We'll find neighborhoods that fit perfectly.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🗺️</div>
              <h3>Explore & Compare</h3>
              <p>View detailed neighborhood profiles, compare options, and save your favorites for later.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics to build credibility */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">10,000+</div>
              <div className="stat-label">Neighborhoods Analyzed</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">50+</div>
              <div className="stat-label">Data Points Per Area</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">95%</div>
              <div className="stat-label">User Satisfaction</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Real-time Updates</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final call-to-action */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Find Your Perfect Neighborhood?</h2>
            <p>Join thousands of users who have found their ideal home with NeighborFit</p>
            {!isAuthenticated && (
              <Link to="/register" className="btn btn-primary btn-large">
                Start Your Search Today
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
