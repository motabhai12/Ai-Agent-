"""Automated QA Test Suite for LuxeStay & Dine Booking Platform.

Adheres to auto-qa standards: strict assertion coverage, edge cases, and boundary invariant validation.
"""

import pytest
from datetime import date, timedelta
from booking_engine import BookingEngine


@pytest.fixture
def engine():
    return BookingEngine()


def test_seed_inventory_available(engine):
    """Verify default hotel and room inventories are properly initialized."""
    assert len(engine.hotels) > 0
    hotel = engine.hotels.get("HTL-001")
    assert hotel is not None
    assert hotel.name == "Grand Palace & Spa Resort"
    assert len(hotel.rooms) == 2


def test_hotel_booking_success(engine):
    """Verify standard room booking calculates correct nights, tax, and total."""
    checkin = date.today() + timedelta(days=1)
    checkout = checkin + timedelta(days=3)  # 3 nights

    res = engine.book_hotel_room(
        hotel_id="HTL-001",
        room_id="RM-101",
        guest_name="Elena Rostova",
        guest_email="elena@example.com",
        checkin_date=checkin,
        checkout_date=checkout,
    )

    assert res.reference_id.startswith("HTL-")
    assert res.status == "CONFIRMED"
    assert res.details["nights"] == 3
    # 3 nights * 350 = 1050 + 12% tax (126) = 1176.0
    assert res.total_amount == 1176.0


def test_hotel_booking_invalid_dates(engine):
    """Verify booking fails if checkout is before or equal to checkin."""
    today = date.today()
    with pytest.raises(ValueError, match="Checkout date must be strictly after checkin date"):
        engine.book_hotel_room(
            hotel_id="HTL-001",
            room_id="RM-101",
            guest_name="Test User",
            guest_email="test@example.com",
            checkin_date=today + timedelta(days=5),
            checkout_date=today + timedelta(days=2),
        )


def test_hotel_booking_overlap_prevention(engine):
    """Verify engine prevents double-booking the same room during overlapping dates."""
    checkin = date.today() + timedelta(days=10)
    checkout = checkin + timedelta(days=5)

    # First booking succeeds
    engine.book_hotel_room(
        hotel_id="HTL-001",
        room_id="RM-101",
        guest_name="First Guest",
        guest_email="first@example.com",
        checkin_date=checkin,
        checkout_date=checkout,
    )

    # Overlapping booking fails
    with pytest.raises(RuntimeError, match="already reserved for the selected date window"):
        engine.book_hotel_room(
            hotel_id="HTL-001",
            room_id="RM-101",
            guest_name="Second Guest",
            guest_email="second@example.com",
            checkin_date=checkin + timedelta(days=2),
            checkout_date=checkout + timedelta(days=2),
        )


def test_restaurant_table_booking_success(engine):
    """Verify table reservation succeeds with party size and time slot."""
    res = engine.book_restaurant_table(
        restaurant_name="L'Étoile Gastronomie",
        guest_name="Marcus Vance",
        party_size=4,
        reservation_date=date.today() + timedelta(days=1),
        time_slot="19:30",
        special_requests="Anniversary Celebration",
    )

    assert res.reference_id.startswith("RST-")
    assert res.details["party_size"] == 4
    assert res.details["time_slot"] == "19:30"
    assert res.status == "CONFIRMED"


def test_restaurant_invalid_party_size(engine):
    """Verify invalid party sizes (<1 or >12) are rejected."""
    with pytest.raises(ValueError, match="Party size must be between 1 and 12"):
        engine.book_restaurant_table(
            restaurant_name="Kuroshio Omakase",
            guest_name="Test User",
            party_size=15,
            reservation_date=date.today(),
            time_slot="20:00",
        )


def test_reservation_cancellation(engine):
    """Verify reservations can be cancelled and change status."""
    res = engine.book_restaurant_table(
        restaurant_name="Aegina Olive Grove",
        guest_name="Claire Sterling",
        party_size=2,
        reservation_date=date.today(),
        time_slot="18:30",
    )

    cancelled = engine.cancel_reservation(res.reference_id)
    assert cancelled is True
    assert engine.reservations[res.reference_id].status == "CANCELLED"
