import { useState, useEffect } from "react";
import { getMe, logoutUser } from "../api/authApi";
import { useNavigate} from "react-router-dom";
import "../styles/account.css"
function Account() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    useEffect(() => {
        getMe() 
            .then(userData => {
                setUser(userData);
            })
            .catch(err => {
                console.error('Failed to fetch user: ', err);
            });
    }, []);

    const handleLogout = () =>{
        const success = logoutUser();
        if(success){
            navigate('/login');
        }
    }
    return (
        <main className="account">
            <h1>Добро пожаловать, {user?.first_name}!</h1>
            <div className="account-info">
                <h3>Данные аккаунта</h3>
                <div className="info">
                    <p className="info-name">Email:</p>
                    <p>{user?.email}</p>
                </div>
                <div className="info">
                    <p className="info-name">Имя:</p>
                    <p>{user?.first_name}</p>
                </div>
                <div className="info">
                    <p className="info-name">Фамилия:</p>
                    <p>{user?.last_name}</p>
                </div>
                <button type="button" className="logout-button" onClick={handleLogout}>Выйти</button>
            </div>
        </main>
    );
}

export default Account;