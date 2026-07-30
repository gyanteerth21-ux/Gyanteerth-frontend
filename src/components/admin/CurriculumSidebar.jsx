import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid, ArrowUp, ArrowDown, Settings, Trash } from 'lucide-react';

export const CurriculumSidebar = ({
  isSidebarOpen,
  setIsSidebarOpen,
  modules,
  activeModule,
  setActiveModule,
  swapPositions,
  setModuleForm,
  setShowModuleForm,
  deleteModule
}) => {
  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <motion.aside
          initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
          style={{ width: '240px', backgroundColor: 'var(--color-surface)', borderRight: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 50 }}
          className="curriculum-sidebar"
        >
          <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }} className="no-scrollbar">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
              <h3 style={{ fontSize: '0.65rem', fontWeight: 950, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Grid size={12} /> Chapters</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {modules.map((m, idx) => (
                <motion.div
                  key={m.module_id}
                  onClick={() => { setActiveModule(m); if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  style={{
                    padding: '1rem', borderRadius: '1.25rem', cursor: 'pointer', transition: 'all 0.2s',
                    backgroundColor: activeModule?.module_id === m.module_id ? 'var(--color-bg)' : 'transparent',
                    border: '1px solid',
                    borderColor: activeModule?.module_id === m.module_id ? 'var(--color-primary-light)20' : 'transparent',
                    display: 'flex', alignItems: 'center', gap: '0.85rem'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <button onClick={(e) => { e.stopPropagation(); swapPositions('swap-module-position', m.module_id, modules[idx - 1].module_id); }} disabled={idx === 0} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}><ArrowUp size={12} /></button>
                    <button onClick={(e) => { e.stopPropagation(); swapPositions('swap-module-position', m.module_id, modules[idx + 1].module_id); }} disabled={idx === modules.length - 1} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}><ArrowDown size={12} /></button>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 950, color: activeModule?.module_id === m.module_id ? 'var(--color-primary)' : 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.title}</p>
                    <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.55rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{m.video?.length || 0} Lessons • {m.assessments?.length || 0} Exams</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', opacity: activeModule?.module_id === m.module_id ? 1 : 0.4 }}>
                    <button onClick={(e) => { e.stopPropagation(); setModuleForm({ Title: m.title, Description: m.description, Position: m.position, editingId: m.module_id }); setShowModuleForm(true); }} style={{ color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer' }}><Settings size={14} /></button>
                    <button onClick={(e) => { e.stopPropagation(); deleteModule(m.module_id); }} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash size={14} /></button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
