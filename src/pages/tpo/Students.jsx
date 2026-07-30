import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../shared/AuthContext';
import { Search, Users, Loader2, AlertCircle, ChevronDown, Filter } from 'lucide-react';
import { API_BASE, USER_API } from '../../config';
import ExportExcelButton from '../../components/ExportExcelButton';
import useStudentFilters from '../../hooks/useStudentFilters';
import { fetchCollegesAndBranchesMap } from '../../utils/mappingUtils';

const TpoStudents = () => {
  const { user, authFetch } = useAuth();
  const [students, setStudents] = useState([]);
  const [uniqueStudents, setUniqueStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [globalColleges, setGlobalColleges] = useState([]);
  const [globalBranches, setGlobalBranches] = useState([]);
  const [globalDegrees, setGlobalDegrees] = useState([]);

  const {
    searchQuery, setSearchQuery,
    progressFilter, setProgressFilter,
    branchFilter, setBranchFilter,
    degreeFilter, setDegreeFilter,
    yearFilter, setYearFilter,
    filteredUniqueStudents
  } = useStudentFilters(students, uniqueStudents);

  const fetchStudents = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const [res, { colMap, brMap, degMap }] = await Promise.all([
        authFetch(`${API_BASE}/tpo/students`),
        fetchCollegesAndBranchesMap(authFetch, USER_API)
      ]);
      
      setGlobalColleges(Object.values(colMap));
      setGlobalBranches(Object.values(brMap));
      setGlobalDegrees(Object.values(degMap));
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to fetch students');

      const studentsData = data.data || [];
      let allStudents = [];
      
      studentsData.forEach(st => {
          st.college = colMap[st.college] || st.college || '';
          st.branch = brMap[st.branch] || st.branch || '';
          st.degree = degMap[st.degree] || st.degree || '';

          if (st.enrollments) {
            st.enrollments.forEach(enr => {
              allStudents.push({
                id: `${enr.course_id}-${st.user_id}`,
                course_id: enr.course_id,
                email: st.email || st.user_id,
                name: st.name || 'Anonymous Student',
                progress: enr.progress || 0,
                course_title: enr.course_title,
                college: st.college || '',
                branch: st.branch || '',
                degree: st.degree || '',
                year: st.year || ''
              });
            });
          } else {
             // For students without enrollments
              allStudents.push({
                id: `no-course-${st.user_id}`,
                course_id: null,
                email: st.email || st.user_id,
                name: st.name || 'Anonymous Student',
                progress: 0,
                course_title: null,
                college: st.college || '',
                branch: st.branch || '',
                degree: st.degree || '',
                year: st.year || ''
              });
          }
      });

      setStudents(allStudents);
      setUniqueStudents(studentsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, authFetch]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return (
    <div className="users-page" style={{ paddingBottom: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
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

      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '1.25rem', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', outline: 'none' }}
            />
          </div>
          <ExportExcelButton data={filteredUniqueStudents} filename="TPO_Students_List" sheetName="Students" />
        </div>

        {/* FILTERS */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <select
              value={progressFilter}
              onChange={(e) => setProgressFilter(e.target.value)}
              style={{ appearance: 'none', padding: '0.75rem 2.25rem 0.75rem 1rem', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text)', outline: 'none', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', minWidth: '130px', maxWidth: '180px', textOverflow: 'ellipsis' }}
            >
              <option value="All">All Progress</option>
              <option value="Completed">Completed (100%)</option>
              <option value="InProgress">In Progress (1-99%)</option>
              <option value="NotStarted">Not Started (0%)</option>
            </select>
            <Filter size={14} style={{ position: 'absolute', right: '1.15rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
          </div>

          <div style={{ position: 'relative' }}>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              style={{ appearance: 'none', padding: '0.75rem 2.25rem 0.75rem 1rem', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text)', outline: 'none', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', minWidth: '130px', maxWidth: '180px', textOverflow: 'ellipsis' }}
            >
              <option value="All">All Branches</option>
              {globalBranches.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '1.15rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
          </div>

          <div style={{ position: 'relative' }}>
            <select
              value={degreeFilter}
              onChange={(e) => setDegreeFilter(e.target.value)}
              style={{ appearance: 'none', padding: '0.75rem 2.25rem 0.75rem 1rem', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text)', outline: 'none', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', minWidth: '140px', maxWidth: '180px', textOverflow: 'ellipsis' }}
            >
              <option value="All">All Degrees</option>
              {globalDegrees.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '1.15rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
          </div>

          <div style={{ position: 'relative' }}>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              style={{ appearance: 'none', padding: '0.75rem 2.25rem 0.75rem 1rem', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text)', outline: 'none', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', minWidth: '110px' }}
            >
              <option value="All">All Years</option>
              {['1', '2', '3', '4', '5'].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '1.15rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
          </div>
        </div>
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
                <th style={{ padding: '1rem' }}>Enrolled Courses</th>
                <th style={{ padding: '1rem' }}>Avg Progress</th>
              </tr>
            </thead>
            <tbody>
              {filteredUniqueStudents.length === 0 ? (
                <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No students found matching your criteria.</td></tr>
              ) : (
                filteredUniqueStudents.map(student => (
                  <tr key={student.user_id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600 }}>{student.name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{student.email}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontSize: '0.9rem' }}>{student.branch || 'N/A'}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{student.year ? `Year ${student.year}` : 'N/A'}</div>
                    </td>
                    <td style={{ padding: '1rem', minWidth: '220px' }}>
                      {student.enrollments && student.enrollments.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          {student.enrollments.map((course, idx) => (
                            <div key={idx} style={{ fontSize: '0.75rem', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', padding: '0.35rem 0.6rem', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }} title={course.course_title}>{course.course_title}</span>
                              <span style={{ color: 'var(--color-primary)', fontWeight: 800 }}>{course.progress}%</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Not Enrolled</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ flex: 1, height: '8px', backgroundColor: 'var(--color-surface-muted)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${student.avgProgress || 0}%`, backgroundColor: 'var(--color-primary)' }} />
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{student.avgProgress || 0}%</span>
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
