const Logo = ({ showTagline = true, className = '', scale = 1, isDark = false }) => (
  <div 
    className={`flex flex-col items-start justify-center ${className}`} 
    style={{ transform: `scale(${scale})`, transformOrigin: 'left center' }}
  >
    <img 
      src="/logo.png" 
      alt="Gyanteerth Logo" 
      style={{ 
        height: '40px', 
        width: 'auto', 
        display: 'block',
        filter: isDark ? 'brightness(1.1) saturate(1.1)' : 'none'
      }} 
    />
    {showTagline && (
      <span 
        style={{ 
          fontSize: '0.6rem', 
          color: isDark ? 'rgba(255,255,255,0.7)' : 'var(--color-text-muted)', 
          fontWeight: 800, 
          letterSpacing: '0.04em', 
          marginTop: '-2px', // Pull tagline closer to logo image
          textTransform: 'uppercase',
          paddingLeft: '4px'
        }}
      >
        Committed towards excellence...
      </span>
    )}
  </div>
);

export default Logo;
