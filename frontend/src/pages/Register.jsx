import { useState } from "react";
import { registerUser } from "../api/authApi";
import { useNavigate } from "react-router-dom";
import '../styles/register.css'
function Register() {
    const [formData, setFormData] = useState({
        email: '',
        first_name: '',
        last_name: '',
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
    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validateFrom();
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }
        const success = await registerUser({
            email: formData.email,
            first_name: formData.first_name,
            last_name: formData.last_name,
            password: formData.password
        });
        if (success) {
            navigate('/login');
        }
    };


    const validateFrom = () => {
        const errors = {};
        if (!formData.email) {
            errors.email = 'Email обязателен';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Введите корректный email';
        }
        if (!formData.first_name) {
            errors.password = 'Имя обязательно';
        }
        if (!formData.last_name) {
            errors.last_name = 'Фамилия обязательна'
        }
        if (!formData.password) {
            errors.password = 'Пароль обязателен';
        }
        return errors;
    };
    const goToLogin = () => {
        navigate('/login')
    };
    return (
        <main className="register">
            <h1>Зарегистрироваться</h1>
            <form className="register-form" onSubmit={handleSubmit}>
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
                    <label>Имя</label>
                    <div>
                        <input
                            type="text"
                            id="first_name"
                            placeholder="your_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            className={validationErrors.first_name ? 'error' : ''}
                            required />
                    </div>
                    {validationErrors.first_name &&
                        <p className="field-error" style={{ color: 'red', fontSize: '12px' }}>
                            {validationErrors.first_name}
                        </p>
                    }
                </div>
                <div className="form-group">
                    <label>Фамилия</label>
                    <div>
                        <input
                            type="text"
                            id="last_name"
                            placeholder="your_surname"
                            value={formData.last_name}
                            onChange={handleChange}
                            className={validationErrors.last_name ? 'error' : ''}
                            required />
                    </div>
                    {validationErrors.last_name &&
                        <p className="field-error" style={{ color: 'red', fontSize: '12px' }}>
                            {validationErrors.last_name}
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
                    Регистрация
                </button>
            </form>
            <p className="login-footer">
                Есть аккаунт?
                <span onClick={goToLogin} style={{ cursor: 'pointer', fontWeight: '600' }}> Вход</span>
            </p>
        </main>
    );
};

export default Register;