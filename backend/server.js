const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');

const app = express();
const db = new Database('hotel.db', { verbose: console.log });

db.pragma('foreign_keys = ON');

app.use(cors());
app.use(express.json());

db.exec(`
  CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_number TEXT UNIQUE,
    type TEXT,
    price_per_night REAL
  );
`);

app.get('/api/rooms', (req, res) => {
  const rooms = db.prepare('SELECT * FROM rooms').all();
  res.json(rooms);
});

app.post('/api/bookings', (req, res) => {
  const { roomId, guestName, checkIn } = req.body;
  
  const insert = db.prepare('INSERT INTO bookings (room_id, guest, date) VALUES (?, ?, ?)');
  const result = insert.run(roomId, guestName, checkIn);
  
  res.json({ id: result.lastInsertRowid, success: true });
});

app.listen(3001, () => console.log('Backend running on port 3001'));