import React, { useState } from "react";
import { loginUser } from "../api/authApi";
import { useNavigate } from "react-router-dom";
import "../styles/login.css"
function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [validationErrors, setValidationErrors] = useState({});
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
        setValidationErrors(prev => ({
            ...prev,
            [id]: ''
        }));
    };

    const validateFrom = () => {
        const errors = {};
        if (!formData.email) {
            errors.email = 'Email обязателен';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Введите корректный email';
        }
        if (!formData.password) {
            errors.password = 'Пароль обязателен';
        }
        return errors;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validateFrom();
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }
        const success = await loginUser({
            email: formData.email,
            password: formData.password
        });
        if (success) {
            navigate('/account');
        }
    };

    const goToRegister = () => {
        navigate('/register')
    };

    return (
        <main className="login">
            <h1>Войти</h1>
            <form className="login-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Email</label>
                    <div>
                        <input
                            type="email"
                            id="email"
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            className={validationErrors.email ? 'error' : ''}
                            required />
                    </div>
                    {validationErrors.email &&
                        <p className="field-error" style={{ color: 'red', fontSize: '12px' }}>
                            {validationErrors.email}
                        </p>
                    }
                </div>
                <div className="form-group">
                    <label>Пароль</label>
                    <div>
                        <input
                            type="password"
                            id="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            className={validationErrors.password ? 'error' : ''}
                            required />
                    </div>
                    {validationErrors.password &&
                        <p className="field-error" style={{ color: 'red', fontSize: '12px' }}>
                            {validationErrors.password}
                        </p>
                    }
                </div>
                <button
                    type="submit"
                    className="submit-button">
                    Вход
                </button>
            </form>
            <p className="login-footer">
                Нет аккаунта?
                <span onClick={goToRegister} style={{ cursor: 'pointer', fontWeight: '600' }}> Pегистрация</span>
            </p>
        </main>
    );
}

export default Login;