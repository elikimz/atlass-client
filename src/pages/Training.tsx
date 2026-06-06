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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Always check the live backend is_trained flag first
        const userRes = await api.get('/auth/me')
        const user = userRes.data
        const trained = !!user.is_trained

        // Sync localStorage with backend truth
        localStorage.setItem('user_is_trained', trained ? 'true' : 'false')
        setIsTrained(trained)

        // 2. If already trained, no need to fetch certifications — just show certificate UI
        if (trained) {
          setLoading(false)
          return
        }

        // 3. Only fetch certifications for untrained users
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
    // Guard: never allow starting a completed course
    const course = courses.find(c => c.id === courseId)
    if (!course || course.status === 'completed' || isTrained) {
      return
    }

    try {
      await api.post(`/training/certifications/${courseId}/start`)
      setWatchingCourseId(courseId)
    } catch (err) {
      console.error('Failed to start training', err)
    }
  }

  const handleVideoComplete = async (courseId: number) => {
    try {
      // 1. Mark certification as completed in backend
      await api.post(`/training/certifications/${courseId}/complete`)

      // 2. Update local state immediately
      setCourses(prev => prev.map(c => c.id === courseId ? { ...c, status: 'completed' } : c))
      setVideoWatched(true)
      setIsTrained(true)

      // 3. Sync localStorage
      localStorage.setItem('user_is_trained', 'true')

      // 4. Close the video player
      setWatchingCourseId(null)
      setVideoWatched(false)

      // 5. Give a small delay for the user to see the success message, then redirect
      setTimeout(() => {
        navigate('/plans', { replace: true })
      }, 2000)
    } catch (err) {
      console.error('Failed to complete training', err)
    }
  }

  const handleDownloadCertificate = async () => {
    try {
      const response = await api.get('/training/certificate', {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'AdPulseAI_Certificate.pdf')
      document.body.appendChild(link)
      link.click()

      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to download certificate', err)
      alert('Failed to download certificate. Please ensure training is completed.')
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#F8FAFC' }}>
        <div className="loading-container">
          <div className="loading-bar-bg">
            <div className="loading-bar-fill"></div>
          </div>
          <p style={{ color: '#64748B', fontSize: '14px', fontWeight: 500, margin: 0 }}>Preparing training courses...</p>
        </div>
      </div>
    )
  }

  // ─── TRAINED USER VIEW ───────────────────────────────────────────────────────
  // If the user is already trained, show ONLY the certificate download — no video player, no start button
  if (isTrained) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', width: '100%', backgroundColor: '#FAFBFF', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ padding: '24px 16px', backgroundColor: 'white', borderBottom: '1px solid #E2E8F0' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px' }}>Training Center</h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>You have successfully completed your training.</p>
        </div>

        {/* Certificate Card */}
        <div style={{ flex: 1, padding: '24px 16px' }}>
          <div
            style={{
              backgroundColor: '#F5F3FF',
              borderRadius: '16px',
              border: '2px solid #DDD6FE',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            {/* Course Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                <div style={{
                  width: '56px', height: '56px', backgroundColor: 'white', borderRadius: '14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', flexShrink: 0
                }}>
                  🎓
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>Video Reviewing Mastery</h3>
                  <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>Training Completed</p>
                </div>
              </div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', padding: '6px 14px',
                backgroundColor: '#DCFCE7',
                borderRadius: '8px', flexShrink: 0
              }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#15803D', textTransform: 'uppercase' }}>
                  ✓ DONE
                </span>
              </div>
            </div>

            {/* Completion Banner */}
            <div style={{ padding: '12px', backgroundColor: '#DCFCE7', borderRadius: '10px', textAlign: 'center' }}>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#15803D', margin: 0 }}>
                ✓ Training Completed Successfully
              </p>
              <p style={{ fontSize: '12px', color: '#166534', margin: '4px 0 0' }}>
                Your certificate is ready to download below.
              </p>
            </div>

            {/* Download Certificate Button */}
            <button
              onClick={handleDownloadCertificate}
              style={{
                width: '100%', padding: '16px', backgroundColor: '#5932EA', color: 'white',
                fontSize: '16px', fontWeight: 700, border: 'none', borderRadius: '12px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#4A28C7' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#5932EA' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              DOWNLOAD CERTIFICATE
            </button>

            {/* Go to Plans */}
            <button
              onClick={() => navigate('/plans')}
              style={{
                width: '100%', padding: '14px', backgroundColor: 'white', color: '#5932EA',
                fontSize: '14px', fontWeight: 600, border: '2px solid #5932EA', borderRadius: '12px',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F5F3FF' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white' }}
            >
              Go to Investment Plans →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── VIDEO PLAYER VIEW ────────────────────────────────────────────────────────
  if (watchingCourseId !== null) {
    const course = courses.find(c => c.id === watchingCourseId)
    const isYoutube = course?.videoUrl?.includes('youtube.com') || course?.videoUrl?.includes('youtu.be')

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', width: '100%', backgroundColor: '#FAFBFF', minHeight: '100vh' }}>
        {/* Video Player Section */}
        <div style={{ backgroundColor: 'black', width: '100%', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {course?.videoUrl ? (
            isYoutube ? (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <iframe
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  src={course.videoUrl.replace('watch?v=', 'embed/').split('&')[0] + "?autoplay=1"}
                  title="Training Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
                <button
                  onClick={() => handleVideoComplete(watchingCourseId)}
                  style={{ position: 'absolute', bottom: '20px', right: '20px', padding: '12px 24px', backgroundColor: '#8B5CF6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
                >
                  COMPLETE TRAINING
                </button>
              </div>
            ) : (
              <video
                key={course.videoUrl}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                controls
                autoPlay
                onEnded={() => handleVideoComplete(watchingCourseId)}
              >
                <source src={course.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )
          ) : (
            <div style={{ color: 'white', textAlign: 'center' }}>
              <p>No video available for this training.</p>
              <button onClick={() => setWatchingCourseId(null)} style={{ color: '#8B5CF6', background: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: 600 }}>Go Back</button>
            </div>
          )}
        </div>

        {/* Course Info Section */}
        <div style={{ padding: '24px 16px', backgroundColor: 'white', borderBottom: '1px solid #E2E8F0' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px' }}>{course?.name}</h2>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>{course?.duration}</p>
        </div>

        {/* Description Section */}
        <div style={{ padding: '24px 16px', backgroundColor: 'white' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: '0 0 12px' }}>About This Course</h3>
          <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
            {course?.description}
          </p>
        </div>

        {/* Completion Message */}
        {videoWatched && (
          <div style={{ padding: '16px', margin: '16px', backgroundColor: '#DCFCE7', borderRadius: '12px', border: '1px solid #86EFAC' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#15803D', margin: 0 }}>
              ✓ Training completed! Redirecting to investment plans...
            </p>
          </div>
        )}
      </div>
    )
  }

  // ─── MAIN TRAINING CENTER VIEW ────────────────────────────────────────────────
  const course = courses.length > 0 ? courses[0] : {
    id: 1,
    name: 'Video Reviewing Mastery',
    description: 'Master the essentials of video assessment in this focused module.',
    duration: '15 mins / 1 Video',
    status: 'available' as const,
    icon: '🎬'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', width: '100%', backgroundColor: '#FAFBFF', minHeight: '100vh' }}>
      {/* Header Section */}
      <div style={{ padding: '24px 16px', backgroundColor: 'white', borderBottom: '1px solid #E2E8F0' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px' }}>Training Center</h1>
        <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>Complete video training to unlock high-earning tasks.</p>
      </div>

      {/* Content Section */}
      <div style={{ flex: 1, padding: '24px 16px' }}>
        <div
          style={{
            backgroundColor: '#F5F3FF',
            borderRadius: '16px',
            border: '2px solid #DDD6FE',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {/* Course Header with Icon and Status */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
              <div style={{
                width: '56px', height: '56px', backgroundColor: 'white', borderRadius: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', flexShrink: 0
              }}>
                {course.icon}
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>{course.name}</h3>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>Duration: {course.duration}</p>
              </div>
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', padding: '6px 14px',
              backgroundColor: '#DCFCE7',
              borderRadius: '8px', flexShrink: 0
            }}>
              <span style={{
                fontSize: '12px', fontWeight: 600,
                color: '#15803D',
                textTransform: 'uppercase'
              }}>
                OPEN
              </span>
            </div>
          </div>

          {/* Course Description */}
          <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: '0 0 8px' }}>
            {course.description}
          </p>

          {/* Start Training Button — only shown when status is NOT completed */}
          {course.status !== 'completed' ? (
            <button
              onClick={() => handleStartTraining(course.id)}
              style={{
                width: '100%', padding: '16px', backgroundColor: '#8B5CF6', color: 'white',
                fontSize: '16px', fontWeight: 700, border: 'none', borderRadius: '12px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#7C3AED' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#8B5CF6' }}
            >
              START TRAINING
              <span>→</span>
            </button>
          ) : (
            // This branch is reached only if the API returns completed but isTrained is somehow false
            // (edge case guard — the main trained flow is handled above)
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '12px', backgroundColor: '#DCFCE7', borderRadius: '10px', textAlign: 'center' }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#15803D', margin: 0 }}>✓ Training Completed Successfully</p>
              </div>
              <button
                onClick={handleDownloadCertificate}
                style={{
                  width: '100%', padding: '16px', backgroundColor: '#5932EA', color: 'white',
                  fontSize: '16px', fontWeight: 700, border: 'none', borderRadius: '12px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#4A28C7' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#5932EA' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                DOWNLOAD CERTIFICATE
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
