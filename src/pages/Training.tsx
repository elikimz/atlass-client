import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

interface TrainingCourse {
  id: number
  name: string
  description: string
  duration: string
  videoUrl: string
  status: 'available' | 'in_progress' | 'completed'
  icon?: string
}

export default function Training() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState<TrainingCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [watchingCourseId, setWatchingCourseId] = useState<number | null>(null)
  const [videoWatched, setVideoWatched] = useState(false)
  const [isTrained, setIsTrained] = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await api.get('/auth/me')
        const user = userRes.data
        const trained = !!user.is_trained
        localStorage.setItem('user_is_trained', trained ? 'true' : 'false')
        setIsTrained(trained)

        if (trained) {
          setLoading(false)
          return
        }

        const certsRes = await api.get('/training/certifications')
        const certs = certsRes.data
        const mappedCourses: TrainingCourse[] = certs.map((cert: any) => ({
          id: cert.id,
          name: cert.name || 'Video Reviewing Mastery',
          description: cert.description || 'Master the essentials of video assessment in this focused module.',
          duration: cert.estimated_time || '15 mins / 1 Video',
          videoUrl: cert.video_url || '',
          status: cert.status,
          icon: '🎬'
        }))
        setCourses(mappedCourses)
      } catch (err) {
        console.error('Failed to fetch training data', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleStartTraining = async (courseId: number) => {
    const course = courses.find(c => c.id === courseId)
    if (!course || course.status === 'completed' || isTrained) return
    try {
      await api.post(`/training/certifications/${courseId}/start`)
      setWatchingCourseId(courseId)
    } catch (err) {
      console.error('Failed to start training', err)
    }
  }

  const handleVideoComplete = async (courseId: number) => {
    try {
      await api.post(`/training/certifications/${courseId}/complete`)
      setCourses(prev => prev.map(c => c.id === courseId ? { ...c, status: 'completed' } : c))
      setVideoWatched(true)
      setIsTrained(true)
      localStorage.setItem('user_is_trained', 'true')
      setWatchingCourseId(null)
      setVideoWatched(false)
      setTimeout(() => navigate('/plans', { replace: true }), 2000)
    } catch (err) {
      console.error('Failed to complete training', err)
    }
  }

  const handleDownloadCertificate = async () => {
    if (downloading) return
    setDownloading(true)
    try {
      const response = await api.get('/training/certificate', { responseType: 'blob' })
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'AdPulseAI_Certificate.pdf')
      document.body.appendChild(link)
      link.click()
      setTimeout(() => {
        link.parentNode?.removeChild(link)
        window.URL.revokeObjectURL(url)
      }, 100)
    } catch (err) {
      console.error('Failed to download certificate', err)
      alert('Failed to download certificate. Please ensure training is completed.')
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: 'var(--bg-main)' }}>
        <div className="loading-container">
          <div className="loading-bar-bg">
            <div className="loading-bar-fill"></div>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500, margin: 0 }}>Preparing training courses...</p>
        </div>
      </div>
    )
  }

  if (isTrained) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', backgroundColor: 'var(--bg-main)', minHeight: '100vh' }}>
        <div style={{ padding: '24px 16px', backgroundColor: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border-main)' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 8px' }}>Training Center</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>You have successfully completed your training.</p>
        </div>
        <div style={{ flex: 1, padding: '24px 16px' }}>
          <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-main)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: 'var(--card-shadow)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                <div style={{ width: '56px', height: '56px', backgroundColor: 'var(--bg-main)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', flexShrink: 0 }}>🎓</div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 4px' }}>Video Reviewing Mastery</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>Training Completed</p>
                </div>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 14px', backgroundColor: 'rgba(0, 172, 79, 0.1)', borderRadius: '8px', flexShrink: 0 }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#00AC4F', textTransform: 'uppercase' }}>✓ DONE</span>
              </div>
            </div>
            <div style={{ padding: '12px', backgroundColor: 'rgba(0, 172, 79, 0.1)', borderRadius: '10px', textAlign: 'center' }}>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#00AC4F', margin: 0 }}>✓ Training Completed Successfully</p>
              <p style={{ fontSize: '12px', color: '#00AC4F', margin: '4px 0 0' }}>Your certificate is ready to download below.</p>
            </div>
            <button onClick={handleDownloadCertificate} disabled={downloading} style={{ width: '100%', padding: '16px', backgroundColor: 'var(--accent-primary)', color: 'white', fontSize: '16px', fontWeight: 700, border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.2s', opacity: downloading ? 0.7 : 1 }}>
              {downloading ? <span>Downloading...</span> : <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                DOWNLOAD CERTIFICATE
              </>}
            </button>
            <button onClick={() => navigate('/plans')} style={{ width: '100%', padding: '14px', backgroundColor: 'transparent', color: 'var(--accent-primary)', fontSize: '14px', fontWeight: 600, border: '2px solid var(--accent-primary)', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}>Go to Investment Plans →</button>
          </div>
        </div>
      </div>
    )
  }

  if (watchingCourseId !== null) {
    const course = courses.find(c => c.id === watchingCourseId)
    const isYoutube = course?.videoUrl?.includes('youtube.com') || course?.videoUrl?.includes('youtu.be')
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', backgroundColor: 'var(--bg-main)', minHeight: '100vh' }}>
        <div style={{ backgroundColor: 'black', width: '100%', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {course?.videoUrl ? (
            isYoutube ? (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <iframe style={{ width: '100%', height: '100%', border: 'none' }} src={course.videoUrl.replace('watch?v=', 'embed/').split('&')[0] + "?autoplay=1"} title="Training Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                <button onClick={() => handleVideoComplete(watchingCourseId)} style={{ position: 'absolute', bottom: '20px', right: '20px', padding: '12px 24px', backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>COMPLETE TRAINING</button>
              </div>
            ) : (
              <video key={course.videoUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} controls autoPlay onEnded={() => handleVideoComplete(watchingCourseId)}><source src={course.videoUrl} type="video/mp4" />Your browser does not support the video tag.</video>
            )
          ) : (
            <div style={{ color: 'white', textAlign: 'center' }}><p>No video available for this training.</p><button onClick={() => setWatchingCourseId(null)} style={{ color: 'var(--accent-primary)', background: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: 600 }}>Go Back</button></div>
          )}
        </div>
        <div style={{ padding: '24px 16px', backgroundColor: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border-main)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 8px' }}>{course?.name}</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>{course?.duration}</p>
        </div>
        <div style={{ padding: '24px 16px', backgroundColor: 'var(--bg-card)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 12px' }}>About This Course</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.6', margin: 0 }}>{course?.description}</p>
        </div>
        {videoWatched && (
          <div style={{ padding: '16px', margin: '16px', backgroundColor: 'rgba(0, 172, 79, 0.1)', borderRadius: '12px', border: '1px solid rgba(0, 172, 79, 0.2)' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#00AC4F', margin: 0 }}>✓ Training completed! Redirecting to investment plans...</p>
          </div>
        )}
      </div>
    )
  }

  const course = courses.length > 0 ? courses[0] : { id: 1, name: 'Video Reviewing Mastery', description: 'Master the essentials of video assessment in this focused module.', duration: '15 mins / 1 Video', status: 'available' as const, icon: '🎬' }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', backgroundColor: 'var(--bg-main)', minHeight: '100vh' }}>
      <div style={{ padding: '24px 16px', backgroundColor: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border-main)' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 8px' }}>Training Center</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>Complete video training to unlock high-earning tasks.</p>
      </div>
      <div style={{ flex: 1, padding: '24px 16px' }}>
        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-main)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: 'var(--card-shadow)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '56px', height: '56px', backgroundColor: 'var(--bg-main)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>{course.icon}</div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 4px' }}>{course.name}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>{course.duration}</p>
            </div>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.6', margin: 0 }}>{course.description}</p>
          <div style={{ padding: '12px', backgroundColor: 'var(--bg-main)', borderRadius: '10px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Requirement: Watch the full review video to unlock tasks.</p>
          </div>
          <button onClick={() => handleStartTraining(course.id)} style={{ width: '100%', padding: '16px', backgroundColor: 'var(--accent-primary)', color: 'white', fontSize: '16px', fontWeight: 700, border: 'none', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}>START TRAINING</button>
        </div>
      </div>
    </div>
  )
}
