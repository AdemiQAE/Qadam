import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

function Register() {
    const { t } = useContext(AppContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password.length < 6) {
            setError('Құпиясөз кем дегенде 6 таңбадан тұруы керек');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Құпиясөздер сәйкес келмейді');
            return;
        }
        
        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password })
            });
            const data = await response.json();
            
            if (response.ok) {
                navigate('/login');
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Серверге қосылу мүмкін болмады');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>{t('register') || 'Тіркелу'}</h2>
            {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '10px' }}>{error}</p>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input 
                    type="text" 
                    required 
                    placeholder="Аты-жөніңіз" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-main)' }}
                />
                <input 
                    type="email" 
                    required 
                    placeholder="Email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-main)' }}
                />
                <input 
                    type="password" 
                    required 
                    placeholder="Құпиясөз" 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-main)' }}
                />
                <input 
                    type="password" 
                    required 
                    placeholder="Құпиясөзді растау" 
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-main)' }}
                />
                <button type="submit" className="btn">Тіркелу</button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '15px' }}>
                Аккаунтыңыз бар ма? <Link to="/login" style={{ color: 'var(--primary-color)' }}>Кіру</Link>
            </p>
        </div>
    );
}

export default Register;
