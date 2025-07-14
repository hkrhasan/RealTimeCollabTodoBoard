import { useState } from 'react';
import LoginForm from '../../components/LoginForm';
import './AuthPage.css'
import RegisterForm from '../../components/RegisterForm';


function AuthPage() {
  const [currentPage, setCurrentPage] = useState<"login" | "register">("login")

  return <div className="auth-container">
    <div className="auth-left-column"></div>
    <div className="auth-right-column">
      {currentPage === "login" ? <LoginForm onRegisterClick={() => setCurrentPage('register')} /> : <RegisterForm onLoginClick={() => setCurrentPage("login")} />}
    </div>
  </div>
}

export default AuthPage;