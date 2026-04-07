const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, './data/hotel-database.db');
const db = new Database(dbPath);

// Good default for relational schemas
db.pragma('foreign_keys = ON');

module.exports = db;