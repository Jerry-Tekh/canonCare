import React, { useState, useEffect, useCallback } from 'react'
import useBreakpoint from '../../hooks/useBreakpoint'
import { motion, AnimatePresence } from 'framer-motion'
import { FiVideo, FiPhone, FiCalendar, FiClock, FiShield, FiUser } from 'react-icons/fi'
import { useSocket } from '../../context/SocketContext'
import VideoCall from '../../components/video/VideoCall'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import api from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'

const DoctorVideo = () => {
  const { socket }                    = useSocket() || {}
  const { isMobile }                  = useBreakpoint()
  const [patients, setPatients]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [incomingCall, setIncoming]   = useState(null)
  const [activeCall, setActiveCall]   = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res   = await api.get('/appointments?limit=100')
        const appts = res.data || []
        const seen  = {}

        appts
          .filter(a => ['accepted', 'completed', 'rescheduled'].includes(a.status))
          .forEach(a => {
            if (!seen[a.patient_id]) {
              seen[a.patient_id] = {
                patientId:       a.patient_id,
                // patient_user_id is now returned directly from the SELECT
                // This is the users.id — the correct socket room key
                userId:          a.patient_user_id,
                name:            a.patient_name,
                appointmentId:   a.id,
                appointmentTime: a.appointment_time,
                status:          a.status,
                type:            a.type,
              }
            }
          })

        setPatients(Object.values(seen))
      } catch {
        setPatients([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (!socket) return
    const handler = data => setIncoming(data)
    socket.on('call:incoming', handler)
    return () => socket.off('call:incoming', handler)
  }, [socket])

  const acceptCall = () => {
    setActiveCall({
      peerId:        incomingCall.callerId,
      peerName:      incomingCall.callerName,
      appointmentId: incomingCall.appointmentId,
      initiator:     false,
      offer:         incomingCall.signal,
    })
    setIncoming(null)
  }

  const rejectCall = () => {
    socket?.emit('call:reject', { callerId: incomingCall.callerId })
    setIncoming(null)
  }

  const startCall = (patient) => {
    if (!patient.userId) {
      console.warn('[VideoCall] Cannot start call — patient userId not resolved')
      return
    }
    setActiveCall({
      peerId:        patient.userId,       // users.id — matches socket room key
      peerName:      patient.name,
      appointmentId: patient.appointmentId,
      initiator:     true,
    })
  }

  if (activeCall) {
    return (
      <VideoCall
        peerId={activeCall.peerId}
        peerName={activeCall.peerName}
        appointmentId={activeCall.appointmentId}
        initiator={activeCall.initiator}
        incomingOffer={activeCall.offer}
        onEnd={() => setActiveCall(null)}
      />
    )
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}>
        <h2 style={{ fontSize:'var(--text-2xl)', fontWeight:800, marginBottom:'0.25rem' }}>
          Video Consultations
        </h2>
        <p style={{ color:'var(--text-secondary)', fontSize:'var(--text-sm)' }}>
          Start or receive encrypted video calls with your patients.
        </p>
      </motion.div>

      {/* Incoming call banner */}
      <AnimatePresence>
        {incomingCall && (
          <motion.div
            initial={{ opacity:0, y:-12, scale:0.97 }}
            animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, y:-12 }}
            style={{ background:'linear-gradient(135deg,#0f1d3a,#1a3d6e)', borderRadius:'var(--border-radius-xl)', padding: isMobile ? '1.25rem' : '1.5rem 2rem', display:'flex', alignItems: isMobile ? 'flex-start' : 'center', flexDirection: isMobile ? 'column' : 'row', gap:'1rem', color:'#fff', boxShadow:'0 8px 32px rgba(26,61,110,.4)' }}>
            <motion.div
              animate={{ scale:[1,1.12,1] }}
              transition={{ repeat:Infinity, duration:1.3 }}
              style={{ width:60, height:60, borderRadius:'50%', background:'var(--color-teal)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', flexShrink:0 }}>
              <FiVideo />
            </motion.div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:800, fontSize:'var(--text-lg)', marginBottom:'0.25rem' }}>Incoming Video Call</div>
              <div style={{ opacity:0.75, fontSize:'var(--text-sm)' }}>{incomingCall.callerName} is requesting a consultation</div>
            </div>
            <div style={{ display:'flex', gap:'0.75rem', flexShrink:0 }}>
              <Button variant="teal"   onClick={acceptCall}><FiVideo /> Accept</Button>
              <Button variant="danger" onClick={rejectCall}><FiPhone /> Decline</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Patient list */}
      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'3rem' }}><LoadingSpinner /></div>
      ) : patients.length === 0 ? (
        <EmptyState icon={<FiVideo />} title="No patients to call yet"
          message="Patients with accepted appointments will appear here." />
      ) : (
        <div style={{ background:'#fff', border:'1px solid var(--border-color)', borderRadius:'var(--border-radius-lg)', overflow:'hidden', boxShadow:'var(--shadow-sm)' }}>
          <div style={{ padding:'1rem 1.5rem', borderBottom:'1px solid var(--border-color)', display:'flex', alignItems:'center', gap:'0.5rem', fontWeight:700 }}>
            <FiUser size={15} color="var(--color-teal)" />
            Patients with confirmed appointments ({patients.length})
          </div>
          {patients.map((p, i) => (
            <motion.div key={p.patientId}
              initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.04 }}
              style={{ display:'flex', alignItems: isMobile ? 'flex-start' : 'center', flexDirection: isMobile ? 'column' : 'row', gap:'0.75rem', padding: isMobile ? '0.875rem 1rem' : '1rem 1.5rem', borderBottom: i < patients.length-1 ? '1px solid var(--border-color)' : 'none', transition:'background .15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
              onMouseLeave={e => e.currentTarget.style.background = ''}>
              <div style={{ width:44, height:44, borderRadius:'50%', background:'var(--color-slate-light)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'var(--color-primary-light)', fontSize:'var(--text-base)', flexShrink:0 }}>
                {p.name?.[0]}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:700, fontSize:'var(--text-sm)', marginBottom:'0.25rem' }}>{p.name}</div>
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', fontSize:'var(--text-xs)', color:'var(--text-muted)', flexWrap:'wrap' }}>
                  <span style={{ display:'flex', alignItems:'center', gap:'0.25rem' }}>
                    <FiCalendar size={11} /> {new Date(p.appointmentTime).toLocaleDateString()}
                  </span>
                  <span style={{ display:'flex', alignItems:'center', gap:'0.25rem' }}>
                    <FiClock size={11} /> {new Date(p.appointmentTime).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                  </span>
                  <Badge label={p.status} variant={p.status} />
                </div>
              </div>
              <Button
                variant="teal"
                size="sm"
                disabled={!p.userId}
                onClick={() => startCall(p)}
                title={!p.userId ? 'Patient user ID not available' : `Call ${p.name}`}>
                <FiVideo size={14} /> Start Call
              </Button>
            </motion.div>
          ))}
        </div>
      )}

      <div style={{ background:'var(--color-info-bg)', border:'1px solid rgba(37,99,235,.2)', borderRadius:'var(--border-radius)', padding:'0.875rem 1.25rem', display:'flex', gap:'0.75rem', alignItems:'center', fontSize:'var(--text-sm)', color:'var(--color-info)' }}>
        <FiShield size={15} style={{ flexShrink:0 }} />
        Calls are peer-to-peer encrypted via WebRTC. TURN relay ensures connectivity across restrictive networks.
      </div>
    </div>
  )
}

export default DoctorVideo
