# Business Event Manager

A comprehensive application for managing daily business interactions and events with stakeholders including employees, clients, designers, and vendors. Track conversations, files, and images exchanged across multiple platforms (Email, WhatsApp, Messenger) with proper timestamps, filtering, search capabilities, and reporting features.

## Features

- **Event Management**: Record and manage daily business events with detailed information
- **Contact Management**: Organize contacts by type (Employee, Client, Designer, Vendor)
- **Multi-Platform Support**: Track communications across Email, WhatsApp, Messenger, Phone, and Meetings
- **File Attachments**: Upload and store images, documents, and files with events
- **Advanced Filtering**: Filter events by category, contact, platform, and date range
- **Full-Text Search**: Search across events, contacts, and attachments
- **Reporting & Analytics**: Generate reports with visualizations and export to CSV
- **Category System**: Pre-defined and custom categories with color coding

## Technology Stack

### Backend
- Node.js & Express.js
- SQLite Database
- Multer for file uploads
- RESTful API architecture

### Frontend
- React 18
- React Router for navigation
- Axios for API calls
- Vite for fast development
- Responsive CSS design

## Project Structure

```
business-event-manager/
├── backend/
│   ├── database/
│   │   ├── db.js              # Database connection wrapper
│   │   └── business_events.db # SQLite database (created on init)
│   ├── routes/
│   │   ├── events.js          # Events API endpoints
│   │   ├── contacts.js        # Contacts API endpoints
│   │   ├── categories.js      # Categories API endpoints
│   │   ├── search.js          # Search API endpoints
│   │   └── reports.js         # Reports API endpoints
│   ├── scripts/
│   │   └── initDatabase.js    # Database initialization script
│   ├── server.js              # Express server entry point
│   ├── package.json
│   └── .env                   # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── EventForm.jsx  # Event create/edit form
│   │   │   └── ContactForm.jsx # Contact create/edit form
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx  # Dashboard with statistics
│   │   │   ├── Events.jsx     # Events list and management
│   │   │   ├── Contacts.jsx   # Contacts list and management
│   │   │   └── Reports.jsx    # Reports and analytics
│   │   ├── services/
│   │   │   └── api.js         # API service layer
│   │   ├── App.jsx            # Main application component
│   │   ├── App.css            # Application styles
│   │   ├── main.jsx           # React entry point
│   │   └── index.css          # Global styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── uploads/                   # File upload storage
└── README.md

```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```powershell
cd backend
```

2. Install dependencies:
```powershell
npm install
```

3. Initialize the database:
```powershell
npm run init-db
```

4. Start the backend server:
```powershell
npm run dev
```

The backend API will run on `http://localhost:5000`

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
```powershell
cd frontend
```

2. Install dependencies:
```powershell
npm install
```

3. Start the development server:
```powershell
npm run dev
```

The frontend application will run on `http://localhost:3000`

## API Documentation

### Events API

- `GET /api/events` - Get all events (supports filtering)
  - Query params: `category`, `contact`, `platform`, `startDate`, `endDate`
- `GET /api/events/:id` - Get single event by ID
- `POST /api/events` - Create new event (supports file uploads)
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Contacts API

- `GET /api/contacts` - Get all contacts
  - Query params: `type`
- `GET /api/contacts/:id` - Get single contact by ID
- `POST /api/contacts` - Create new contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Categories API

- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category by ID
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Search API

- `GET /api/search?q={query}&type={events|contacts|attachments}` - Search across data

### Reports API

- `GET /api/reports/summary` - Get summary statistics
  - Query params: `startDate`, `endDate`
- `GET /api/reports/detailed` - Get detailed report data
  - Query params: `startDate`, `endDate`, `category`, `contact`, `platform`

## Usage Guide

### Managing Events

1. **Create Event**: Click "Add New Event" button on the Events page
2. Fill in the event details:
   - Title (required)
   - Description
   - Date & Time (required)
   - Contact
   - Category
   - Platform (Email, WhatsApp, Messenger, etc.)
   - Notes
   - File attachments
3. Click "Save" to create the event

### Managing Contacts

1. **Create Contact**: Click "Add New Contact" button on the Contacts page
2. Enter contact information:
   - Name (required)
   - Type (required): Employee, Client, Designer, Vendor, Other
   - Email
   - Phone
   - Company
   - Notes
3. Click "Save" to create the contact

### Filtering & Search

- Use the filter dropdowns to filter events by category, contact, or platform
- Use the search bar to search for specific events, contacts, or attachments
- Filter by date range in the Reports section

### Generating Reports

1. Navigate to the Reports page
2. Optionally set a date range filter
3. View summary statistics and charts
4. Export detailed report to CSV for external analysis

## Database Schema

### Events Table
- id, title, description, event_date, contact_id, category_id, platform, notes, created_at, updated_at

### Contacts Table
- id, name, type, email, phone, company, notes, created_at, updated_at

### Categories Table
- id, name, description, color, created_at

### Attachments Table
- id, event_id, file_name, file_path, file_type, file_size, uploaded_at

## Development

### Adding New Features

The application follows a clean architecture pattern:
- Backend routes handle API endpoints
- Frontend services abstract API calls
- React components handle UI and state management
- Database operations are wrapped in the `db.js` module

### Environment Variables

Backend `.env` file:
```
PORT=5000
DB_PATH=./database/business_events.db
UPLOAD_PATH=../uploads
```

## Production Deployment

1. Build the frontend:
```powershell
cd frontend
npm run build
```

2. Configure environment variables for production
3. Set up a process manager (PM2) for the backend
4. Configure reverse proxy (nginx) for serving both frontend and backend
5. Set up SSL certificates for HTTPS

## Troubleshooting

**Database not initializing:**
- Ensure you've run `npm run init-db` in the backend directory
- Check write permissions for the database directory

**File uploads not working:**
- Verify the `uploads` directory exists and has write permissions
- Check file size limits in backend/routes/events.js

**API connection errors:**
- Ensure backend is running on port 5000
- Check frontend proxy configuration in vite.config.js

## Future Enhancements

- User authentication and authorization
- Email notifications
- Calendar integration
- Mobile application
- Advanced analytics and charts
- File preview functionality
- Backup and restore features
- Export to PDF reports

## License

MIT

## Support

For issues and questions, please create an issue in the project repository.
