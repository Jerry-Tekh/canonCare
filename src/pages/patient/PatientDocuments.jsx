import React, { useEffect, useState, useRef, useCallback } from 'react'
import useBreakpoint from '../../hooks/useBreakpoint'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiUpload, FiFile, FiDownload, FiFileText,
  FiImage, FiFolder, FiFilter, FiRefreshCw,
} from 'react-icons/fi'
import api from '../../services/api'
import { useToast } from '../../components/common/Toast'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'

const DOC_TYPES = [
  { value: '',                  label: 'All Documents',     icon: <FiFolder /> },
  { value: 'lab_report',        label: 'Lab Reports',       icon: <FiFileText />,  color: '#dbeafe', iconColor: '#2563b0' },
  { value: 'imaging',           label: 'Imaging / X-Ray',   icon: <FiImage />,     color: '#ede9fe', iconColor: '#7c3aed' },
  { value: 'prescription',      label: 'Prescriptions',     icon: <FiFileText />,  color: '#d1fae5', iconColor: '#059669' },
  { value: 'discharge_summary', label: 'Discharge Summary', icon: <FiFile />,      color: '#fef3c7', iconColor: '#d97706' },
  { value: 'referral',          label: 'Referrals',         icon: <FiFile />,      color: '#ccfbf1', iconColor: '#0d9488' },
  { value: 'insurance',         label: 'Insurance',         icon: <FiFolder />,    color: '#fee2e2', iconColor: '#dc2626' },
  { value: 'consent_form',      label: 'Consent Forms',     icon: <FiFile />,      color: '#e0e7ff', iconColor: '#4f46e5' },
  { value: 'general',           label: 'General',           icon: <FiFile />,      color: '#f1f5f9', iconColor: '#6b7280' },
]

const getTypeInfo = (type) => DOC_TYPES.find(t => t.value === type) || DOC_TYPES[DOC_TYPES.length - 1]

const fmtSize = (bytes) => {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

const PatientDocuments = () => {
  const { toast }    = useToast() || {}
  const { isMobile }  = useBreakpoint()
  const fileInputRef = useRef(null)

  const [docs, setDocs]               = useState([])
  const [loading, setLoading]         = useState(true)
  const [filter, setFilter]           = useState('')
  const [uploadModal, setUploadModal] = useState(false)
  const [uploading, setUploading]     = useState(false)
  const [uploadForm, setUploadForm]   = useState({ title: '', description: '', document_type: 'general' })
  const [selectedFile, setSelectedFile] = useState(null)
  const [dragOver, setDragOver]         = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = filter ? `?type=${filter}` : ''
      const res    = await api.get(`/documents${params}`)
      setDocs(res.data || [])
    } catch {
      setDocs([])
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { load() }, [load])

  const handleFileSelect = (file) => {
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      toast?.('File must be under 10 MB', 'error')
      return
    }
    setSelectedFile(file)
    if (!uploadForm.title) {
      setUploadForm(p => ({ ...p, title: file.name.replace(/\.[^.]+$/, '') }))
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) { toast?.('Please select a file', 'error'); return }
    if (!uploadForm.title.trim()) { toast?.('Please enter a document title', 'error'); return }

    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', selectedFile)
      fd.append('title', uploadForm.title.trim())
      fd.append('description', uploadForm.description)
      fd.append('document_type', uploadForm.document_type)
      await api.upload('/documents', fd)
      toast?.('Document uploaded successfully', 'success')
      setUploadModal(false)
      setSelectedFile(null)
      setUploadForm({ title: '', description: '', document_type: 'general' })
      load()
    } catch (err) {
      toast?.(err?.data?.message || 'Upload failed. Please try again.', 'error')
    } finally {
      setUploading(false)
    }
  }

  const closeModal = () => {
    setUploadModal(false)
    setSelectedFile(null)
    setUploadForm({ title: '', description: '', document_type: 'general' })
  }

  const displayDocs = filter ? docs.filter(d => d.document_type === filter) : docs

  // Group counts for filter tabs
  const counts = docs.reduce((acc, d) => {
    acc[d.document_type] = (acc[d.document_type] || 0) + 1
    return acc
  }, {})

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '0.25rem' }}>
            Medical Documents
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            {docs.length} document{docs.length !== 1 ? 's' : ''} in your secure record
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.625rem' }}>
          <Button variant="ghost" size="sm" onClick={load}><FiRefreshCw size={14} /></Button>
          <Button variant="teal" onClick={() => setUploadModal(true)}>
            <FiUpload size={14} /> Upload Document
          </Button>
        </div>
      </div>

      {/* Category filter tabs */}
      {docs.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: isMobile ? 'nowrap' : 'wrap', overflowX: isMobile ? 'auto' : 'visible', paddingBottom: isMobile ? '0.25rem' : 0 }}>
          <button
            onClick={() => setFilter('')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.875rem', borderRadius: 'var(--border-radius-full)', border: `1.5px solid ${filter === '' ? 'var(--color-primary-light)' : 'var(--border-color)'}`, background: filter === '' ? 'var(--color-slate-light)' : '#fff', color: filter === '' ? 'var(--color-primary-light)' : 'var(--text-secondary)', fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer', transition: 'all .15s' }}>
            <FiFolder size={11} /> All ({docs.length})
          </button>
          {DOC_TYPES.slice(1).filter(t => counts[t.value]).map(t => (
            <button key={t.value}
              onClick={() => setFilter(t.value)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.875rem', borderRadius: 'var(--border-radius-full)', border: `1.5px solid ${filter === t.value ? 'var(--color-primary-light)' : 'var(--border-color)'}`, background: filter === t.value ? 'var(--color-slate-light)' : '#fff', color: filter === t.value ? 'var(--color-primary-light)' : 'var(--text-secondary)', fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer', transition: 'all .15s' }}>
              {t.label} ({counts[t.value]})
            </button>
          ))}
        </div>
      )}

      {/* Document grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <LoadingSpinner />
        </div>
      ) : displayDocs.length === 0 ? (
        <EmptyState
          icon={<FiFolder />}
          title={filter ? `No ${getTypeInfo(filter).label.toLowerCase()} found` : 'No documents yet'}
          message="Upload lab reports, prescriptions, imaging results, and other medical records to keep everything secure and accessible."
          action={
            <Button variant="teal" onClick={() => setUploadModal(true)}>
              <FiUpload size={14} /> Upload your first document
            </Button>
          }
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
          <AnimatePresence initial={false}>
            {displayDocs.map((doc, i) => {
              const typeInfo = getTypeInfo(doc.document_type)
              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '0.875rem', transition: 'all .2s', cursor: 'default' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = '' }}>

                  {/* Icon + title */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div style={{ width: 46, height: 46, borderRadius: 'var(--border-radius)', background: typeInfo.color || '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0, color: typeInfo.iconColor || '#6b7280' }}>
                      {typeInfo.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: '0.2rem', lineHeight: 1.3 }}
                        className="truncate" title={doc.title}>
                        {doc.title}
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        {new Date(doc.created_at).toLocaleDateString()} · {fmtSize(doc.file_size)}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {doc.description && (
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {doc.description}
                    </p>
                  )}

                  {/* Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.375rem', borderTop: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: 'var(--text-xs)', color: typeInfo.iconColor || 'var(--text-muted)', fontWeight: 600, background: typeInfo.color || '#f1f5f9', padding: '2px 8px', borderRadius: 'var(--border-radius-full)' }}>
                      {typeInfo.label}
                    </span>
                    {doc.file_url && (
                      <a href={doc.file_url} download target="_blank" rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: 'var(--text-xs)', color: 'var(--color-primary-light)', fontWeight: 600, textDecoration: 'none' }}
                        onClick={e => e.stopPropagation()}>
                        <FiDownload size={12} /> Download
                      </a>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        open={uploadModal}
        onClose={closeModal}
        title="Upload Medical Document"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button loading={uploading} onClick={handleUpload}>
              <FiUpload size={14} /> Upload
            </Button>
          </>
        }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files[0]) }}
            style={{ border: `2px dashed ${dragOver ? 'var(--color-primary-light)' : selectedFile ? 'var(--color-teal)' : 'var(--border-color)'}`, borderRadius: 'var(--border-radius-lg)', padding: isMobile ? '1.25rem' : '2rem', textAlign: 'center', cursor: 'pointer', background: dragOver ? 'var(--color-slate-light)' : selectedFile ? 'var(--color-teal-light)' : 'var(--bg-secondary)', transition: 'all .2s' }}>
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt,.dicom"
              onChange={e => handleFileSelect(e.target.files[0])}
            />
            {selectedFile ? (
              <>
                <FiFile size={32} color="var(--color-teal)" style={{ marginBottom: '0.5rem' }} />
                <div style={{ fontWeight: 700, color: 'var(--color-teal)', fontSize: 'var(--text-sm)' }}>{selectedFile.name}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {fmtSize(selectedFile.size)} · Click or drag to replace
                </div>
              </>
            ) : (
              <>
                <FiUpload size={32} color="var(--text-muted)" style={{ marginBottom: '0.75rem' }} />
                <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Click or drag file here
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  PDF, JPG, PNG, DOC up to 10 MB
                </div>
              </>
            )}
          </div>

          {/* Title */}
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
              Title <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <input
              value={uploadForm.title}
              onChange={e => setUploadForm(p => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Blood Test Results – June 2025"
              style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1.5px solid var(--border-color)', borderRadius: 'var(--border-radius)', fontSize: 'var(--text-base)', fontFamily: 'inherit', outline: 'none' }}
              onFocus={e => e.target.style.borderColor = 'var(--color-primary-light)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
            />
          </div>

          {/* Document type */}
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
              Document Type
            </label>
            <select
              value={uploadForm.document_type}
              onChange={e => setUploadForm(p => ({ ...p, document_type: e.target.value }))}
              style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1.5px solid var(--border-color)', borderRadius: 'var(--border-radius)', fontSize: 'var(--text-base)', fontFamily: 'inherit', outline: 'none', background: '#fff', cursor: 'pointer' }}
              onFocus={e => e.target.style.borderColor = 'var(--color-primary-light)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-color)'}>
              {DOC_TYPES.slice(1).map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
              Description <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              value={uploadForm.description}
              onChange={e => setUploadForm(p => ({ ...p, description: e.target.value }))}
              rows={2}
              placeholder="Brief description of this document…"
              style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1.5px solid var(--border-color)', borderRadius: 'var(--border-radius)', fontSize: 'var(--text-base)', fontFamily: 'inherit', resize: 'vertical', outline: 'none' }}
              onFocus={e => e.target.style.borderColor = 'var(--color-primary-light)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default PatientDocuments
