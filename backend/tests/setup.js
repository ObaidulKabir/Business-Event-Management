const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Use a test database
const TEST_DB_PATH = path.join(__dirname, '../database/test_business_events.db');

// Create test database
function setupTestDatabase() {
  // Remove existing test database
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }

  const db = new sqlite3.Database(TEST_DB_PATH);

  return new Promise((resolve, reject) => {
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
      `);

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
      `);

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
      `);

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
      `);

      // Insert test categories
      const stmt = db.prepare('INSERT INTO categories (name, description, color) VALUES (?, ?, ?)');
      stmt.run(['Employee', 'Test employee category', '#3B82F6']);
      stmt.run(['Client', 'Test client category', '#10B981']);
      stmt.finalize();

      db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
}

// Clean up test database
function teardownTestDatabase() {
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }
}

module.exports = {
  setupTestDatabase,
  teardownTestDatabase,
  TEST_DB_PATH
};
