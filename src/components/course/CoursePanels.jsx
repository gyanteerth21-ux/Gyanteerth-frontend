import React, { useState, useEffect } from 'react';
import { PlayCircle, AlertCircle, Monitor, ExternalLink, Video, BookOpen } from 'lucide-react';

/* ── Video Player ───────────────────────────────── */
export function VideoPlayer({ lesson }) {
  const [videoError, setVideoError] = useState(false);

  if (!lesson || !lesson.url) {
    return (
      <div style={{ width: '100%', aspectRatio: '16/9', background: '#0f172a', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <AlertCircle size={40} color="#ef4444" />
        <p style={{ color: '#f8fafc', fontWeight: 600 }}>Video URL not available</p>
      </div>
    );
  }

  let embedUrl = lesson.url;
  if (embedUrl.includes('youtube.com/watch?v=')) {
    const videoId = new URL(embedUrl).searchParams.get('v');
    if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
  } else if (embedUrl.includes('youtu.be/')) {
    const videoId = embedUrl.split('youtu.be/')[1].split('?')[0];
    if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
  }

  const isDrive = lesson.url.includes('drive.google.com');
  let driveStreamUrl = null;
  if (isDrive) {
    const m = lesson.url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (m && m[1]) {
      driveStreamUrl = `/api/proxy-video?id=${m[1]}`;
    }
  }

  if (driveStreamUrl && !videoError) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: '100%', background: '#0f172a', borderRadius: '16px', overflow: 'hidden', aspectRatio: '16/9', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', position: 'relative' }}>
          <video
            src={driveStreamUrl}
            controls
            controlsList="nodownload"
            onError={() => setVideoError(true)}
            style={{ width: '100%', height: '100%', outline: 'none', background: '#0f172a' }}
            title={lesson.title || 'Video Player'}
          >
            Your browser does not support HTML5 video.
          </video>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ width: '100%', background: '#000', borderRadius: '16px', overflow: 'hidden', aspectRatio: '16/9', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', position: 'relative' }}>
        <iframe
          src={embedUrl}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ width: '100%', height: '100%', border: 'none' }}
          title={lesson.title || 'Video Player'}
        />
      </div>
    </div>
  );
}

/* ── Live Panel ───────────────────────────────── */
function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState(targetDate ? targetDate - new Date() : 0);

  useEffect(() => {
    if (!targetDate) return;
    const interval = setInterval(() => {
      setTimeLeft(targetDate - new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

export function LivePanel({ lesson, onJoin }) {
  const target = lesson.start_time ? new Date(lesson.start_time) : null;
  const end = lesson.end_time ? new Date(lesson.end_time) : null;
  const timeLeft = useCountdown(target);
  const now = new Date();

  const isOngoing = target && end && now >= target && now <= end;
  const isUpcoming = target && now < target;
  const canJoin = target && (now >= (new Date(target.getTime() - 30 * 60 * 1000)));
  const accent = isOngoing ? '#ef4444' : isUpcoming ? '#f59e0b' : '#6366f1';

  const formatCountdown = (ms) => {
    if (ms <= 0) return null;
    const totalSecs = Math.floor(ms / 1000);
    const d = Math.floor(totalSecs / 86400);
    const h = Math.floor((totalSecs % 86400) / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0 || d > 0) parts.push(`${h}h`);
    if (m > 0 || h > 0 || d > 0) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(' ');
  };

  const countdownStr = isUpcoming ? formatCountdown(timeLeft) : null;

  const handleJoin = () => {
    onJoin(lesson.id, lesson.moduleId);
    if (lesson.url) {
      window.open(lesson.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', borderRadius: '20px', padding: '3.5rem 2rem', textAlign: 'center', border: `1px solid ${accent}25`, position: 'relative', overflow: 'hidden' }}>
        {isOngoing && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '200%', height: '200%', background: `radial-gradient(circle, ${accent}10 0%, transparent 70%)`, animation: 'pulse 3s ease-in-out infinite' }} />}

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ width: '88px', height: '88px', borderRadius: '50%', margin: '0 auto 1.5rem', background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${accent}40`, boxShadow: isOngoing ? `0 0 20px ${accent}30` : 'none' }}>
            <Monitor size={40} color={accent} />
          </div>

          <span style={{ display: 'inline-block', background: `${accent}20`, color: accent, padding: '0.4rem 1.2rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1.25rem', border: `1px solid ${accent}40` }}>
            {isOngoing ? '● Live Now' : isUpcoming ? '⏰ Upcoming' : '✓ Completed'}
          </span>

          <h2 style={{ color: 'white', fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>{lesson.title}</h2>

          {target && <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '1rem', fontWeight: 500 }}>{new Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeStyle: 'short' }).format(target)}</p>}

          {countdownStr && (
            <div style={{ background: 'rgba(255,255,255,0.05)', display: 'inline-flex', flexDirection: 'column', padding: '1rem 2.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '2.5rem' }}>
              <span style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>Starts In</span>
              <span style={{ color: '#f59e0b', fontSize: '1.5rem', fontWeight: 800, fontFamily: 'monospace' }}>{countdownStr}</span>
            </div>
          )}

          {lesson.url && (isOngoing || isUpcoming) && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              {canJoin ? (
                <button
                  onClick={handleJoin}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
                    background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                    color: 'white', padding: '1rem 2.5rem', borderRadius: '12px', border: 'none',
                    fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
                    boxShadow: `0 8px 25px ${accent}40`, transition: 'transform 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                >
                  <Monitor size={20} /> {isOngoing ? 'Join Session Now' : 'Enter Waiting Room'}
                </button>
              ) : (
                <div style={{ padding: '1.5rem', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <AlertCircle size={20} color="#64748b" />
                  <p style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>Link available 30 minutes before start.</p>
                </div>
              )}
            </div>
          )}
        </div>
        <style>{`@keyframes pulse { 0% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); } 50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.1); } 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); } }`}</style>
      </div>

      {lesson.recordings?.length > 0 && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #f1f5f9' }}>
          <h3 style={{ fontWeight: 800, marginBottom: '1rem', fontSize: '0.95rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Video size={16} color="#10b981" /> Session Recordings</h3>
          {lesson.recordings.map((rec, i) => (
            <a key={rec.rec_video_id} href={rec.url} target="_blank" rel="noopener noreferrer" onClick={() => onJoin(lesson.id, lesson.moduleId, true)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', background: '#f0fdf4', border: '1px solid rgba(16,185,129,0.2)', textDecoration: 'none', marginBottom: '0.5rem' }}>
              <PlayCircle size={18} color="#10b981" />
              <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>Recording {i + 1}{rec.duration ? ` · ${rec.duration}` : ''}</span>
              <ExternalLink size={13} color="#10b981" style={{ marginLeft: 'auto' }} />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Note Panel ───────────────────────────────── */
export function NotePanel({ lesson }) {
  const lowerUrl = (lesson.url || '').toLowerCase();
  const isPdf = lowerUrl.endsWith('.pdf') || lowerUrl.includes('.pdf?');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ padding: '3.5rem 2rem', background: 'white', borderRadius: '24px', border: '1px solid #f1f5f9', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, #ef4444, #f59e0b)' }} />

        <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '1px solid #fee2e2' }}>
          <BookOpen size={36} color="#ef4444" />
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>{lesson.title}</h2>
        <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '400px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
          This resource is available for your learning. You can view it directly or download it for offline study.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <a
            href={lesson.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              background: 'linear-gradient(135deg, #0f172a, #1e293b)',
              color: 'white', textDecoration: 'none', padding: '0.85rem 2rem',
              borderRadius: '12px', fontSize: '0.9rem', fontWeight: 800,
              boxShadow: '0 8px 20px rgba(15,23,42,0.2)', transition: 'transform 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            <ExternalLink size={18} /> Open Resource
          </a>
        </div>
      </div>

      {isPdf && (
        <div style={{ width: '100%', height: '800px', borderRadius: '24px', overflow: 'hidden', border: '1px solid #e2e8f0', background: 'white', boxShadow: '0 20px 50px rgba(0,0,0,0.08)' }}>
          <iframe
            src={`${lesson.url}#toolbar=0&navpanes=0`}
            width="100%"
            height="100%"
            style={{ border: 'none' }}
            title={lesson.title}
          />
        </div>
      )}

      {!isPdf && lesson.url && (
        <div style={{ padding: '2rem', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
            Note: Preview is only available for PDF files. For other formats, please use the button above to open the resource.
          </p>
        </div>
      )}
    </div>
  );
}
