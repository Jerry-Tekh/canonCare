import React, { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhoneOff,
  FiWifi, FiWifiOff, FiRotateCcw, FiAlertCircle,
} from 'react-icons/fi'
import { useSocket } from '../../context/SocketContext'

// ── ICE server configuration ──────────────────────────────────
const buildIceServers = async () => {
  const apiKey  = import.meta.env.VITE_METERED_API_KEY
  const appName = import.meta.env.VITE_METERED_APP_NAME
  if (apiKey && appName) {
    try {
      const res  = await fetch(`https://${appName}.metered.live/api/v1/turn/credentials?apiKey=${apiKey}`)
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) return data
    } catch { /* fall through to defaults */ }
  }
  return [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'turn:openrelay.metered.ca:80',              username: 'openrelayproject', credential: 'openrelayproject' },
    { urls: 'turn:openrelay.metered.ca:443',             username: 'openrelayproject', credential: 'openrelayproject' },
    { urls: 'turn:openrelay.metered.ca:443?transport=tcp', username: 'openrelayproject', credential: 'openrelayproject' },
  ]
}

const S = {
  INIT:         'init',
  GETTING_MEDIA: 'getting_media',
  CALLING:      'calling',
  CONNECTING:   'connecting',
  CONNECTED:    'connected',
  RECONNECTING: 'reconnecting',
  REJECTED:     'rejected',
  ENDED:        'ended',
  ERROR:        'error',
}

const STATE_LABEL = {
  [S.INIT]:          'Preparing…',
  [S.GETTING_MEDIA]: 'Accessing camera & microphone…',
  [S.CALLING]:       'Ringing…',
  [S.CONNECTING]:    'Connecting…',
  [S.CONNECTED]:     '',
  [S.RECONNECTING]:  'Reconnecting…',
  [S.REJECTED]:      'Call declined',
  [S.ENDED]:         'Call ended',
  [S.ERROR]:         'Error',
}

/**
 * VideoCall — pure WebRTC, no simple-peer
 *
 * Echo prevention:
 *  - localVideoRef has muted={true} so the local speaker never feeds back
 *  - getUserMedia captures with echoCancellation, noiseSuppression, autoGainControl
 *  - remoteVideoRef has NO muted — remote audio plays normally
 *
 * Call routing fix:
 *  - peerId must be users.id (the socket room key), NOT patients.id
 *  - DoctorVideo now passes patient_user_id from appointment SELECT
 */
const VideoCall = ({ peerId, peerName, peerAvatar, appointmentId, initiator = true, incomingOffer, onEnd }) => {
  const { socket } = useSocket() || {}

  const localVideoRef   = useRef(null)
  const remoteVideoRef  = useRef(null)
  const pcRef           = useRef(null)
  const localStreamRef  = useRef(null)
  const pendingICE      = useRef([])
  const timeoutHandle   = useRef(null)
  const durationHandle  = useRef(null)
  const reconnectCount  = useRef(0)
  const MAX_RECONNECT   = 3

  const [callState, setState]   = useState(S.INIT)
  const [audioOn, setAudioOn]   = useState(true)
  const [videoOn, setVideoOn]   = useState(true)
  const [duration, setDuration] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [netQuality, setNetQ]   = useState('good')

  // ── Cleanup all resources ──────────────────────────────────
  const cleanup = useCallback(() => {
    clearTimeout(timeoutHandle.current)
    clearInterval(durationHandle.current)

    if (pcRef.current) {
      pcRef.current.onicecandidate             = null
      pcRef.current.ontrack                    = null
      pcRef.current.oniceconnectionstatechange = null
      pcRef.current.onconnectionstatechange    = null
      pcRef.current.close()
      pcRef.current = null
    }

    // Stop all tracks — releases camera/mic LED
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop())
      localStreamRef.current = null
    }

    // Clear video elements
    if (localVideoRef.current)  localVideoRef.current.srcObject  = null
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
  }, [])

  // ── Hang up ────────────────────────────────────────────────
  const hangUp = useCallback((reason = 'user_ended') => {
    socket?.emit('call:end', { peerId, reason })
    cleanup()
    setState(S.ENDED)
    setTimeout(() => onEnd?.(), 1500)
  }, [socket, peerId, cleanup, onEnd])

  // ── Get user media with echo cancellation ──────────────────
  const getMedia = useCallback(async () => {
    setState(S.GETTING_MEDIA)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width:     { ideal: 1280 },
          height:    { ideal: 720 },
          facingMode: 'user',
        },
        audio: {
          echoCancellation:    true,   // ← prevents echo
          noiseSuppression:    true,   // ← cleaner audio
          autoGainControl:     true,   // ← consistent volume
          sampleRate:          48000,
        },
      })
      localStreamRef.current = stream

      // Attach to local video — MUTED to prevent speaker feedback (echo fix)
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
        localVideoRef.current.muted     = true   // ← critical: mute local playback
        localVideoRef.current.volume    = 0      // ← belt-and-suspenders echo prevention
      }

      return stream
    } catch (err) {
      const msg =
        err.name === 'NotAllowedError'  ? 'Camera/microphone permission denied. Please allow access in your browser settings and reload.' :
        err.name === 'NotFoundError'    ? 'No camera or microphone detected. Please connect a device and try again.' :
        err.name === 'NotReadableError' ? 'Camera or microphone is in use by another application. Please close it and try again.' :
        err.name === 'OverconstrainedError' ? 'Camera does not support the requested resolution. Trying fallback…' :
        `Media error: ${err.message}`

      // Fallback for OverconstrainedError — try without constraints
      if (err.name === 'OverconstrainedError') {
        try {
          const fallback = await navigator.mediaDevices.getUserMedia({ video: true, audio: { echoCancellation: true, noiseSuppression: true } })
          localStreamRef.current = fallback
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = fallback
            localVideoRef.current.muted     = true
            localVideoRef.current.volume    = 0
          }
          return fallback
        } catch {}
      }

      setErrorMsg(msg)
      setState(S.ERROR)
      return null
    }
  }, [])

  // ── Build RTCPeerConnection ────────────────────────────────
  const createPC = useCallback(async (stream) => {
    const iceServers = await buildIceServers()
    const pc = new RTCPeerConnection({
      iceServers,
      iceCandidatePoolSize: 10,
      // Bundle audio and video on same transport (reduces latency)
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require',
    })
    pcRef.current = pc

    // Add all local tracks to peer connection
    stream.getTracks().forEach(track => pc.addTrack(track, stream))

    // ICE candidates → relay to peer via socket
    pc.onicecandidate = ({ candidate }) => {
      if (candidate) socket?.emit('call:ice-candidate', { peerId, candidate })
    }

    // Remote stream → attach to video element (NOT muted — we want to hear the other person)
    pc.ontrack = ({ streams }) => {
      const [remoteStream] = streams
      if (remoteVideoRef.current && remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream
        // Ensure remote audio is audible
        remoteVideoRef.current.muted  = false
        remoteVideoRef.current.volume = 1.0
      }
    }

    // Monitor ICE connection state
    pc.oniceconnectionstatechange = () => {
      const s = pc.iceConnectionState
      console.log('[WebRTC] ICE state:', s)

      if (s === 'connected' || s === 'completed') {
        setState(S.CONNECTED)
        setNetQ('good')
        reconnectCount.current = 0
        clearTimeout(timeoutHandle.current)
        durationHandle.current = setInterval(() => setDuration(d => d + 1), 1000)
      } else if (s === 'disconnected') {
        setNetQ('poor')
        setState(S.RECONNECTING)
        timeoutHandle.current = setTimeout(() => {
          if (pcRef.current?.iceConnectionState === 'disconnected') {
            if (reconnectCount.current < MAX_RECONNECT) {
              reconnectCount.current++
              pcRef.current.restartIce?.()
            } else {
              setErrorMsg('Connection lost after multiple reconnection attempts.')
              hangUp('connection_lost')
            }
          }
        }, 8000)
      } else if (s === 'failed') {
        setNetQ('lost')
        if (reconnectCount.current < MAX_RECONNECT) {
          reconnectCount.current++
          pcRef.current?.restartIce?.()
          setState(S.RECONNECTING)
        } else {
          setErrorMsg('Connection failed. Please check your internet connection and try again.')
          hangUp('connection_failed')
        }
      } else if (s === 'closed') {
        setState(S.ENDED)
      }
    }

    // Flush any ICE candidates that arrived before remote description was set
    for (const c of pendingICE.current) {
      try { await pc.addIceCandidate(c) } catch {}
    }
    pendingICE.current = []

    return pc
  }, [socket, peerId, hangUp])

  // ── Caller: get media → create offer → send ────────────────
  const startCall = useCallback(async () => {
    const stream = await getMedia()
    if (!stream) return

    setState(S.CALLING)
    const pc = await createPC(stream)

    const offer = await pc.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    })
    await pc.setLocalDescription(offer)

    socket?.emit('call:initiate', { receiverId: peerId, signal: offer, appointmentId })

    // 45-second no-answer timeout
    timeoutHandle.current = setTimeout(() => {
      if (callState !== S.CONNECTED) {
        setErrorMsg('No answer. The other party did not pick up.')
        cleanup()
        setState(S.ENDED)
        setTimeout(() => onEnd?.(), 2000)
      }
    }, 45000)
  }, [getMedia, createPC, socket, peerId, appointmentId, callState, cleanup, onEnd])

  // ── Callee: get media → set remote offer → answer ──────────
  const answerCall = useCallback(async (offer) => {
    const stream = await getMedia()
    if (!stream) return

    setState(S.CONNECTING)
    const pc = await createPC(stream)

    await pc.setRemoteDescription(new RTCSessionDescription(offer))
    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    socket?.emit('call:accept', { callerId: peerId, signal: answer })
  }, [getMedia, createPC, socket, peerId])

  // ── Socket event listeners ─────────────────────────────────
  useEffect(() => {
    if (!socket) return

    const onAccepted = async ({ signal }) => {
      try {
        setState(S.CONNECTING)
        await pcRef.current?.setRemoteDescription(new RTCSessionDescription(signal))
        // Flush pending ICE candidates that arrived before answer
        for (const c of pendingICE.current) {
          try { await pcRef.current.addIceCandidate(c) } catch {}
        }
        pendingICE.current = []
      } catch {
        setErrorMsg('Failed to establish connection.')
        setState(S.ERROR)
      }
    }

    const onRejected = () => {
      setErrorMsg('')
      cleanup()
      setState(S.REJECTED)
      setTimeout(() => onEnd?.(), 2500)
    }

    // Receiver is offline — fail fast instead of waiting for the 45s timeout
    const onUnavailable = () => {
      clearTimeout(timeoutHandle.current)
      setErrorMsg(`${peerName} is currently offline and cannot be reached.`)
      cleanup()
      setState(S.ENDED)
      setTimeout(() => onEnd?.(), 2500)
    }

    const onEnded = () => {
      cleanup()
      setState(S.ENDED)
      setTimeout(() => onEnd?.(), 1500)
    }

    const onICE = async ({ candidate }) => {
      const c = new RTCIceCandidate(candidate)
      if (!pcRef.current || !pcRef.current.remoteDescription) {
        // Buffer until remote description is set
        pendingICE.current.push(c)
        return
      }
      try { await pcRef.current.addIceCandidate(c) } catch {}
    }

    socket.on('call:accepted',      onAccepted)
    socket.on('call:rejected',      onRejected)
    socket.on('call:ended',         onEnded)
    socket.on('call:ice-candidate', onICE)
    socket.on('call:unavailable',   onUnavailable)

    return () => {
      socket.off('call:accepted',      onAccepted)
      socket.off('call:rejected',      onRejected)
      socket.off('call:ended',         onEnded)
      socket.off('call:ice-candidate', onICE)
      socket.off('call:unavailable',   onUnavailable)
    }
  }, [socket, cleanup, onEnd])

  // ── Mount: initiate or answer ──────────────────────────────
  useEffect(() => {
    if (initiator) {
      startCall()
    } else if (incomingOffer) {
      answerCall(incomingOffer)
    }
    // Cleanup on unmount
    return () => {
      cleanup()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Controls ───────────────────────────────────────────────
  const toggleAudio = () => {
    if (!localStreamRef.current) return
    localStreamRef.current.getAudioTracks().forEach(t => { t.enabled = !t.enabled })
    setAudioOn(p => !p)
  }

  const toggleVideo = () => {
    if (!localStreamRef.current) return
    localStreamRef.current.getVideoTracks().forEach(t => { t.enabled = !t.enabled })
    setVideoOn(p => !p)
  }

  const fmtDuration = s =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const isConnected = callState === S.CONNECTED
  const isTerminal  = [S.ENDED, S.ERROR, S.REJECTED].includes(callState)
  const peerInitial = peerName?.[0]?.toUpperCase() || '?'
  const statusLabel = callState === S.CONNECTED ? fmtDuration(duration) : (errorMsg || STATE_LABEL[callState])

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ position:'fixed', inset:0, background:'#0a0f1a', zIndex:9000, display:'flex', flexDirection:'column', userSelect:'none' }}>

      {/* Top bar */}
      <div style={{ position:'absolute', top:0, left:0, right:0, zIndex:2, padding:'1rem 1.5rem', background:'linear-gradient(to bottom,rgba(0,0,0,.65),transparent)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
          <div style={{ width:38, height:38, borderRadius:'50%', overflow:'hidden', background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#fff', fontSize:'var(--text-lg)' }}>
            {peerAvatar ? <img src={peerAvatar} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : peerInitial}
          </div>
          <div>
            <div style={{ color:'#fff', fontWeight:700 }}>{peerName}</div>
            <div style={{ color:'rgba(255,255,255,.6)', fontSize:'var(--text-xs)', display:'flex', alignItems:'center', gap:'0.375rem' }}>
              {callState === S.RECONNECTING && <FiRotateCcw size={10} style={{ animation:'spin 1s linear infinite' }} />}
              {statusLabel}
            </div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'0.375rem' }}>
          {netQuality === 'good' && <FiWifi    size={16} color="#22c55e" />}
          {netQuality === 'poor' && <FiWifi    size={16} color="#f59e0b" />}
          {netQuality === 'lost' && <FiWifiOff size={16} color="#ef4444" />}
          {netQuality !== 'good' && (
            <span style={{ fontSize:'var(--text-xs)', color:'rgba(255,255,255,.6)' }}>
              {netQuality === 'poor' ? 'Weak signal' : 'Connection lost'}
            </span>
          )}
        </div>
      </div>

      {/* Remote video — NOT muted (we want to hear the other person) */}
      <div style={{ flex:1, position:'relative', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          muted={false}
          style={{ width:'100%', height:'100%', objectFit:'cover', display: isConnected ? 'block' : 'none' }}
        />

        {/* Pre-connect / terminal states */}
        {!isConnected && (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'1.25rem', padding:'2rem', textAlign:'center' }}>
            {isTerminal ? (
              <FiAlertCircle size={48} color={callState === S.REJECTED ? '#f59e0b' : '#ef4444'} />
            ) : (
              <motion.div
                animate={isTerminal ? {} : { scale:[1,1.08,1] }}
                transition={{ repeat:Infinity, duration:2 }}
                style={{ width:96, height:96, borderRadius:'50%', border:'3px solid rgba(255,255,255,.2)', background:'rgba(255,255,255,.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2.5rem', fontWeight:800, color:'#fff', overflow:'hidden' }}>
                {peerAvatar ? <img src={peerAvatar} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : peerInitial}
              </motion.div>
            )}
            <div style={{ color:'#fff', fontWeight:700, fontSize:'var(--text-xl)' }}>{peerName}</div>
            {!isTerminal && (
              <div style={{ width:36, height:36, borderRadius:'50%', border:'3px solid rgba(255,255,255,.15)', borderTopColor:'var(--color-teal)', animation:'spin .9s linear infinite' }} />
            )}
            <div style={{ color:'rgba(255,255,255,.65)', fontSize:'var(--text-sm)' }}>
              {errorMsg || STATE_LABEL[callState]}
            </div>
            {isTerminal && (
              <button onClick={() => onEnd?.()} style={{ marginTop:'0.5rem', padding:'0.625rem 1.75rem', background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.2)', borderRadius:'var(--border-radius-full)', color:'#fff', cursor:'pointer', fontSize:'var(--text-sm)', fontFamily:'inherit', fontWeight:600 }}>
                Close
              </button>
            )}
          </div>
        )}
      </div>

      {/* Local PiP — MUTED to prevent echo */}
      <AnimatePresence>
        {localStreamRef.current && (
          <motion.div
            initial={{ opacity:0, scale:0.85 }}
            animate={{ opacity:1, scale:1 }}
            exit={{ opacity:0, scale:0.85 }}
            style={{ position:'absolute', bottom:'6rem', right:'1.25rem', width:160, aspectRatio:'4/3', borderRadius:'var(--border-radius-lg)', overflow:'hidden', border:'2px solid rgba(255,255,255,.2)', background:'#111', boxShadow:'0 8px 24px rgba(0,0,0,.5)' }}>
            {/* muted=true AND volume=0 prevents local audio echo */}
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              style={{ width:'100%', height:'100%', objectFit:'cover', display: videoOn ? 'block' : 'none' }}
            />
            {!videoOn && (
              <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,.4)' }}>
                <FiVideoOff size={22} />
              </div>
            )}
            <div style={{ position:'absolute', bottom:4, left:6, fontSize:'0.6rem', color:'rgba(255,255,255,.6)', background:'rgba(0,0,0,.45)', padding:'1px 5px', borderRadius:3 }}>
              You
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      {!isTerminal && (
        <div style={{ padding:'1rem 2rem 2rem', display:'flex', justifyContent:'center', gap:'1rem', background:'linear-gradient(to top,rgba(0,0,0,.65),transparent)' }}>
          {[
            { icon: audioOn ? <FiMic size={20} /> : <FiMicOff size={20} />,     label: audioOn ? 'Mute'    : 'Unmute',  onClick: toggleAudio, dim: !audioOn },
            { icon: videoOn ? <FiVideo size={20} /> : <FiVideoOff size={20} />, label: videoOn ? 'Cam off' : 'Cam on',  onClick: toggleVideo, dim: !videoOn },
            { icon: <FiPhoneOff size={22} />,                                   label: 'End call',                      onClick: () => hangUp(), end: true },
          ].map(b => (
            <div key={b.label} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0.375rem' }}>
              <button
                onClick={b.onClick}
                style={{ width:56, height:56, borderRadius:'50%', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', background: b.end ? '#dc2626' : b.dim ? 'rgba(255,255,255,.06)' : 'rgba(255,255,255,.15)', color: b.dim ? '#fca5a5' : '#fff', transition:'all .15s', boxShadow: b.end ? '0 4px 16px rgba(220,38,38,.45)' : 'none' }}>
                {b.icon}
              </button>
              <span style={{ fontSize:'0.65rem', color:'rgba(255,255,255,.5)', whiteSpace:'nowrap' }}>{b.label}</span>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  )
}

export default VideoCall
