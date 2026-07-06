import React, { useState, useEffect } from 'react'
import useBreakpoint from '../../hooks/useBreakpoint'
import { motion, AnimatePresence } from 'framer-motion'
import { FiVideo, FiPhone, FiShield, FiCheckCircle } from 'react-icons/fi'
import { useSocket } from '../../context/SocketContext'
import VideoCall from '../../components/video/VideoCall'
import Button from '../../components/common/Button'

const PatientVideo = () => {
  const { socket, connected }         = useSocket() || {}
  const { isMobile }                  = useBreakpoint()
  const [incomingCall, setIncoming]   = useState(null)
  const [activeCall, setActiveCall]   = useState(null)

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

  if (activeCall) {
    return (
      <VideoCall
        peerId={activeCall.peerId}
        peerName={activeCall.peerName}
        appointmentId={activeCall.appointmentId}
        initiator={false}
        incomingOffer={activeCall.offer}
        onEnd={() => setActiveCall(null)}
      />
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '0.25rem' }}>
          Video Consultations
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
          Your doctor will call you here when it's time for your consultation.
        </p>
      </motion.div>

      {/* Incoming call */}
      <AnimatePresence>
        {incomingCall ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{ background: 'linear-gradient(135deg,#0f1d3a,#1a3d6e)', borderRadius: 'var(--border-radius-xl)', padding: '3rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', color: '#fff', textAlign: 'center', boxShadow: '0 8px 32px rgba(26,61,110,.4)' }}>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.4 }}
              style={{ width: 88, height: 88, borderRadius: '50%', background: 'var(--color-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', boxShadow: '0 0 0 12px rgba(13,148,136,.2)' }}>
              <FiVideo />
            </motion.div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 'var(--text-2xl)', marginBottom: '0.5rem' }}>
                Incoming Video Call
              </div>
              <div style={{ opacity: 0.75 }}>
                {incomingCall.callerName} is calling you for a consultation
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap:'wrap', justifyContent:'center' }}>
              <Button variant="teal"   size={isMobile ? "md" : "lg"} onClick={acceptCall}><FiVideo /> Accept Call</Button>
              <Button variant="danger" size={isMobile ? "md" : "lg"} onClick={rejectCall}><FiPhone /> Decline</Button>
            </div>
          </motion.div>
        ) : (
          /* Waiting room */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-xl)', padding: isMobile ? '2rem 1.25rem' : '3.5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', textAlign: 'center' }}>

            {/* Pulsing waiting indicator */}
            <div style={{ position: 'relative', width: 90, height: 90 }}>
              <motion.div
                animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--color-teal-light)' }}
              />
              <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '50%', background: 'var(--color-slate-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.25rem', color: 'var(--color-primary-light)' }}>
                <FiVideo />
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 800, fontSize: 'var(--text-xl)', marginBottom: '0.5rem' }}>
                Ready for your consultation
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', maxWidth: 380, lineHeight: 1.75 }}>
                Keep this tab open. When your doctor starts the call, it will appear here automatically.
              </div>
              {!connected && (
                <div style={{ marginTop: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.875rem', background: '#fef3c7', borderRadius: 'var(--border-radius-full)', fontSize: 'var(--text-xs)', color: '#92400e', fontWeight: 600 }}>
                  ⚠ Reconnecting to server — calls may not arrive until this resolves
                </div>
              )}
            </div>

            {/* Checklist */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {[
                '🎥 Camera ready',
                '🎤 Microphone enabled',
                '🔒 End-to-end encrypted',
                '📶 Check your connection',
              ].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4rem 0.875rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-full)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info */}
      <div style={{ background: 'var(--color-info-bg)', border: '1px solid rgba(37,99,235,.2)', borderRadius: 'var(--border-radius)', padding: '0.875rem 1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: 'var(--text-sm)', color: 'var(--color-info)' }}>
        <FiShield size={15} style={{ flexShrink: 0 }} />
        Your calls are peer-to-peer encrypted. No video is recorded or stored by the platform.
      </div>
    </div>
  )
}

export default PatientVideo
