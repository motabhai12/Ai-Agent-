"""LuxeStay & Dine - Core Booking Engine & Verification Service.

Follows backend-patterns: strict validation, repository models, reservation collision prevention,
and audit trail generation.
"""

from dataclasses import dataclass, field
from datetime import date, datetime
from typing import List, Dict, Optional
import uuid


@dataclass
class Room:
    id: str
    name: str
    rate_per_night: float
    max_guests: int
    is_available: bool = True


@dataclass
class Hotel:
    id: str
    name: str
    location: str
    rooms: List[Room] = field(default_factory=list)


@dataclass
class RestaurantTable:
    table_number: int
    capacity: int
    is_reserved: bool = False


@dataclass
class Reservation:
    reference_id: str
    service_type: str  # 'hotel' or 'restaurant'
    property_name: str
    guest_name: str
    guest_email: str
    booking_date: date
    details: Dict
    total_amount: float
    status: str = "CONFIRMED"


class BookingEngine:
    """Core domain logic for room allocations, table reservations, and validation."""

    def __init__(self):
        self.hotels: Dict[str, Hotel] = {}
        self.reservations: Dict[str, Reservation] = {}
        self._seed_sample_inventory()

    def _seed_sample_inventory(self):
        # Sample Hotel
        hotel = Hotel(id="HTL-001", name="Grand Palace & Spa Resort", location="Paris, France")
        hotel.rooms.append(Room(id="RM-101", name="Deluxe King", rate_per_night=350.0, max_guests=2))
        hotel.rooms.append(Room(id="RM-102", name="Executive Ocean Suite", rate_per_night=550.0, max_guests=4))
        self.hotels[hotel.id] = hotel

    def book_hotel_room(
        self,
        hotel_id: str,
        room_id: str,
        guest_name: str,
        guest_email: str,
        checkin_date: date,
        checkout_date: date,
    ) -> Reservation:
        if checkout_date <= checkin_date:
            raise ValueError("Checkout date must be strictly after checkin date.")

        if not guest_name or not guest_email or "@" not in guest_email:
            raise ValueError("Invalid guest credentials provided.")

        hotel = self.hotels.get(hotel_id)
        if not hotel:
            raise KeyError(f"Hotel with ID '{hotel_id}' does not exist.")

        room = next((r for r in hotel.rooms if r.id == room_id), None)
        if not room:
            raise KeyError(f"Room with ID '{room_id}' not found in hotel '{hotel.name}'.")

        # Check for overlapping reservation
        for res in self.reservations.values():
            if res.service_type == "hotel" and res.details.get("room_id") == room_id:
                res_in = res.details["checkin_date"]
                res_out = res.details["checkout_date"]
                if not (checkout_date <= res_in or checkin_date >= res_out):
                    raise RuntimeError(f"Room '{room.name}' is already reserved for the selected date window.")

        nights = (checkout_date - checkin_date).days
        subtotal = room.rate_per_night * nights
        tax = round(subtotal * 0.12, 2)
        total = subtotal + tax

        ref_id = f"HTL-{uuid.uuid4().hex[:6].upper()}"
        reservation = Reservation(
            reference_id=ref_id,
            service_type="hotel",
            property_name=hotel.name,
            guest_name=guest_name,
            guest_email=guest_email,
            booking_date=date.today(),
            details={
                "room_id": room_id,
                "room_name": room.name,
                "checkin_date": checkin_date,
                "checkout_date": checkout_date,
                "nights": nights,
            },
            total_amount=total,
            status="CONFIRMED",
        )
        self.reservations[ref_id] = reservation
        return reservation

    def book_restaurant_table(
        self,
        restaurant_name: str,
        guest_name: str,
        party_size: int,
        reservation_date: date,
        time_slot: str,
        special_requests: str = "",
    ) -> Reservation:
        if party_size < 1 or party_size > 12:
            raise ValueError("Party size must be between 1 and 12 guests.")

        if not time_slot:
            raise ValueError("Reservation time slot must be selected.")

        ref_id = f"RST-{uuid.uuid4().hex[:6].upper()}"
        reservation = Reservation(
            reference_id=ref_id,
            service_type="restaurant",
            property_name=restaurant_name,
            guest_name=guest_name,
            guest_email="",
            booking_date=reservation_date,
            details={
                "party_size": party_size,
                "time_slot": time_slot,
                "special_requests": special_requests,
            },
            total_amount=0.0,
            status="CONFIRMED",
        )
        self.reservations[ref_id] = reservation
        return reservation

    def cancel_reservation(self, reference_id: str) -> bool:
        if reference_id in self.reservations:
            self.reservations[reference_id].status = "CANCELLED"
            return True
        return False
