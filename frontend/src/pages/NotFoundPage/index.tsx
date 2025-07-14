"use client"

import type React from "react"
import "./NotFoundPage.css"

interface NotFoundPageProps {
  onGoHome?: () => void
}

const NotFoundPage: React.FC<NotFoundPageProps> = ({ onGoHome }) => {
  return (
    <div className="notfoundpage-container">
      <div className="notfoundpage-content">
        <div className="notfoundpage-icon">404</div>
        <h1 className="notfoundpage-title">Page Not Found</h1>
        <p className="notfoundpage-description">The page you're looking for doesn't exist or has been moved.</p>
        <button onClick={onGoHome} className="button">
          Go Home
        </button>
      </div>
    </div>
  )
}

export default NotFoundPage
