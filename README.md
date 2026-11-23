# LuxeStay & Dine — Luxury Hotel & Restaurant Booking Platform

Autonomous multi-agent development project for ticket **[KAN-6]**.

## Features

- **Hotel & Suite Reservations**: Handpicked 5-star properties with dynamic room tier selection (Deluxe, Executive, Presidential).
- **Fine Dining Reservations**: Table reservation engine with time-slot selection, seating preference (Terrace, Window, Dining Room), and dietary notes.
- **Dynamic Pricing Engine**: Automated night calculation, tax & fee breakdowns, and real-time total updates.
- **Liquid Glass UI**: Ultra-modern responsive interface with glassmorphism navigation, blur overlays, and responsive mobile/tablet layout.
- **My Reservations Manager**: Integrated reservation history with cancellation support and localStorage persistence.
- **Backend Booking Core**: Python service layer preventing room collisions and validating reservation rules.

## Quick Start

Open `index.html` directly in any web browser to test the interactive client UI:
```bash
# Or serve with Python
python -m http.server 8000
```
Visit: `http://localhost:8000`

## Automated Testing

Run the test suite with pytest:
```bash
pytest -v
```
