import { useState } from 'react';
import LoginForm, { type LoginValues } from '../../components/LoginForm';
import './AuthPage.css'
import RegisterForm from '../../components/RegisterForm';


function AuthPage() {
  const [currentPage, setCurrentPage] = useState<"login" | "register">("login")
  const [credentials, setCredentials] = useState<LoginValues | undefined>(undefined)

  return <div className="auth-container grid">
    <div className="auth-left-column"></div>
    <div className="auth-right-column">
      {currentPage === "login" ? <LoginForm onRegisterClick={() => setCurrentPage('register')} credentials={credentials} /> : <RegisterForm onLoginClick={() => setCurrentPage("login")} postRegister={setCredentials} />}
    </div>
  </div>
}

export default AuthPage;