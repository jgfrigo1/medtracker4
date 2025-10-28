import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAppContext } from '../../context/AppContext';
import { UserPlus, Edit, Trash2, KeyRound, X, Check } from 'lucide-react';

export default function UserManagement() {
    const { currentUser, logout } = useAppContext();
    const [users, setUsers] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Add user state
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [addError, setAddError] = useState('');

    // Edit user state
    const [editingUser, setEditingUser] = useState<string | null>(null);
    const [editPassword, setEditPassword] = useState('');

    const fetchUsers = async () => {
        setIsLoading(true);
        const userList = await api.getUsers();
        setUsers(userList);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUsername.trim() || !newPassword.trim()) {
            setAddError('Usuario y contraseña son requeridos.');
            return;
        }
        setIsSubmitting(true);
        setAddError('');
        const result = await api.addUser(newUsername.trim(), newPassword.trim());
        if (result.success) {
            setNewUsername('');
            setNewPassword('');
            await fetchUsers();
        } else {
            setAddError(result.message || 'Error al añadir usuario.');
        }
        setIsSubmitting(false);
    };

    const handleDeleteUser = async (username: string) => {
        if (window.confirm(`¿Está seguro de que desea eliminar al usuario "${username}"? Esta acción no se puede deshacer.`)) {
            setIsSubmitting(true);
            await api.deleteUser(username);
            // If the deleted user is the current user, log out
            if (currentUser?.username === username) {
                logout();
            } else {
                await fetchUsers();
            }
            setIsSubmitting(false);
        }
    };
    
    const handleUpdatePassword = async (username: string) => {
        if (!editPassword.trim()) return;
        setIsSubmitting(true);
        await api.updateUserPassword(username, editPassword.trim());
        setEditingUser(null);
        setEditPassword('');
        setIsSubmitting(false);
    };

    const startEditing = (username: string) => {
        setEditingUser(username);
        setEditPassword('');
    };

    if (isLoading) {
        return <div className="text-center p-8">Cargando usuarios...</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Add User Form */}
            <div className="md:col-span-1">
                 <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <UserPlus size={22} /> Añadir Nuevo Usuario
                    </h2>
                    <form onSubmit={handleAddUser} className="space-y-4">
                        <div>
                            <label htmlFor="new-username" className="block text-sm font-medium text-slate-600 mb-1">Usuario</label>
                            <input
                                id="new-username"
                                type="text"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                className="w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="nombredeusuario"
                                disabled={isSubmitting}
                            />
                        </div>
                        <div>
                             <label htmlFor="new-password"className="block text-sm font-medium text-slate-600 mb-1">Contraseña</label>
                            <input
                                id="new-password"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="••••••••"
                                disabled={isSubmitting}
                            />
                        </div>
                        {addError && <p className="text-sm text-red-500">{addError}</p>}
                        <button type="submit" disabled={isSubmitting} className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:bg-blue-400">
                            {isSubmitting ? 'Añadiendo...' : 'Añadir Usuario'}
                        </button>
                    </form>
                </div>
            </div>

            {/* User List */}
            <div className="md:col-span-2">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-700 mb-4">Lista de Usuarios</h2>
                    <div className="space-y-3">
                        {users.map(user => (
                            <div key={user} className="p-3 bg-slate-50 rounded-lg">
                                {editingUser === user ? (
                                    <div className="space-y-2">
                                        <p className="font-semibold text-slate-800">{user}</p>
                                        <div className="flex items-center gap-2">
                                            <KeyRound size={16} className="text-slate-500"/>
                                            <input
                                                type="password"
                                                placeholder="Nueva contraseña"
                                                value={editPassword}
                                                onChange={(e) => setEditPassword(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleUpdatePassword(user)}
                                                className="flex-grow p-1 border-b-2 border-blue-500 focus:outline-none bg-transparent"
                                                autoFocus
                                                disabled={isSubmitting}
                                            />
                                            <button onClick={() => handleUpdatePassword(user)} disabled={isSubmitting || !editPassword.trim()} className="p-2 text-slate-500 hover:text-green-600 hover:bg-slate-200 rounded-full flex items-center gap-1 text-sm">
                                                <Check size={16}/> Guardar
                                            </button>
                                            <button onClick={() => setEditingUser(null)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-slate-200 rounded-full">
                                                <X size={16}/>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-800 font-medium">
                                            {user} {currentUser?.username === user && <span className="text-xs text-blue-600 font-normal ml-2">(Sesión actual)</span>}
                                        </span>
                                        <div className="flex gap-2">
                                            <button onClick={() => startEditing(user)} disabled={isSubmitting} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-200 rounded-full" title="Cambiar contraseña">
                                                <Edit size={16}/>
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteUser(user)} 
                                                disabled={isSubmitting || currentUser?.username === user} 
                                                className="p-2 text-slate-500 hover:text-red-600 hover:bg-slate-200 rounded-full disabled:text-slate-300 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                                                title={currentUser?.username === user ? 'No puede eliminar su propia cuenta' : 'Eliminar usuario'}
                                            >
                                                <Trash2 size={16}/>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}