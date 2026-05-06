import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { USER_API, ADMIN_API } from '../config';

const EnrollmentContext = createContext(null);

/* ── Helpers ── */
const norm = (id) => (id === undefined || id === null || String(id) === 'NaN' || String(id) === 'undefined') ? null : String(id);

export const EnrollmentProvider = ({ children }) => {
  const { user, authFetch, smartFetch, clearCache, cacheSyncToken } = useAuth();

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [completedLessons, setCompletedLessons] = useState({});
  const [syncedLessons, setSyncedLessons] = useState({}); // 🚀 Backend-confirmed completions
  const [assessmentStats, setAssessmentStats] = useState({}); 
  const [lessonCounts, setLessonCounts] = useState({});



  /* 🚀 BACKGROUND SYNC MANAGER 🚀 */
  const [syncQueue, setSyncQueue] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('_gt_sync_queue') || '[]');
    } catch(e) { return []; }
  });

  const isSyncing = useRef(false);

  useEffect(() => {
    localStorage.setItem('_gt_sync_queue', JSON.stringify(syncQueue));
    
    // 🚀 CLEANUP: Auto-remove any "submit-assessment" from the queue. 
    // Assessments should never be background synced as they are sensitive to time and state.
    const hasAssessments = syncQueue.some(item => item.endpoint === 'submit-assessment');
    if (hasAssessments) {
      console.warn("🧹 Purging assessments from sync queue to prevent loops.");
      setSyncQueue(prev => prev.filter(item => item.endpoint !== 'submit-assessment'));
    }

    if (syncQueue.length > 0 && user?.user_id && navigator.onLine && !isSyncing.current) {
      const timer = setTimeout(() => {
        processSyncQueue();
      }, 5000); // Attempt sync every 5 seconds
      return () => clearTimeout(timer);
    }
  }, [syncQueue]);

  const processSyncQueue = async () => {
    if (syncQueue.length === 0 || !user?.user_id || !navigator.onLine || isSyncing.current) return;
    isSyncing.current = true;
    
    const item = syncQueue[0];

    // 🚀 CLEANUP: Remove any legacy "note" syncs from the queue
    if (item.payload?.video_id?.startsWith('NOTES-') || item.endpoint === 'mark-note-progress') {
      console.log("🧹 Cleaning up legacy note sync from queue...");
      setSyncQueue(prev => prev.slice(1));
      isSyncing.current = false;
      return;
    }

    try {
      console.log(`🚀 Retrying sync for ${item.endpoint}...`);
      await triggerProgressUpdate(item.endpoint, item.payload, item.courseId, true);
      // Success: Remove first item
      setSyncQueue(prev => prev.slice(1));
    } catch (err) {
      console.warn("Background sync failed, will retry later:", err);
      // Move to end of queue to try others first
      setSyncQueue(prev => [...prev.slice(1), prev[0]]);
    } finally {
      isSyncing.current = false;
    }
  };

  const addToSyncQueue = useCallback((endpoint, payload, courseId) => {
    setSyncQueue(prev => {
      const isDup = prev.some(item => 
        item.endpoint === endpoint && 
        JSON.stringify(item.payload) === JSON.stringify(payload)
      );
      if (isDup) return prev;
      return [...prev, { endpoint, payload, courseId }];
    });
  }, []);


  /* ── Initialization & Background Sync ── */
  useEffect(() => {
    let isMounted = true;

    const syncEnrollments = async () => {
      if (!user?.user_id) return;

      const baseData = await smartFetch(`${USER_API}/enrolled_courses`, { 
        cacheKey: `enrollments_${user.user_id}` 
      });

      if (!Array.isArray(baseData)) return;

      const normalizedBase = baseData.map(c => {
        const cid = norm(c.id || c.course_id || c.Course_id || c.Course_ID || c.courseId || c.CourseId || c.ID);
        const title = c.course_title || c.Course_Title || c.title || c.Title || c.courseTitle || 'Untitled Course';
        const type = (c.course_type || c.course_Type || c.Course_Type || c.type || c.Type || 'recorded').toLowerCase();
        return {
          ...c, id: cid, course_id: cid, title, course_title: title, type,
          progress: c.progress_percentage !== undefined ? c.progress_percentage : (c.progress || c.Progress || 0)
        };
      });

      if (isMounted) setEnrolledCourses(normalizedBase);

      const enrichedData = await Promise.all(normalizedBase.map(async (c) => {
        if (!c.id) return c;
        
        const [details, progressData] = await Promise.all([
          smartFetch(`${ADMIN_API}/course/${c.id}/full-details`, { cacheKey: `details_${c.id}` }),
          smartFetch(`${USER_API}/course/${c.id}/progress`, { cacheKey: `progress_${c.id}` })
        ]);

        const d = details?.course || details?.data || details || {};
        const p = progressData || {};

        // 🚨 ASSESSMENT GATE: Check for failed assessments
        let prog = p.progress_percentage !== undefined ? Number(p.progress_percentage) : (Number(p.progress) || c.progress || 0);
        const assessments = p.assessments_progress || p.assessments;
        if (Array.isArray(assessments) && prog >= 100) {
          const hasFailed = assessments.some(a => a.passed !== true && a.status !== 'Passed');
          if (hasFailed) prog = 99;
        }

        return {
          ...c,
          title: d.course_title || d.Course_Title || d.title || d.Title || c.title,
          thumbnail: d.thumbnail || d.Thumbnail || d.course_thumbnail || c.thumbnail,
          type: (d.course_type || d.type || c.type).toLowerCase(),
          level: d.level || d.course_level || c.level,
          category_name: d.category_name || d.Category || c.category_name,
          progress: prog,
          total_modules: p.total_modules || c.total_modules,
          completed_modules: p.completed_modules || c.completed_modules
        };
      }));

      if (isMounted) {
        setEnrolledCourses(enrichedData);
        // Populate syncedLessons for each course via fetchCourseProgress
        enrichedData.forEach(c => {
          if (c.id) fetchCourseProgress(c.id);
        });
      }
    };

    syncEnrollments();
    return () => { isMounted = false; };
  }, [user?.user_id, smartFetch, cacheSyncToken]);


  /* ── Local State Calculations ── */
  const getCourseProgress = useCallback((courseId) => {
    const sid = norm(courseId);
    if (!sid) return 0;
    
    const c = enrolledCourses.find(course => norm(course.id || course.course_id) === sid);
    return c?.progress || 0;
  }, [enrolledCourses]);

  const isEnrolled = useCallback((courseId) => {
    const cid = norm(courseId);
    return cid ? enrolledCourses.some(c => norm(c.id || c.course_id) === cid) : false;
  }, [enrolledCourses]);

  const isLessonComplete = useCallback((courseId, lessonId) => {
    const cid = norm(courseId);
    const lid = norm(lessonId);
    if (!cid || !lid) return false;
    // Strictly trust what the backend has confirmed (synced)
    return (syncedLessons[cid] || []).includes(lid);
  }, [syncedLessons]);

  const isLessonSynced = useCallback((courseId, lessonId) => {
    const cid = norm(courseId);
    const lid = norm(lessonId);
    if (!cid || !lid) return false;
    return (syncedLessons[cid] || []).includes(lid);
  }, [syncedLessons]);

  const getCompletedCount = useCallback((courseId) => {
    const cid = norm(courseId);
    if (!cid) return 0;
    return (syncedLessons[cid] || []).length;
  }, [syncedLessons]);

  /* ── Local Mutators ── */
  const markLessonComplete = useCallback((courseId, lessonId, totalLessons, isSynced = false) => {
    const cid = norm(courseId);
    const lid = norm(lessonId);
    if (!cid || !lid) return;
    
    if (isSynced) {
      setSyncedLessons(prev => {
        const current = prev[cid] || [];
        if (current.includes(lid)) return prev;
        return { ...prev, [cid]: [...current, lid] };
      });
    }

    if (totalLessons) {
      setLessonCounts(prev => ({ ...prev, [cid]: totalLessons }));
    }

    setCompletedLessons(prev => {
      const current = prev[cid] || [];
      if (current.includes(lid)) return prev;
      return { ...prev, [cid]: [...current, lid] };
    });
  }, []);

  const registerLessonCount = useCallback((courseId, total) => {
    const sId = norm(courseId);
    if (!sId || !total) return;
    setLessonCounts(prev => (prev[sId] === total ? prev : { ...prev, [sId]: total }));
  }, []);


  /* ── Backend Actions ── */
  const enroll = async (course) => {
    const cid = norm(course.id || course.course_id);
    if (!cid) return;

    setEnrolledCourses(prev => {
      if (prev.some(c => norm(c.id || c.course_id) === cid)) return prev;
      return [...prev, { ...course, id: cid, enrolledAt: new Date().toISOString(), progress: 0 }];
    });

    if (user?.user_id) {
      try {
        await authFetch(`${USER_API}/enroll_course`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.user_id, course_id: cid })
        });
        clearCache(`enrollments_${user.user_id}`);
      } catch (err) { console.error("Enrollment failed:", err); }
    }
  };

  const fetchCourseProgress = useCallback(async (courseId, force = false) => {
    const cid = norm(courseId);
    if (!cid) return null;
    
    let data;
    try {
      data = await smartFetch(`${USER_API}/course/${cid}/progress`, {
        cacheKey: `progress_${cid}`,
        forceRefresh: force
      });
    } catch (err) {
      console.error(`Failed to fetch progress for ${cid}:`, err);
      return null;
    }
    
    if (!data || typeof data !== 'object') return null;

    // 🚀 Rebuild lesson completions strictly from server data
    const passedLids = [];
    let hasFailedAssessment = false;
    let totalAssessments = 0;
    
    // A. Assessments — ONLY count if explicitly PASSED
    const assessmentsData = data.assessments_progress || data.assessments;
    if (Array.isArray(assessmentsData)) {
      const stats = {};
      assessmentsData.forEach(asm => {
        const lid = norm(asm.assessment_id);
        if (!lid) return;
        const key = lid.toLowerCase();
        const passed = asm.passed === true || asm.status === 'Passed';
        stats[key] = {
          attempts_used: Number(asm.attempts_used) || 0,
          best_score: Number(asm.best_score) || 0,
          passed: passed
        };
        totalAssessments++;
        if (passed) {
          passedLids.push(lid);
        } else {
          hasFailedAssessment = true;
        }
      });
      setAssessmentStats(prev => ({ ...prev, ...stats }));
    }

    // B. Videos / Lessons
    const lessonProgress = data.lessons_progress || data.videos_progress || data.videos;
    if (Array.isArray(lessonProgress)) {
      lessonProgress.forEach(l => {
        const lid = norm(l.video_id || l.lesson_id || l.id);
        if (!lid) return;
        if (l.status === 'Completed' || l.completed === true) passedLids.push(lid);
      });
    }

    // 🚨 ASSESSMENT GATE: Backend may say 100% but if ANY assessment is failed,
    // the course is NOT truly complete. Cap progress at 99% max.
    let backendProgress = data.progress_percentage !== undefined 
      ? Number(data.progress_percentage) 
      : (Number(data.progress) || 0);

    if (backendProgress >= 100 && hasFailedAssessment) {
      console.warn(`⚠️ Course ${cid}: Backend says 100% but ${totalAssessments > 0 ? 'has failed assessments' : 'assessments pending'}. Capping at 99%.`);
      backendProgress = 99;
    }

    // Update enrolled course with VERIFIED progress
    setEnrolledCourses(prev => prev.map(c => 
      norm(c.id || c.course_id) === cid 
      ? { 
          ...c, 
          progress: backendProgress,
          total_modules: data.total_modules || c.total_modules,
          completed_modules: data.completed_modules || c.completed_modules
        } 
      : c
    ));

    // 🚀 STRICT OVERWRITE — backend is the single source of truth
    setSyncedLessons(prev => ({ ...prev, [cid]: passedLids }));
    setCompletedLessons(prev => ({ ...prev, [cid]: passedLids }));

    return data;
  }, [smartFetch]);

  const triggerProgressUpdate = async (endpoint, payload, courseId, fromQueue = false) => {
    try {
      const response = await authFetch(`${USER_API}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response?.json();
      
      if (!response.ok) {
        throw new Error(data?.message || data?.error || 'Sync failed');
      }

      // 🚫 For assessments: NEVER auto-mark as complete here.
      // The student may have submitted but FAILED. Let fetchCourseProgress decide.
      if (endpoint !== 'submit-assessment') {
        const lessonId = payload.video_id || payload.live_class_id || payload.note_id;
        if (lessonId) {
          markLessonComplete(courseId, lessonId, null, true);
        }
      }

      // Always re-fetch progress from backend to get the truth
      clearCache(`progress_${courseId}`);
      await fetchCourseProgress(courseId, true); 
      
      return data;
    } catch (err) {
      console.error(`Failed ${endpoint}:`, err);
      if (!fromQueue && endpoint !== 'submit-assessment') {
        addToSyncQueue(endpoint, payload, courseId);
      }
      throw err;
    }
  };

  const markLiveAttendance = (courseId, liveClassId, moduleId, attendedLive, watchedRecording) => {
    return triggerProgressUpdate('mark-live-attendance', {
      live_class_id: String(liveClassId), module_id: String(moduleId),
      attended_live: !!attendedLive, watched_recording: !!watchedRecording
    }, courseId);
  };

  const markVideoProgress = (courseId, moduleId, videoId) => {
    return triggerProgressUpdate('mark-video-progress', {
      course_id: String(courseId), module_id: String(moduleId), video_id: String(videoId)
    }, courseId);
  };

  const submitAssessment = (courseId, moduleId, assessmentId, answers) => {
    return triggerProgressUpdate('submit-assessment', {
      course_id: String(courseId), module_id: String(moduleId),
      assessment_id: String(assessmentId), answers: answers
    }, courseId);
  };

  const markNoteProgress = (courseId, moduleId, noteId) => {
    // 🛑 Note progress is explicitly excluded as per requirements
    return Promise.resolve({ status: 'ignored' });
  };

  return (
    <EnrollmentContext.Provider value={{
      enrolledCourses,
      enroll, isEnrolled,
      registerLessonCount, getCourseProgress,
      markLessonComplete, isLessonComplete, isLessonSynced, getCompletedCount,
      markLiveAttendance, markVideoProgress, submitAssessment, fetchCourseProgress,
      markNoteProgress,
      completedLessons, assessmentStats, syncedLessons
    }}>
      {children}
    </EnrollmentContext.Provider>
  );
};

export const useEnrollment = () => useContext(EnrollmentContext);