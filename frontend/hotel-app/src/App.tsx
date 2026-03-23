import { useEffect, useState } from 'react';

export default function App() {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    async function fetchRooms() {
      const response = await fetch('http://localhost:3001/api/rooms');
      const data = await response.json();
      setRooms(data);
    }
    fetchRooms();
  }, []);

  return (
    <div>
      <h1>Hotel Management</h1>
      <div className="room-grid">
        {rooms.map(room => (
          <div key={room.id} className="card">
            <h3>Room {room.room_number}</h3>
            <p>{room.type} - ${room.price_per_night}/night</p>
          </div>
        ))}
      </div>
    </div>
  );
}