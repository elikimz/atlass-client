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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const certsRes = await api.get('/training/certifications')
        const certs = certsRes.data

        // Map certifications to training courses using dynamic data
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
        
        // If all courses are completed, redirect to plans automatically
        const allCompleted = mappedCourses.length > 0 && mappedCourses.every(c => c.status === 'completed')
        if (allCompleted) {
          navigate('/plans')
        }
      } catch (err) {
        console.error('Failed to fetch training data', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleStartTraining = async (courseId: number) => {
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
      
      // 2. Update local state immediately to prevent re-clicks
      setCourses(prev => prev.map(c => c.id === courseId ? { ...c, status: 'completed' } : c))
      setVideoWatched(true)

      // 3. Fetch fresh user data to check is_trained flag
      const userRes = await api.get('/auth/me')
      const user = userRes.data
      
      if (user.is_trained) {
        setWatchingCourseId(null)
        setVideoWatched(false)
        navigate('/plans', { replace: true })
      } else {
        setWatchingCourseId(null)
        setVideoWatched(false)
        // Fallback: refresh courses if flag isn't set yet
        const certsRes = await api.get('/training/certifications')
        setCourses(certsRes.data.map((cert: any) => ({
          id: cert.id,
          name: cert.name || 'Video Reviewing Mastery',
          description: cert.description || 'Master the essentials of video assessment in this focused module.',
          duration: cert.estimated_time || '15 mins / 1 Video',
          videoUrl: cert.video_url || '',
          status: cert.status,
          icon: '🎬'
        })))
      }
    } catch (err) {
      console.error('Failed to complete training', err)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#FAFBFF' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #E2E8F0', borderTopColor: '#8B5CF6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  // If watching a video
  if (watchingCourseId !== null) {
    const course = courses.find(c => c.id === watchingCourseId)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', width: '100%', backgroundColor: '#FAFBFF', minHeight: '100vh' }}>
        {/* Video Player Section */}
        <div style={{ backgroundColor: 'black', width: '100%', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {course?.videoUrl ? (
            <video
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              controls
              autoPlay
              onEnded={() => handleVideoComplete(watchingCourseId)}
            >
              <source src={course.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
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

  // Main Training Center View - Single Course Card
  const course = courses.length > 0 ? courses[0] : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', width: '100%', backgroundColor: '#FAFBFF', minHeight: '100vh' }}>
      {/* Header Section */}
      <div style={{ padding: '24px 16px', backgroundColor: 'white', borderBottom: '1px solid #E2E8F0' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px' }}>Training Center</h1>
        <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>Complete video training to unlock high-earning tasks.</p>
      </div>

      {/* Content Section */}
      <div style={{ flex: 1, padding: '24px 16px' }}>
        {!course ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <p style={{ fontSize: '14px', color: '#64748B' }}>No training courses available yet.</p>
          </div>
        ) : (
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

            {/* Start Training Button */}
            {course.status !== 'completed' && (
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
            )}
          </div>
        )}
      </div>
    </div>
  )
}
