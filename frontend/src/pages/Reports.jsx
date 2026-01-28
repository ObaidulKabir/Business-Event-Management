import React, { useState, useEffect } from 'react'
import { reportsAPI } from '../services/api'
import { format } from 'date-fns'

function Reports() {
  const [summary, setSummary] = useState(null)
  const [detailedReport, setDetailedReport] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const params = {}
      if (dateRange.startDate) params.startDate = dateRange.startDate
      if (dateRange.endDate) params.endDate = dateRange.endDate

      const [summaryRes, detailedRes] = await Promise.all([
        reportsAPI.getSummary(params),
        reportsAPI.getDetailed(params)
      ])
      setSummary(summaryRes.data)
      setDetailedReport(detailedRes.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching reports:', error)
      setLoading(false)
    }
  }

  const handleFilterChange = () => {
    fetchReports()
  }

  const exportToCSV = () => {
    const headers = ['Date', 'Title', 'Contact', 'Category', 'Platform', 'Description']
    const rows = detailedReport.map(event => [
      format(new Date(event.event_date), 'yyyy-MM-dd'),
      event.title,
      event.contact_name || '',
      event.category_name || '',
      event.platform || '',
      event.description || ''
    ])

    let csvContent = headers.join(',') + '\n'
    rows.forEach(row => {
      csvContent += row.map(cell => `"${cell}"`).join(',') + '\n'
    })

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `business-events-report-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
  }

  if (loading) return <div className="loading">Loading reports...</div>

  return (
    <div className="reports-page">
      <h2>Reports</h2>

      <div className="date-filters">
        <label>
          Start Date:
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
          />
        </label>
        <label>
          End Date:
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
          />
        </label>
        <button onClick={handleFilterChange}>Apply Filter</button>
        <button onClick={exportToCSV} className="btn-export">Export to CSV</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Events</h3>
          <p className="stat-number">{summary?.totalEvents || 0}</p>
        </div>
      </div>

      <div className="report-section">
        <h3>Events by Category</h3>
        <div className="chart-container">
          {summary?.eventsByCategory?.map((cat, idx) => (
            <div key={idx} className="bar-item">
              <span className="bar-label">{cat.name}</span>
              <div className="bar-container">
                <div 
                  className="bar-fill" 
                  style={{ 
                    width: `${(cat.count / summary.totalEvents) * 100}%`,
                    backgroundColor: cat.color 
                  }}
                />
              </div>
              <span className="bar-value">{cat.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="report-section">
        <h3>Events by Platform</h3>
        <div className="platform-list">
          {summary?.eventsByPlatform?.filter(p => p.platform).map((platform, idx) => (
            <div key={idx} className="platform-item">
              <span>{platform.platform}</span>
              <span>{platform.count} events</span>
            </div>
          ))}
        </div>
      </div>

      <div className="report-section">
        <h3>Detailed Event List</h3>
        <div className="detailed-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Contact</th>
                <th>Category</th>
                <th>Platform</th>
                <th>Attachments</th>
              </tr>
            </thead>
            <tbody>
              {detailedReport.map((event) => (
                <tr key={event.id}>
                  <td>{format(new Date(event.event_date), 'MMM dd, yyyy')}</td>
                  <td>{event.title}</td>
                  <td>{event.contact_name || 'N/A'}</td>
                  <td>
                    <span 
                      className="category-badge" 
                      style={{ backgroundColor: event.category_color }}
                    >
                      {event.category_name}
                    </span>
                  </td>
                  <td>{event.platform || 'N/A'}</td>
                  <td>{event.attachment_count || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Reports
