import React, { useState, useEffect } from 'react'
import { eventsAPI, contactsAPI, categoriesAPI, searchAPI } from '../services/api'
import { format } from 'date-fns'
import EventForm from '../components/EventForm'

function Events() {
  const [events, setEvents] = useState([])
  const [contacts, setContacts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    category: '',
    contact: '',
    platform: '',
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    fetchData()
  }, [filters])

  const fetchData = async () => {
    try {
      const [eventsRes, contactsRes, categoriesRes] = await Promise.all([
        eventsAPI.getAll(filters),
        contactsAPI.getAll(),
        categoriesAPI.getAll()
      ])
      setEvents(eventsRes.data)
      setContacts(contactsRes.data)
      setCategories(categoriesRes.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchData()
      return
    }
    try {
      const res = await searchAPI.search(searchQuery, 'events')
      setEvents(res.data.events || [])
    } catch (error) {
      console.error('Error searching:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this event?')) return
    try {
      await eventsAPI.delete(id)
      fetchData()
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  const handleEdit = (event) => {
    setEditingEvent(event)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingEvent(null)
    fetchData()
  }

  if (loading) return <div className="loading">Loading events...</div>

  return (
    <div className="events-page">
      <div className="page-header">
        <h2>Events</h2>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          Add New Event
        </button>
      </div>

      <div className="search-filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch}>Search</button>
        </div>

        <div className="filters">
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <select
            value={filters.contact}
            onChange={(e) => setFilters({ ...filters, contact: e.target.value })}
          >
            <option value="">All Contacts</option>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>{contact.name}</option>
            ))}
          </select>

          <select
            value={filters.platform}
            onChange={(e) => setFilters({ ...filters, platform: e.target.value })}
          >
            <option value="">All Platforms</option>
            <option value="Email">Email</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Messenger">Messenger</option>
            <option value="Phone">Phone</option>
            <option value="Meeting">Meeting</option>
          </select>
        </div>
      </div>

      <div className="events-grid">
        {events.length === 0 ? (
          <p>No events found</p>
        ) : (
          events.map((event) => (
            <div key={event.id} className="event-card">
              <div className="event-card-header">
                <h3>{event.title}</h3>
                <span 
                  className="event-category-badge" 
                  style={{ backgroundColor: event.category_color }}
                >
                  {event.category_name}
                </span>
              </div>
              <p className="event-description">{event.description}</p>
              <div className="event-meta">
                <p><strong>Date:</strong> {format(new Date(event.event_date), 'PPP')}</p>
                <p><strong>Contact:</strong> {event.contact_name || 'N/A'}</p>
                <p><strong>Platform:</strong> {event.platform || 'N/A'}</p>
              </div>
              <div className="event-actions">
                <button onClick={() => handleEdit(event)}>Edit</button>
                <button onClick={() => handleDelete(event.id)} className="btn-danger">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <EventForm
          event={editingEvent}
          contacts={contacts}
          categories={categories}
          onClose={handleFormClose}
        />
      )}
    </div>
  )
}

export default Events
