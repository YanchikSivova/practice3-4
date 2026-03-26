import { useEffect, useState } from "react"
import { getUsers, setUserRole } from "../api/adminApi"
import { getMe } from "../api/authApi";
import '../styles/admin.css'
function Admin() {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [updatingUserId, setUpdatingUserId] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    const loadCurrentUser = async() => {
        try{
            const user = await getMe();
            setCurrentUser(user);
        }catch(err){
            console.error("Ошибка загрузки текущего пользователя", err);
        }
    }

    const loadUsers = async () => {
        try {
            const data = await getUsers();
            setUsers(data);
            setError(null);
        } catch (err) {
            setError(err?.response?.data?.message || "Ошибка загрузки пользователей");
        }
    };

    useEffect(() => {
        loadCurrentUser();
        loadUsers();
    }, []);

    const handleRoleChange = async (userId, currentRole) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        try {
            setUpdatingUserId(userId);
            await setUserRole(userId, newRole);

            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user.id === userId ? { ...user, role: newRole } : user
                )
            );
        } catch (err) {
            setError(err?.response?.data?.message || "Ошибка обновления роли");
        }
    };

    const filteredUsers = users.filter(user => user.id !== currentUser?.id);
    return (
        <main className="admin">
            <h1>Управление пользователями</h1>
            {filteredUsers.length === 0 ? (
                <p>Пользователи не найдены</p>
            ) : (
                <div className="users-table-container">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>Email</th>
                                <th>Имя</th>
                                <th>Фамилия</th>
                                <th>Администратор</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id}>
                                    <td>{user.email}</td>
                                    <td>{user.first_name}</td>
                                    <td>{user.last_name}</td>
                                    <td className="checkbox-cell">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={user.role === 'admin'}
                                                onChange={() => handleRoleChange(user.id, user.role)}
                                            />
                                        </label>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </main>
    );
}

export default Admin;