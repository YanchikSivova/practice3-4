import React, { useState } from "react";
import { loginUser } from "../api/authApi";
import { useNavigate } from "react-router-dom";
import Home from "./Home";
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
        const success = await loginUser(formData.email, formData.password);
        if (success) {
            navigate('/account');
        }
    };

    const goToRegister = () =>{
        navigate('/register')
    };

    return (
        <div className="login">
            <h1>Войти</h1>
            <form className="login-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Email</label>
                    <input
                    type="email"
                    id="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={validationErrors.email? 'error':''}
                    required/>
                    <p className="field-error" style={{color: 'red', fontSize:'12px'}}>
                        {validationErrors.email}
                    </p>
                </div>
                <div className="form-group">
                    <label>Пароль</label>
                    <input
                    type="password"
                    id="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className={validationErrors.password? 'error':''}
                    required/>
                    <p className="field-error" style={{color: 'red', fontSize:'12px'}}>
                        {validationErrors.password}
                    </p>
                </div>
                <button 
                type="submit"
                className="submit-button">
                    Вход
                </button>
                <p className="login-footer">
                    Нет аккаунта?
                    <span onClick={goToRegister} style={{cursor: 'pointer'}}> Pегистрация</span>
                </p>
            </form>
        </div>
    );
}

export default Login;