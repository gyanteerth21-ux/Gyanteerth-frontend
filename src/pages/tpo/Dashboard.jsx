import React from 'react';
import { useAuth } from '../../shared/AuthContext';
import { Users, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const TpoDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="dashboard-page">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
          Welcome back, {user?.name}! 👋
        </h1>
        <p style={{ color: 'var(--color-text-muted)', margin: '0.5rem 0 0 0' }}>
          TPO Portal - {user?.college || 'Your College'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <motion.div 
          whileHover={{ y: -5 }}
          onClick={() => navigate('/tpo/students')}
          className="card"
          style={{ padding: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}
        >
          <div style={{ padding: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-lg)' }}>
            <Users size={24} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>My Students</h3>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              View and track student progress
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TpoDashboard;
