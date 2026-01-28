const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const dbPath = path.join(__dirname, '../database/business_events.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
});

// Create tables
db.serialize(() => {
  // Categories table
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      color TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('Error creating categories table:', err.message);
    else console.log('Categories table created');
  });

  // Contacts table
  db.run(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      company TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('Error creating contacts table:', err.message);
    else console.log('Contacts table created');
  });

  // Events table
  db.run(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      event_date DATETIME NOT NULL,
      contact_id INTEGER,
      category_id INTEGER,
      platform TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    )
  `, (err) => {
    if (err) console.error('Error creating events table:', err.message);
    else console.log('Events table created');
  });

  // Attachments table
  db.run(`
    CREATE TABLE IF NOT EXISTS attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_type TEXT,
      file_size INTEGER,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) console.error('Error creating attachments table:', err.message);
    else console.log('Attachments table created');
  });

  // Create indexes for better search performance
  db.run('CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date)');
  db.run('CREATE INDEX IF NOT EXISTS idx_events_contact ON events(contact_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_events_category ON events(category_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_contacts_type ON contacts(type)');
  
  // Insert default categories
  const defaultCategories = [
    ['Employee', 'Interactions with employees', '#3B82F6'],
    ['Client', 'Client communications and meetings', '#10B981'],
    ['Designer', 'Designer collaborations', '#8B5CF6'],
    ['Vendor', 'Vendor and supplier interactions', '#F59E0B'],
    ['Meeting', 'General meetings', '#EF4444'],
    ['Email', 'Email conversations', '#6366F1'],
    ['WhatsApp', 'WhatsApp messages', '#22C55E'],
    ['Messenger', 'Facebook Messenger chats', '#0EA5E9']
  ];

  const stmt = db.prepare('INSERT OR IGNORE INTO categories (name, description, color) VALUES (?, ?, ?)');
  defaultCategories.forEach(category => {
    stmt.run(category);
  });
  stmt.finalize();

  console.log('Default categories inserted');
});

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err.message);
  } else {
    console.log('Database initialization complete!');
  }
});
