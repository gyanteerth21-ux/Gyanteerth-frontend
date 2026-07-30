import { useState, useMemo } from 'react';

const useStudentFilters = (students, uniqueStudents = []) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('All');
  const [progressFilter, setProgressFilter] = useState('All');
  const [collegeFilter, setCollegeFilter] = useState('All');
  const [branchFilter, setBranchFilter] = useState('All');
  const [degreeFilter, setDegreeFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');

  // We primarily use uniqueStudents for filters like Colleges, Branches, Years
  // to avoid duplication if students array contains flattened enrollments.
  const filterSource = uniqueStudents.length > 0 ? uniqueStudents : students;

  const uniqueColleges = useMemo(() => {
    const colleges = filterSource.map(s => s.college).filter(Boolean);
    return ['All Colleges', ...Array.from(new Set(colleges))];
  }, [filterSource]);

  const uniqueBranches = useMemo(() => {
    const branches = filterSource.map(s => s.branch).filter(Boolean);
    return ['All Branches', ...Array.from(new Set(branches))];
  }, [filterSource]);

  const uniqueDegrees = useMemo(() => {
    const degrees = filterSource.map(s => s.degree).filter(Boolean);
    return ['All Degrees', ...Array.from(new Set(degrees))];
  }, [filterSource]);

  const uniqueYears = useMemo(() => {
    const years = filterSource.map(s => s.year).filter(Boolean);
    return ['All Years', ...Array.from(new Set(years))];
  }, [filterSource]);

  const filteredStudents = useMemo(() => {
    return students.filter(st => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = (st.name || '').toLowerCase().includes(q) ||
        (st.email || '').toLowerCase().includes(q) ||
        (st.course_title || '').toLowerCase().includes(q);
      const matchesCourse = courseFilter === 'All' || st.course_id === courseFilter;
      const matchesCollege = collegeFilter === 'All' || st.college === collegeFilter;
      const matchesBranch = branchFilter === 'All' || st.branch === branchFilter;
      const matchesDegree = degreeFilter === 'All' || st.degree === degreeFilter;
      const matchesYear = yearFilter === 'All' || st.year === yearFilter;

      let matchesProgress = true;
      if (progressFilter === 'Completed') matchesProgress = st.progress === 100;
      else if (progressFilter === 'InProgress') matchesProgress = st.progress > 0 && st.progress < 100;
      else if (progressFilter === 'NotStarted') matchesProgress = st.progress === 0;

      return matchesSearch && matchesCourse && matchesCollege && matchesBranch && matchesDegree && matchesYear && matchesProgress;
    });
  }, [students, searchQuery, courseFilter, collegeFilter, branchFilter, degreeFilter, yearFilter, progressFilter]);

  const filteredUniqueStudents = useMemo(() => {
    return uniqueStudents.filter(st => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = (st.name || '').toLowerCase().includes(q) ||
        (st.email || '').toLowerCase().includes(q);
      const matchesCollege = collegeFilter === 'All' || st.college === collegeFilter;
      const matchesBranch = branchFilter === 'All' || st.branch === branchFilter;
      const matchesDegree = degreeFilter === 'All' || st.degree === degreeFilter;
      const matchesYear = yearFilter === 'All' || st.year === yearFilter;

      let matchesProgress = true;
      if (progressFilter === 'Completed') matchesProgress = st.avgProgress === 100;
      else if (progressFilter === 'InProgress') matchesProgress = st.avgProgress > 0 && st.avgProgress < 100;
      else if (progressFilter === 'NotStarted') matchesProgress = st.avgProgress === 0;

      return matchesSearch && matchesCollege && matchesBranch && matchesDegree && matchesYear && matchesProgress;
    });
  }, [uniqueStudents, searchQuery, collegeFilter, branchFilter, degreeFilter, yearFilter, progressFilter]);

  return {
    searchQuery, setSearchQuery,
    courseFilter, setCourseFilter,
    progressFilter, setProgressFilter,
    collegeFilter, setCollegeFilter,
    branchFilter, setBranchFilter,
    degreeFilter, setDegreeFilter,
    yearFilter, setYearFilter,
    uniqueColleges, uniqueBranches, uniqueDegrees, uniqueYears,
    filteredStudents, filteredUniqueStudents
  };
};

export default useStudentFilters;
