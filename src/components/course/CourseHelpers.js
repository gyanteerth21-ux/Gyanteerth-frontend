export const norm = (id) => (id === undefined || id === null || String(id) === 'NaN' || String(id) === 'undefined') ? null : String(id);

export function buildLessons(modules, courseNotes) {
  const lessons = [];

  // 0. Course-Level Notes
  (courseNotes || []).forEach((n, ni) => {
    lessons.push({
      id: n.notes_id || n.note_id || n.Notes_ID || n.id,
      moduleId: 'global-resources',
      moduleTitle: 'General Resources',
      title: n.title || n.Title || `Resource ${ni + 1}`,
      type: 'note',
      url: n.note_url || n.file_url || n.Note_URL || n.File_URL
    });
  });

  (modules || []).forEach(mod => {
    const vc = mod.content?.videos || mod.video || [];
    const lc = mod.content?.live_sessions || mod.live_sessions || [];
    const nc = mod.content?.notes || mod.notes || [];
    const ac = mod.content?.assessments || mod.assessments || [];

    // 1. Videos
    vc.forEach((v, vi) => {
      lessons.push({
        id: v.video_id || v.Video_ID,
        moduleId: mod.module_id || mod.Module_ID,
        moduleTitle: mod.title || mod.Title,
        title: v.description || v.course_description || v.Title || v.title || `Video ${vi + 1}`,
        type: 'video',
        url: v.video_url || v.Video_URL
      });
    });

    // 2. Live Sessions
    lc.forEach((ls, li) => {
      lessons.push({
        id: ls.live_id || ls.Live_ID,
        moduleId: mod.module_id || mod.Module_ID,
        moduleTitle: mod.title || mod.Title,
        title: ls.title || ls.Title || `Live Session ${li + 1}${ls.provider ? ' — ' + ls.provider : ''}`,
        type: 'live',
        url: ls.meeting_url || ls.Meeting_URL,
        start_time: ls.start_time || ls.Start_time,
        end_time: ls.end_time || ls.End_time,
        status: ls.status || ls.Status,
        recordings: ls.recordings || []
      });
    });

    // 3. Notes
    nc.forEach((n, ni) => {
      lessons.push({
        id: n.notes_id || n.note_id || n.Notes_ID || n.id,
        moduleId: mod.module_id || mod.Module_ID,
        moduleTitle: mod.title || mod.Title,
        title: n.title || n.Title || `Resource ${ni + 1}`,
        type: 'note',
        url: n.note_url || n.file_url || n.Note_URL || n.File_URL
      });
    });

    // 4. Assessments
    ac.forEach(a => {
      lessons.push({
        id: a.assessment_id || a.Assessment_ID,
        moduleId: mod.module_id || mod.Module_ID,
        moduleTitle: mod.title || mod.Title,
        title: a.title || a.Title,
        type: 'assessment',
        totalMark: a.total_mark || a.Total_Mark,
        passingMark: a.passing_mark || a.Passing_Mark,
        duration: a.duration || a.Duration,
        attemptLimit: (a.attempt_limit !== undefined && a.attempt_limit !== null) ? a.attempt_limit : a.Attempt_Limit,
        questions: a.questions || []
      });
    });
  });
  return lessons;
}

export function getEmbedUrl(url) {
  if (!url) return null;

  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const m = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
    if (m) {
      const baseUrl = `https://www.youtube.com/embed/${m[1]}`;
      const params = new URLSearchParams({
        autoplay: 1,
        rel: 0,
        modestbranding: 1,
        enablejsapi: 1
      });
      return `${baseUrl}?${params.toString()}`;
    }
  }

  if (url.includes('vimeo.com')) {
    const m = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
    return m ? `https://player.vimeo.com/video/${m[1]}?autoplay=1` : null;
  }

  if (url.includes('drive.google.com')) {
    const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    return m ? `https://drive.google.com/file/d/${m[1]}/preview` : null;
  }

  if (url.includes('zoom.us/j/')) {
    return url.replace('/j/', '/wc/join/');
  }

  return url;
}
