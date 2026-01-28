import React, { useState, useEffect } from 'react'
import { reportsAPI, eventsAPI } from '../services/api'
import { format } from 'date-fns'

function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [recentEvents, setRecentEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [summaryRes, eventsRes] = await Promise.all([
        reportsAPI.getSummary(),
        eventsAPI.getAll()
      ])
      setSummary(summaryRes.data)
      setRecentEvents(eventsRes.data.slice(0, 5))
      setLoading(false)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">Loading dashboard...</div>

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Events</h3>
          <p className="stat-number">{summary?.totalEvents || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Categories</h3>
          <p className="stat-number">{summary?.eventsByCategory?.length || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Platforms</h3>
          <p className="stat-number">{summary?.eventsByPlatform?.filter(p => p.platform).length || 0}</p>
        </div>
      </div>

      <div className="dashboard-section">
        <h3>Events by Category</h3>
        <div className="category-list">
          {summary?.eventsByCategory?.map((cat, idx) => (
            <div key={idx} className="category-item">
              <span className="category-badge" style={{ backgroundColor: cat.color }}>
                {cat.name}
              </span>
              <span className="category-count">{cat.count} events</span>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-section">
        <h3>Recent Events</h3>
        <div className="event-list">
          {recentEvents.map((event) => (
            <div key={event.id} className="event-item">
              <div className="event-date">
                {format(new Date(event.event_date), 'MMM dd, yyyy')}
              </div>
              <div className="event-details">
                <h4>{event.title}</h4>
                <p>{event.contact_name} • {event.platform}</p>
              </div>
              <span 
                className="event-category-badge" 
                style={{ backgroundColor: event.category_color }}
              >
                {event.category_name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
