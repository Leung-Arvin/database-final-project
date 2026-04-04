// src/lib/helpers.ts
import { rooms, roomAmenities, roomProblems, hotels } from './data'

// Get amenities for a room
export function getRoomAmenities(hotel_id: number, room_number: string): string[] {
  return roomAmenities
    .filter(ra => ra.hotel_id === hotel_id && ra.room_number === room_number)
    .map(ra => ra.amenity)
}

// Check if room has active damage
export function hasRoomDamage(hotel_id: number, room_number: string): boolean {
  return roomProblems.some(rp => 
    rp.hotel_id === hotel_id && 
    rp.room_number === room_number && 
    rp.resolved_date === null
  )
}

// Get room problem description
export function getRoomProblemDescription(hotel_id: number, room_number: string): string | undefined {
  const problem = roomProblems.find(rp => 
    rp.hotel_id === hotel_id && 
    rp.room_number === room_number && 
    rp.resolved_date === null
  )
  return problem?.description
}

// Get hotel by ID
export function getHotelById(hotel_id: number) {
  return hotels.find(h => h.hotel_id === hotel_id)
}

// Get room by composite key
export function getRoomByCompositeKey(hotel_id: number, room_number: string) {
  return rooms.find(r => r.hotel_id === hotel_id && r.room_number === room_number)
}