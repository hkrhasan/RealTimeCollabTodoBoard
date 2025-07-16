import type React from "react";
import type { FC } from "react";
import useAuth from "../../hooks/useAuth";
import './Header.css'

type HeaderProps = React.ComponentProps<"div"> & {
}

const Header: FC<HeaderProps> = ({ className = '', ...props }) => {
  const { logout } = useAuth();
  return <div className={`header ${className}`} {...props}>
    <div className="header-identity">
      <h2>Collab Task</h2>
      <p className="header-description">Real-time collaborate task management</p>
    </div>
    <div className="header-actions">
      <button className="button" onClick={logout}>Logout</button>
    </div>
  </div>
}

export default Header 
