import React, { useState } from 'react'
import { contactsAPI } from '../services/api'

function ContactForm({ contact, onClose }) {
  const [formData, setFormData] = useState({
    name: contact?.name || '',
    type: contact?.type || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    company: contact?.company || '',
    notes: contact?.notes || ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (contact) {
        await contactsAPI.update(contact.id, formData)
      } else {
        await contactsAPI.create(formData)
      }
      onClose()
    } catch (error) {
      console.error('Error saving contact:', error)
      alert('Error saving contact')
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{contact ? 'Edit Contact' : 'Create New Contact'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Type *</label>
            <select name="type" value={formData.type} onChange={handleChange} required>
              <option value="">Select Type</option>
              <option value="Employee">Employee</option>
              <option value="Client">Client</option>
              <option value="Designer">Designer</option>
              <option value="Vendor">Vendor</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Company</label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
            />
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

export default ContactForm
