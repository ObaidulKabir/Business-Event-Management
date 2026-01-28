import React, { useState, useEffect } from 'react'
import { contactsAPI } from '../services/api'
import ContactForm from '../components/ContactForm'

function Contacts() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingContact, setEditingContact] = useState(null)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    fetchContacts()
  }, [filter])

  const fetchContacts = async () => {
    try {
      const params = filter ? { type: filter } : {}
      const res = await contactsAPI.getAll(params)
      setContacts(res.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching contacts:', error)
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this contact?')) return
    try {
      await contactsAPI.delete(id)
      fetchContacts()
    } catch (error) {
      console.error('Error deleting contact:', error)
    }
  }

  const handleEdit = (contact) => {
    setEditingContact(contact)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingContact(null)
    fetchContacts()
  }

  if (loading) return <div className="loading">Loading contacts...</div>

  return (
    <div className="contacts-page">
      <div className="page-header">
        <h2>Contacts</h2>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          Add New Contact
        </button>
      </div>

      <div className="filters">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All Types</option>
          <option value="Employee">Employee</option>
          <option value="Client">Client</option>
          <option value="Designer">Designer</option>
          <option value="Vendor">Vendor</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="contacts-grid">
        {contacts.length === 0 ? (
          <p>No contacts found</p>
        ) : (
          contacts.map((contact) => (
            <div key={contact.id} className="contact-card">
              <h3>{contact.name}</h3>
              <p className="contact-type">{contact.type}</p>
              <div className="contact-details">
                {contact.email && <p><strong>Email:</strong> {contact.email}</p>}
                {contact.phone && <p><strong>Phone:</strong> {contact.phone}</p>}
                {contact.company && <p><strong>Company:</strong> {contact.company}</p>}
                {contact.notes && <p><strong>Notes:</strong> {contact.notes}</p>}
              </div>
              <div className="contact-actions">
                <button onClick={() => handleEdit(contact)}>Edit</button>
                <button onClick={() => handleDelete(contact.id)} className="btn-danger">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <ContactForm
          contact={editingContact}
          onClose={handleFormClose}
        />
      )}
    </div>
  )
}

export default Contacts
