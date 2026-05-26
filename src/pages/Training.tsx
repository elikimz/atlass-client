import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

interface TrainingCourse {
  id: number
  name: string
  description: string
  duration: string
  videoCount: number
  status: 'available' | 'in_progress' | 'completed'
  icon?: string
}

interface UserCertification {
  id: number
  certification_id: number
  status: 'available' | 'in_progress' | 'completed'
}

export default function Training() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState<TrainingCourse[]>([])
  const [userCerts, setUserCerts] = useState<UserCertification[]>([])
  const [loading, setLoading] = useState(true)
  const [watchingCourseId, setWatchingCourseId] = useState<number | null>(null)
  const [videoWatched, setVideoWatched] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const certsRes = await api.get('/training/certifications')
        const certs = certsRes.data

        // Map certifications to training courses
        const mappedCourses: TrainingCourse[] = certs.map((cert: any) => ({
          id: cert.id,
          name: cert.name || 'Video Reviewing Mastery',
          description: 'Master the essentials of video assessment in this focused, single-video module. Gain the key insight required for standard tasks and become a qualified reviewer. This efficient course prepares you for premium-paying tasks.',
          duration: '15 mins / 1 Video',
          videoCount: 1,
          status: cert.status,
          icon: '🎥'
        }))

        setCourses(mappedCourses)
        setUserCerts(certs)
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
      // Mark certification as completed
      await api.post(`/training/certifications/${courseId}/complete`)
      setVideoWatched(true)

      // Refresh certifications
      const certsRes = await api.get('/training/certifications')
      const certs = certsRes.data
      setUserCerts(certs)

      // Check if all mandatory trainings are completed
      const allCompleted = certs.every((c: any) => c.status === 'completed')
      if (allCompleted) {
        // Redirect to investment plans after a short delay
        setTimeout(() => {
          navigate('/packages')
        }, 1500)
      }
    } catch (err) {
      console.error('Failed to complete training', err)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#FAFBFF' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #E2E8F0', borderTopColor: '#5932EA', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
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
          <video
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            controls
            autoPlay
            onEnded={() => handleVideoComplete(watchingCourseId)}
          >
            <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', width: '100%', backgroundColor: '#FAFBFF', minHeight: '100vh' }}>
      {/* Header Section */}
      <div style={{ padding: '24px 16px', backgroundColor: 'white', borderBottom: '1px solid #E2E8F0' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px' }}>Training Center</h1>
        <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>Complete video training to unlock high-earning tasks.</p>
      </div>

      {/* Content Section */}
      <div style={{ flex: 1, padding: '16px' }}>
        {/* Training Courses Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
          {courses.map((course) => (
            <div
              key={course.id}
              style={{
                backgroundColor: '#F5F3FF',
                borderRadius: '16px',
                border: '2px solid #8B5CF6',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              {/* Course Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    flexShrink: 0
                  }}>
                    {course.icon}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>
                      {course.name}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                      {course.duration}
                    </p>
                  </div>
                </div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '4px 12px',
                  backgroundColor: course.status === 'completed' ? '#DCFCE7' : '#FEF3C7',
                  borderRadius: '8px',
                  flexShrink: 0
                }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: course.status === 'completed' ? '#15803D' : '#B45309',
                    textTransform: 'uppercase'
                  }}>
                    {course.status === 'completed' ? '✓ Completed' : course.status === 'in_progress' ? 'In Progress' : 'OPEN'}
                  </span>
                </div>
              </div>

              {/* Course Description */}
              <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5', margin: 0 }}>
                {course.description}
              </p>

              {/* CTA Button */}
              {course.status === 'available' && (
                <button
                  onClick={() => handleStartTraining(course.id)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#5932EA',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 600,
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#4C2FBF' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#5932EA' }}
                >
                  START TRAINING
                  <span>→</span>
                </button>
              )}
              {course.status === 'in_progress' && (
                <button
                  onClick={() => handleStartTraining(course.id)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#5932EA',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 600,
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#4C2FBF' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#5932EA' }}
                >
                  CONTINUE TRAINING
                  <span>→</span>
                </button>
              )}
              {course.status === 'completed' && (
                <button
                  disabled
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#DCFCE7',
                    color: '#15803D',
                    fontSize: '14px',
                    fontWeight: 600,
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'default',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span>✓</span>
                  COMPLETED
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
