import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { UserPlus } from 'lucide-react';

type AuthMode = 'login' | 'signup';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<AuthMode>('login');
    const { login, signup } = useAppContext();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Add validation for password length during signup
        if (mode === 'signup' && password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            setIsLoading(false);
            return;
        }

        // Supabase requires a valid email for username
        const usernameAsEmail = `${email}@health-monitor.local`;

        const action = mode === 'login' ? login : signup;
        const errorMessage = await action(usernameAsEmail, password);
        
        if (errorMessage) {
            setError(errorMessage);
        }
        setIsLoading(false);
    };

    const toggleMode = () => {
        setMode(prev => prev === 'login' ? 'signup' : 'login');
        setError('');
        setEmail('');
        setPassword('');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-slate-800">Monitor de Salud</h1>
                    <p className="mt-2 text-slate-500">
                        {mode === 'login' ? 'Por favor, inicie sesión para continuar.' : 'Cree una cuenta para empezar.'}
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            autoComplete="username"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Usuario"
                        />
                    </div>
                    <div>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Contraseña"
                        />
                    </div>
                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full px-4 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300 disabled:bg-blue-400 disabled:cursor-not-allowed"
                        >
                            {isLoading 
                                ? (mode === 'login' ? 'Accediendo...' : 'Creando cuenta...')
                                : (mode === 'login' ? 'Acceder' : 'Crear Cuenta')
                            }
                        </button>
                    </div>
                </form>
                <div className="text-center">
                    <button onClick={toggleMode} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                        {mode === 'login' ? '¿No tiene una cuenta? Regístrese' : '¿Ya tiene una cuenta? Inicie sesión'}
                    </button>
                </div>
            </div>
        </div>
    );
}