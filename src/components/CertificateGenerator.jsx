import React, { useRef, useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useAuth } from '../shared/AuthContext';
import { USER_API } from '../config';

/**
 * CertificateGenerator Component
 * Fetches certificate details from the API and renders the template.
 */
const CertificateGenerator = ({ 
  courseId,
  onDownload 
}) => {
  const { authFetch } = useAuth();
  const [certData, setCertData] = useState(null);
  const [loading, setLoading] = useState(true);
  const certificateRef = useRef(null);

  useEffect(() => {
    const fetchCertDetails = async () => {
      if (!courseId) return;
      try {
        setLoading(true);
        const response = await authFetch(`${USER_API}/course/${courseId}/certificate`);
        if (response.ok) {
          const data = await response.json();
          setCertData(data);
        } else {
          console.error("Failed to fetch certificate:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching certificate:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCertDetails();
  }, [courseId, authFetch]);

  const downloadPDF = async () => {
    const element = certificateRef.current;
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 3, 
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 3, canvas.height / 3]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 3, canvas.height / 3);
      pdf.save(`Certificate_${(certData?.user_name || 'candidate').replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error("Certificate generation failed:", error);
    }
  };

  React.useEffect(() => {
    if (onDownload && !loading && certData) {
      onDownload(downloadPDF);
    }
  }, [onDownload, loading, certData]);

  if (loading) {
    return (
      <div style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        <div className="animate-pulse" style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.3)', borderTopColor: '#f97316', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ fontWeight: 600 }}>Securing Your Achievement...</p>
        </div>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (!certData) {
    return (
      <div style={{ padding: '2rem', color: 'white', textAlign: 'center' }}>
        <p>No certificate data found for this course.</p>
      </div>
    );
  }

  const formattedDate = new Date(certData.issued_date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="certificate-scale-wrapper" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      width: '100%',
      overflow: 'visible'
    }}>

      {/* CERTIFICATE PREVIEW CONTAINER */}
      <div 
        ref={certificateRef}
        style={{
          width: '794px', 
          height: '1123px',
          backgroundColor: 'white',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: "'Outfit', 'Inter', sans-serif",
          color: '#1a1a1a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '60px',
          transformOrigin: 'top center',
          boxShadow: '0 40px 100px rgba(0,0,0,0.4)',
          // The scale is now handled by the CSS below
        }}
        className="certificate-render-target"
      >
        {/* TOP DECORATIVE BLOB */}
        <div style={{ 
          position: 'absolute', top: '-50px', right: '-120px', width: '500px', height: '350px',
          background: 'linear-gradient(225deg, #000 30%, #444 60%, var(--color-primary, #f97316) 100%)',
          borderRadius: '50% 0 50% 50%', transform: 'rotate(-5deg)', opacity: 0.9, zIndex: 1 
        }} />
        <div style={{ 
          position: 'absolute', top: '10px', right: '10px', width: '400px', height: '280px',
          background: 'rgba(249, 115, 22, 0.4)', borderRadius: '50% 0 50% 50%', zIndex: 0 
        }} />

        {/* LOGO AREA */}
        <div style={{ alignSelf: 'flex-start', zIndex: 10 }}>
           <img 
             src="/logo.png" 
             alt="Gyanteerth Logo" 
             style={{ height: '70px', objectFit: 'contain' }}
             crossOrigin="anonymous"
           />
        </div>

        {/* MAIN TEXT */}
        <div style={{ marginTop: '120px', textAlign: 'center', width: '100%', zIndex: 10 }}>
          <h1 style={{ fontSize: '64px', fontWeight: 300, letterSpacing: '8px', margin: '0', color: '#000' }}>CERTIFICATE</h1>
          <h2 style={{ fontSize: '24px', fontWeight: 600, letterSpacing: '3px', marginTop: '20px', color: '#1a1a1a', textTransform: 'uppercase' }}>OF COMPLETION</h2>
          
          <div style={{ marginTop: '50px', fontSize: '18px', fontWeight: 700, color: '#4b5563' }}>
            This is to certify that
          </div>

          <div style={{ 
            marginTop: '30px', 
            fontSize: '76px',
            fontFamily: "'Playball', cursive, serif", 
            fontWeight: 400, 
            color: '#000',
            borderBottom: '2px solid #000',
            display: 'inline-block',
            padding: '0 40px 10px 40px',
            fontStyle: 'italic',
            letterSpacing: '1px'
          }}>
            {certData.user_name}
          </div>

          <div style={{ marginTop: '50px', maxWidth: '650px', margin: '50px auto 0 auto', lineHeight: '1.6', fontSize: '18px', fontWeight: 600, color: '#374151' }}>
            has successfully completed the 
            <div style={{ fontSize: '26px', fontWeight: 900, color: '#000', margin: '15px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>{certData.course_name}</div>
            conducted by <span style={{ color: 'rgb(57, 123, 33)', fontWeight: 900 }}>Gyan</span><span style={{ color: 'rgb(189, 148, 0)', fontWeight: 900 }}>teerth</span>, with a duration of {certData.course_duration} Hours.
          </div>

          <p style={{ marginTop: '30px', maxWidth: '650px', margin: '30px auto 0 auto', lineHeight: '1.7', fontSize: '16px', fontWeight: 500, color: '#4b5563' }}>
            Issued on {formattedDate}. This participant has demonstrated dedication, consistency, and a strong understanding of the concepts covered in the program.
          </p>
        </div>

        {/* SIGNATURE & ACCREDITATIONS */}
        <div style={{ marginTop: 'auto', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: '40px', zIndex: 10 }}>
          
          <div style={{ textAlign: 'left', zIndex: 20 }}>
            <img 
              src="/Signature.png" 
              alt="Signature" 
              style={{ height: '60px', objectFit: 'contain', marginBottom: '5px', display: 'block' }}
              crossOrigin="anonymous"
            />
            <div style={{ borderBottom: '2px solid #4b5563', width: '220px', marginBottom: '15px' }} />
            <div style={{ fontSize: '18px', fontWeight: 950, color: '#000', textTransform: 'uppercase', letterSpacing: '1px' }}>Vikrant Sukhtankar</div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#374151', marginTop: '4px', letterSpacing: '2px' }}>CEO & FOUNDER</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', zIndex: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <img 
                src="/ISO.png" 
                alt="ISO 9001:2015" 
                style={{ height: '80px', objectFit: 'contain' }}
                crossOrigin="anonymous"
              />
              <div style={{ fontSize: '9px', fontWeight: 800, color: '#374151', letterSpacing: '0.5px' }}>305026030345Q</div>
            </div>
            <img 
              src="/IAF.png" 
              alt="IAF Accreditation" 
              style={{ height: '80px', objectFit: 'contain' }}
              crossOrigin="anonymous"
            />
          </div>
        </div>

        {/* BOTTOM DECORATIVE BLOB */}
        <div style={{ 
          position: 'absolute', bottom: '-150px', left: '-200px', width: '400px', height: '350px',
          background: 'linear-gradient(45deg, #000 30%, #444 60%, var(--color-primary, #f97316) 100%)',
          borderRadius: '0 50% 50% 50%', transform: 'rotate(10deg)', opacity: 0.9, zIndex: 1 
        }} />
        <div style={{ 
          position: 'absolute', bottom: '-100px', left: '-150px', width: '350px', height: '300px',
          background: 'rgba(249, 115, 22, 0.4)', borderRadius: '0 50% 50% 50%', zIndex: 0 
        }} />

        {/* Certificate ID */}
        <div style={{ position: 'absolute', bottom: '30px', right: '40px', fontSize: '15px', color: '#111827', fontWeight: 900, letterSpacing: '0.5px' }}>
          CERT ID: {certData.uuid}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playball&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

        /* 🎓 SMART DYNAMIC SCALING 🎓 */
        .certificate-scale-wrapper {
          --cert-original-width: 794px;
          --cert-original-height: 1123px;
          --available-width: min(100vw - 64px, 1200px);
          --scale-factor: min(0.95, calc(var(--available-width) / var(--cert-original-width)));
          padding-top: 2rem;
          padding-bottom: 2rem;
        }

        .certificate-render-target {
          transform: scale(var(--scale-factor)) !important;
          margin-bottom: calc((var(--cert-original-height) * (1 - var(--scale-factor))) * -1 - 20px) !important;
        }

        @media (max-width: 480px) {
          .certificate-scale-wrapper {
            --available-width: calc(100vw - 32px);
          }
          .certificate-render-target {
            margin-bottom: calc((var(--cert-original-height) * (1 - var(--scale-factor))) * -1 - 10px) !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CertificateGenerator;
