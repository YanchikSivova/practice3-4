import { Link, useLocation } from "react-router-dom";
import { getMe } from "../api/authApi";
import { useEffect, useState } from "react";
import "../styles/Navigation.css";
function Navigation(){
    const location = useLocation();
    const [user, setUser] = useState(null);
    useEffect(()=>{
        getMe()
            .then(userData => {
                setUser(userData);
            })
            .catch(err => {
                console.error('Failed to fetch user: ', err);
            });
    }, []);
    return (
    <nav className="main-navigation">
        <ul className="nav-menu">
            <li>
                <Link to="/" className={location.pathname === '/'? 'active' : ''}>
                Главная
                </Link>
            </li>
            <li>
                {user && (
                    <Link to="/account" className={location.pathname === '/account'? 'active': ''}>
                        Аккаунт
                    </Link>
                )}
                {!user && (
                    <Link to="/login" className={location.pathname === '/login'? "active" : ''}>
                        Войти
                    </Link>
                )}
            </li>
        </ul>
    </nav>
    );
}

export default Navigation;