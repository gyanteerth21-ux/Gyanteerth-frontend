import React, { useState, useEffect } from 'react';
import { Search, Users, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../shared/AuthContext';
import { getHeaders, USER_API } from '../../config';
import ExportExcelButton from '../../components/ExportExcelButton';

const TpoStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, authFetch } = useAuth();
  
  // Base API without specific endpoint suffix, as we are calling TPO API
  const API_BASE = 'http://localhost:8000/gyantreeth/v1';

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const [res, colRes, branchRes] = await Promise.all([
          authFetch(`${API_BASE}/tpo/students`),
          authFetch(`${USER_API}/colleges`).catch(() => null),
          authFetch(`${USER_API}/branches`).catch(() => null)
        ]);
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Failed to fetch students');
        
        const colData = colRes && colRes.ok ? await colRes.json() : null;
        const branchData = branchRes && branchRes.ok ? await branchRes.json() : null;

        let colMap = {};
        if (colData && colData.data) {
          (colData.data || []).forEach(c => colMap[c.College_ID] = c.College_Name);
        }
        
        let branchMap = {};
        if (branchData && branchData.data) {
          (branchData.data || []).forEach(b => branchMap[b.branch_id] = b.branch_name);
        }

        const studentsData = data.data || [];
        studentsData.forEach(st => {
            st.college = colMap[st.college] || st.college || '';
            st.branch = branchMap[st.branch] || st.branch || '';
        });

        setStudents(studentsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(student => 
    student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="users-page" style={{ paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Users className="text-primary" size={28} />
            My College Students
          </h1>
          <p style={{ color: 'var(--color-text-muted)', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
            View and track progress of students from {user?.college}
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
          />
        </div>
        <ExportExcelButton data={filteredStudents} filename="TPO_Students_List" sheetName="Students" />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <Loader2 className="spin text-primary" size={32} />
        </div>
      ) : error ? (
        <div className="alert-error" style={{ padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={20} />
          {error}
        </div>
      ) : (
        <div className="table-responsive card" style={{ overflow: 'hidden' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-surface-muted)', textAlign: 'left' }}>
                <th style={{ padding: '1rem' }}>Student Details</th>
                <th style={{ padding: '1rem' }}>Branch & Year</th>
                <th style={{ padding: '1rem' }}>Avg Progress</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr><td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No students found in your college.</td></tr>
              ) : (
                filteredStudents.map(student => (
                  <tr key={student.user_id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600 }}>{student.name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{student.email}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontSize: '0.9rem' }}>{student.branch || 'N/A'}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{student.year ? `Year ${student.year}` : 'N/A'}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ flex: 1, height: '8px', backgroundColor: 'var(--color-surface-muted)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${student.avgProgress}%`, backgroundColor: 'var(--color-primary)' }} />
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{student.avgProgress}%</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TpoStudents;
