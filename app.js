/**
 * LuxeStay & Dine - Client Application Controller
 * Manages Hotel & Restaurant listings, availability, dynamic modal checkout, and local storage.
 */

// Initial Seed Data for Hotels
const HOTELS_DATA = [
  {
    id: "htl-1",
    name: "Grand Palace & Spa Resort",
    location: "Paris, France",
    category: "City Center",
    rating: 4.9,
    pricePerNight: 350,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    description: "An iconic luxury landmark overlooking the Seine, featuring marble baths and Michelin-starred dining.",
    features: ["Infinity Pool", "Gourmet Breakfast", "Full Spa", "Valet Parking"]
  },
  {
    id: "htl-2",
    name: "Azure Bay Ocean Villas",
    location: "Maldives",
    category: "Beachfront",
    rating: 4.95,
    pricePerNight: 680,
    image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80",
    description: "Overwater private villas with glass floor panels, direct coral reef access, and personal butler service.",
    features: ["Private Lagoon", "Sunset Deck", "Water Sports", "All-Inclusive Option"]
  },
  {
    id: "htl-3",
    name: "The Alpine Sanctuary & Chalets",
    location: "Zermatt, Switzerland",
    category: "Mountain",
    rating: 4.88,
    pricePerNight: 420,
    image: "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=800&q=80",
    description: "Ski-in/ski-out timber chalets nestled beneath the Matterhorn with private hot tubs and fireplace suites.",
    features: ["Ski Valet", "Thermal Hot Tub", "Heated Floors", "Mountain Guides"]
  },
  {
    id: "htl-4",
    name: "Kyoto Zen Retreat & Onsen",
    location: "Kyoto, Japan",
    category: "Wellness",
    rating: 4.92,
    pricePerNight: 490,
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
    description: "Century-old cedar architecture surrounded by bamboo gardens and mineral hot spring onsens.",
    features: ["Private Onsen", "Tea Ceremony", "Kaiseki Dinner", "Zen Meditation"]
  }
];

// Initial Seed Data for Restaurants
const RESTAURANTS_DATA = [
  {
    id: "rst-1",
    name: "L'Étoile Gastronomie",
    location: "Paris, France",
    cuisine: "French",
    rating: 4.96,
    avgPrice: "$$$$",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    description: "Contemporary French haute cuisine with an 8-course seasonal tasting menu by Chef Laurent.",
    features: ["Sommelier Pairing", "Tasting Menu", "Rooftop View", "Dress Code"]
  },
  {
    id: "rst-2",
    name: "Kuroshio Omakase",
    location: "Tokyo, Japan",
    cuisine: "Japanese",
    rating: 4.98,
    avgPrice: "$$$$",
    image: "https://images.unsplash.com/photo-1578474846511-04ba529f0b88?auto=format&fit=crop&w=800&q=80",
    description: "An intimate 12-seat cedar counter serving Tokyo fish market treasures prepared live.",
    features: ["Counter Seating", "Direct Daily Catch", "Sake Master", "Intimate Setting"]
  },
  {
    id: "rst-3",
    name: "Trattoria Bella Vista",
    location: "Amalfi Coast, Italy",
    cuisine: "Italian",
    rating: 4.85,
    avgPrice: "$$$",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
    description: "Cliffside dining overlooking the Tyrrhenian Sea with handmade pasta and heirloom lemon desserts.",
    features: ["Cliff Terrace", "Handmade Pasta", "Woodfire Oven", "Wine Cellar"]
  },
  {
    id: "rst-4",
    name: "Aegina Olive Grove",
    location: "Santorini, Greece",
    cuisine: "Mediterranean",
    rating: 4.9,
    avgPrice: "$$$",
    image: "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&w=800&q=80",
    description: "Sun-drenched Mediterranean seafood and organic olive oil pairings at sunset.",
    features: ["Sunset Views", "Catch of the Day", "Private Pergolas", "Organic Farm"]
  }
];

// Active State
let currentSelectedHotel = null;
let currentSelectedDining = null;
let bookings = JSON.parse(localStorage.getItem("luxestay_bookings") || "[]");

// Initialize application
document.addEventListener("DOMContentLoaded", () => {
  renderHotels(HOTELS_DATA);
  renderRestaurants(RESTAURANTS_DATA);
  updateBookingsBadge();
  setDefaultDates();
});

function setDefaultDates() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 2);

  const formatDate = d => d.toISOString().split("T")[0];
  const checkinInput = document.getElementById("checkin-date");
  const checkoutInput = document.getElementById("checkout-date");
  const diningDateInput = document.getElementById("modal-table-date");

  if (checkinInput) checkinInput.value = formatDate(today);
  if (checkoutInput) checkoutInput.value = formatDate(tomorrow);
  if (diningDateInput) diningDateInput.value = formatDate(today);
}

// Navigation Tab Switcher
function switchTab(tab) {
  document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
  document.getElementById("hotels-view").style.display = "none";
  document.getElementById("restaurants-view").style.display = "none";
  document.getElementById("bookings-view").style.display = "none";

  if (tab === "hotels") {
    document.getElementById("hotels-view").style.display = "block";
    document.querySelector("a[href='#hotels']").classList.add("active");
  } else if (tab === "restaurants") {
    document.getElementById("restaurants-view").style.display = "block";
    document.querySelector("a[href='#restaurants']").classList.add("active");
  } else if (tab === "bookings") {
    document.getElementById("bookings-view").style.display = "block";
    document.querySelector("a[href='#my-bookings']").classList.add("active");
    renderBookings();
  }
}

// Toggle Search Bar Mode
function toggleSearchMode(mode) {
  const hotelTab = document.getElementById("tab-hotel-search");
  const diningTab = document.getElementById("tab-dining-search");
  const checkoutGroup = document.getElementById("date-checkout-group");
  const diningTimeGroup = document.getElementById("dining-time-group");

  if (mode === "hotel") {
    hotelTab.classList.add("active");
    diningTab.classList.remove("active");
    checkoutGroup.style.display = "flex";
    diningTimeGroup.style.display = "none";
  } else {
    diningTab.classList.add("active");
    hotelTab.classList.remove("active");
    checkoutGroup.style.display = "none";
    diningTimeGroup.style.display = "flex";
  }
}

// Render Hotels
function renderHotels(hotels) {
  const grid = document.getElementById("hotels-grid");
  grid.innerHTML = hotels.map(h => `
    <article class="card">
      <img src="${h.image}" alt="${h.name}" class="card-img" loading="lazy">
      <div class="card-body">
        <div class="card-meta">
          <span class="card-tag">${h.category}</span>
          <span class="card-rating">★ ${h.rating}</span>
        </div>
        <h3 class="card-title">${h.name}</h3>
        <p class="card-location">📍 ${h.location}</p>
        <p class="card-description">${h.description}</p>
        <div class="card-features">
          ${h.features.map(f => `<span class="feature-tag">${f}</span>`).join("")}
        </div>
        <div class="card-footer">
          <div class="card-price">$${h.pricePerNight} <small>/ night</small></div>
          <button class="btn btn-primary" onclick="openHotelModal('${h.id}')">Book Room</button>
        </div>
      </div>
    </article>
  `).join("");
}

// Render Restaurants
function renderRestaurants(restaurants) {
  const grid = document.getElementById("restaurants-grid");
  grid.innerHTML = restaurants.map(r => `
    <article class="card">
      <img src="${r.image}" alt="${r.name}" class="card-img" loading="lazy">
      <div class="card-body">
        <div class="card-meta">
          <span class="card-tag">${r.cuisine}</span>
          <span class="card-rating">★ ${r.rating}</span>
        </div>
        <h3 class="card-title">${r.name}</h3>
        <p class="card-location">📍 ${r.location}</p>
        <p class="card-description">${r.description}</p>
        <div class="card-features">
          ${r.features.map(f => `<span class="feature-tag">${f}</span>`).join("")}
        </div>
        <div class="card-footer">
          <div class="card-price">${r.avgPrice} <small>/ tasting</small></div>
          <button class="btn btn-primary" onclick="openDiningModal('${r.id}')">Reserve Table</button>
        </div>
      </div>
    </article>
  `).join("");
}

// Filter Hotels by Category
function filterHotels(category) {
  document.querySelectorAll("#hotels-view .pill").forEach(p => p.classList.remove("active"));
  event.target.classList.add("active");

  if (category === "all") {
    renderHotels(HOTELS_DATA);
  } else {
    renderHotels(HOTELS_DATA.filter(h => h.category.toLowerCase().includes(category.toLowerCase())));
  }
}

// Filter Restaurants by Cuisine
function filterRestaurants(cuisine) {
  document.querySelectorAll("#restaurants-view .pill").forEach(p => p.classList.remove("active"));
  event.target.classList.add("active");

  if (cuisine === "all") {
    renderRestaurants(RESTAURANTS_DATA);
  } else {
    renderRestaurants(RESTAURANTS_DATA.filter(r => r.cuisine.toLowerCase().includes(cuisine.toLowerCase())));
  }
}

// Open Hotel Modal
function openHotelModal(hotelId) {
  const hotel = HOTELS_DATA.find(h => h.id === hotelId);
  if (!hotel) return;

  currentSelectedHotel = hotel;
  document.getElementById("modal-hotel-name").innerText = hotel.name;
  document.getElementById("modal-hotel-location").innerText = "📍 " + hotel.location;
  document.getElementById("modal-hotel-category").innerText = hotel.category;

  updateRoomPrice();
  document.getElementById("hotel-modal").classList.add("open");
}

function updateRoomPrice() {
  if (!currentSelectedHotel) return;
  const roomSelect = document.getElementById("modal-room-type");
  const selectedOption = roomSelect.options[roomSelect.selectedIndex];
  const rate = parseInt(selectedOption.getAttribute("data-price") || "350");
  const nights = parseInt(document.getElementById("modal-nights").value || "1");

  const subtotal = rate * nights;
  const tax = Math.round(subtotal * 0.12);
  const total = subtotal + tax;

  document.getElementById("summary-rate").innerText = `$${rate}`;
  document.getElementById("summary-nights").innerText = `${nights} Night${nights > 1 ? "s" : ""}`;
  document.getElementById("summary-tax").innerText = `$${tax}`;
  document.getElementById("summary-total").innerText = `$${total}`;
}

// Open Dining Modal
function openDiningModal(diningId) {
  const restaurant = RESTAURANTS_DATA.find(r => r.id === diningId);
  if (!restaurant) return;

  currentSelectedDining = restaurant;
  document.getElementById("modal-dining-name").innerText = restaurant.name;
  document.getElementById("modal-dining-location").innerText = "📍 " + restaurant.location;
  document.getElementById("modal-dining-category").innerText = `${restaurant.cuisine} Cuisine`;

  document.getElementById("dining-modal").classList.add("open");
}

// Close Modal
function closeModal(modalId) {
  document.getElementById(modalId).classList.remove("open");
}

// Confirm Hotel Booking
function confirmHotelBooking() {
  const guestName = document.getElementById("modal-guest-name").value.trim();
  const guestEmail = document.getElementById("modal-guest-email").value.trim();

  if (!guestName || !guestEmail) {
    showToast("Please provide guest full name and email.");
    return;
  }

  const roomSelect = document.getElementById("modal-room-type");
  const roomName = roomSelect.options[roomSelect.selectedIndex].text.split("(")[0].trim();
  const nights = parseInt(document.getElementById("modal-nights").value || "1");
  const total = document.getElementById("summary-total").innerText;

  const newBooking = {
    id: "HTL-" + Math.floor(1000 + Math.random() * 9000),
    type: "Hotel Stay",
    property: currentSelectedHotel.name,
    location: currentSelectedHotel.location,
    guestName,
    guestEmail,
    details: `${roomName} • ${nights} Nights`,
    amount: total,
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    status: "Confirmed"
  };

  bookings.unshift(newBooking);
  localStorage.setItem("luxestay_bookings", JSON.stringify(bookings));
  updateBookingsBadge();
  closeModal("hotel-modal");
  showToast(`Booking Confirmed! Ref: ${newBooking.id}`, "success");

  // Reset form
  document.getElementById("modal-guest-name").value = "";
  document.getElementById("modal-guest-email").value = "";
}

// Confirm Dining Booking
function confirmDiningBooking() {
  const guestName = document.getElementById("modal-table-name").value.trim();
  const contact = document.getElementById("modal-table-contact").value.trim();
  const date = document.getElementById("modal-table-date").value;
  const time = document.getElementById("modal-table-time").value;
  const guests = document.getElementById("modal-table-guests").value;
  const seating = document.getElementById("modal-table-seating").value;

  if (!guestName || !contact) {
    showToast("Please provide guest name and contact information.");
    return;
  }

  const newBooking = {
    id: "RST-" + Math.floor(1000 + Math.random() * 9000),
    type: "Fine Dining",
    property: currentSelectedDining.name,
    location: currentSelectedDining.location,
    guestName,
    details: `${guests} Guests • ${time} • ${seating}`,
    amount: "Complimentary Reservation",
    date: date || new Date().toLocaleDateString(),
    status: "Confirmed"
  };

  bookings.unshift(newBooking);
  localStorage.setItem("luxestay_bookings", JSON.stringify(bookings));
  updateBookingsBadge();
  closeModal("dining-modal");
  showToast(`Table Reserved! Ref: ${newBooking.id}`, "success");

  // Reset form
  document.getElementById("modal-table-name").value = "";
  document.getElementById("modal-table-contact").value = "";
}

// Render User Reservations
function renderBookings() {
  const container = document.getElementById("bookings-list");
  if (bookings.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
        <p style="font-size: 1.2rem; margin-bottom: 16px;">You have no active reservations yet.</p>
        <button class="btn btn-primary" onclick="switchTab('hotels')">Explore Hotels & Resorts</button>
      </div>
    `;
    return;
  }

  container.innerHTML = bookings.map(b => `
    <div class="booking-item">
      <div>
        <span class="booking-ref">${b.id} • ${b.type}</span>
        <h3 class="booking-name">${b.property}</h3>
        <p class="booking-details">📍 ${b.location} | 👤 Guest: ${b.guestName} | 📅 ${b.date}</p>
        <p class="booking-details" style="color: var(--primary); font-weight: 500;">${b.details} | ${b.amount}</p>
      </div>
      <div>
        <span class="booking-status status-confirmed">Confirmed</span>
        <button class="btn btn-outline-danger" style="margin-left: 12px; padding: 6px 14px; font-size: 0.8rem;" onclick="cancelBooking('${b.id}')">Cancel</button>
      </div>
    </div>
  `).join("");
}

function cancelBooking(bookingId) {
  bookings = bookings.filter(b => b.id !== bookingId);
  localStorage.setItem("luxestay_bookings", JSON.stringify(bookings));
  updateBookingsBadge();
  renderBookings();
  showToast(`Reservation ${bookingId} cancelled.`);
}

function clearAllBookings() {
  if (confirm("Clear all reservation history?")) {
    bookings = [];
    localStorage.removeItem("luxestay_bookings");
    updateBookingsBadge();
    renderBookings();
    showToast("All reservations cleared.");
  }
}

function updateBookingsBadge() {
  const badge = document.getElementById("bookings-count");
  if (badge) badge.innerText = bookings.length;
}

function showToast(message, type = "normal") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast ${type === "success" ? "success" : ""}`;
  toast.innerHTML = `<span>${type === "success" ? "✓" : "ℹ"}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function openQuickBook() {
  switchTab("hotels");
}
