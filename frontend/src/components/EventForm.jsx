import React, { useState } from 'react'
import { eventsAPI } from '../services/api'
import { format } from 'date-fns'

function EventForm({ event, contacts, categories, onClose }) {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    event_date: event?.event_date ? format(new Date(event.event_date), 'yyyy-MM-dd\'T\'HH:mm') : '',
    contact_id: event?.contact_id || '',
    category_id: event?.category_id || '',
    platform: event?.platform || '',
    notes: event?.notes || ''
  })
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = new FormData()
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key])
      })
      files.forEach(file => {
        data.append('files', file)
      })

      if (event) {
        await eventsAPI.update(event.id, formData)
      } else {
        await eventsAPI.create(data)
      }
      onClose()
    } catch (error) {
      console.error('Error saving event:', error)
      alert('Error saving event')
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{event ? 'Edit Event' : 'Create New Event'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>Date & Time *</label>
            <input
              type="datetime-local"
              name="event_date"
              value={formData.event_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Contact</label>
            <select name="contact_id" value={formData.contact_id} onChange={handleChange}>
              <option value="">Select Contact</option>
              {contacts.map(contact => (
                <option key={contact.id} value={contact.id}>
                  {contact.name} ({contact.type})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Category</label>
            <select name="category_id" value={formData.category_id} onChange={handleChange}>
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Platform</label>
            <select name="platform" value={formData.platform} onChange={handleChange}>
              <option value="">Select Platform</option>
              <option value="Email">Email</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Messenger">Messenger</option>
              <option value="Phone">Phone</option>
              <option value="Meeting">Meeting</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
            />
          </div>

          {!event && (
            <div className="form-group">
              <label>Attachments</label>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx,.txt,.zip"
              />
              {files.length > 0 && (
                <p className="file-info">{files.length} file(s) selected</p>
              )}
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EventForm
