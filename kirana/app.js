/**
 * Apna Kirana Store - Interactive Catalog & Cart Controller
 * Supports pack/weight selection, WhatsApp order link generation, delivery slot selection, and checkout.
 */

const KIRANA_CATALOG = [
  {
    id: "krn-1",
    name: "Aashirvaad Shudh Chakki Atta",
    category: "Atta, Rice & Dals",
    badge: "Bestseller",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80",
    packs: [
      { unit: "1 kg", price: 58, mrp: 65 },
      { unit: "5 kg", price: 265, mrp: 295 },
      { unit: "10 kg", price: 495, mrp: 560 }
    ]
  },
  {
    id: "krn-2",
    name: "Daawat Rozana Super Basmati Rice",
    category: "Atta, Rice & Dals",
    badge: "Popular",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80",
    packs: [
      { unit: "1 kg", price: 95, mrp: 120 },
      { unit: "5 kg", price: 440, mrp: 550 }
    ]
  },
  {
    id: "krn-3",
    name: "Tata Sampann Unpolished Toor Dal",
    category: "Atta, Rice & Dals",
    badge: "Protein Rich",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80",
    packs: [
      { unit: "500 g", price: 92, mrp: 110 },
      { unit: "1 kg", price: 178, mrp: 215 }
    ]
  },
  {
    id: "krn-4",
    name: "Amul Pure Cow Desi Ghee",
    category: "Edible Oils & Ghee",
    badge: "100% Pure",
    image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=400&q=80",
    packs: [
      { unit: "500 ml", price: 310, mrp: 340 },
      { unit: "1 Litre", price: 595, mrp: 660 }
    ]
  },
  {
    id: "krn-5",
    name: "Fortune Kachi Ghani Mustard Oil",
    category: "Edible Oils & Ghee",
    badge: "Cold Pressed",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80",
    packs: [
      { unit: "1 Litre", price: 145, mrp: 175 },
      { unit: "5 Litre Can", price: 690, mrp: 820 }
    ]
  },
  {
    id: "krn-6",
    name: "Everest Super Garam Masala",
    category: "Spices & Masalas",
    badge: "Aromatic",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80",
    packs: [
      { unit: "100 g", price: 82, mrp: 95 },
      { unit: "200 g", price: 155, mrp: 180 }
    ]
  },
  {
    id: "krn-7",
    name: "Amul Taaza Homogenised Milk (Pouch)",
    category: "Dairy, Bread & Eggs",
    badge: "Daily Fresh",
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80",
    packs: [
      { unit: "500 ml", price: 27, mrp: 28 },
      { unit: "1 Litre", price: 54, mrp: 56 }
    ]
  },
  {
    id: "krn-8",
    name: "Fresh Malai Paneer Block",
    category: "Dairy, Bread & Eggs",
    badge: "Soft & Fresh",
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=400&q=80",
    packs: [
      { unit: "200 g", price: 85, mrp: 95 },
      { unit: "500 g", price: 195, mrp: 220 }
    ]
  },
  {
    id: "krn-9",
    name: "Tata Tea Gold Leaf Pouch",
    category: "Tea, Coffee & Drinks",
    badge: "Kadak Chai",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=80",
    packs: [
      { unit: "250 g", price: 145, mrp: 165 },
      { unit: "500 g", price: 280, mrp: 320 }
    ]
  },
  {
    id: "krn-10",
    name: "Maggi 2-Minute Masala Noodles",
    category: "Snacks & Instant Food",
    badge: "Kids Favorite",
    image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=400&q=80",
    packs: [
      { unit: "Pack of 4 (280g)", price: 56, mrp: 60 },
      { unit: "Family Pack of 12", price: 165, mrp: 180 }
    ]
  }
];

// Active State
let cart = JSON.parse(localStorage.getItem("apna_kirana_cart") || "{}");
let appliedDiscount = 0;
let lastSubmittedOrder = null;

document.addEventListener("DOMContentLoaded", () => {
  renderCatalog(KIRANA_CATALOG);
  updateCartUI();
});

// Render Catalog
function renderCatalog(items) {
  const grid = document.getElementById("products-grid");
  document.getElementById("product-count-label").innerText = `Showing ${items.length} items`;

  grid.innerHTML = items.map(p => {
    const selectedPackIndex = 0;
    const pack = p.packs[selectedPackIndex];
    const cartKey = `${p.id}_${selectedPackIndex}`;
    const inCartQty = cart[cartKey] ? cart[cartKey].qty : 0;

    return `
      <div class="product-card" id="card-${p.id}">
        <span class="product-badge">${p.badge}</span>
        <img src="${p.image}" alt="${p.name}" class="product-img" loading="lazy">
        <span class="product-category">${p.category}</span>
        <h4 class="product-title">${p.name}</h4>

        <!-- Unit Selector -->
        <select class="unit-selector" id="unit-sel-${p.id}" onchange="changeProductUnit('${p.id}')">
          ${p.packs.map((pk, idx) => `
            <option value="${idx}">Pack: ${pk.unit} — ₹${pk.price}</option>
          `).join("")}
        </select>

        <div class="product-bottom">
          <div class="product-price-box">
            <span class="current-price" id="price-${p.id}">₹${pack.price}</span>
            <span class="mrp-price" id="mrp-${p.id}">MRP ₹${pack.mrp}</span>
          </div>

          <div id="btn-container-${p.id}">
            ${inCartQty > 0 ? `
              <div class="qty-stepper">
                <button class="qty-btn" onclick="updateItemQty('${cartKey}', -1)">-</button>
                <span class="qty-val">${inCartQty}</span>
                <button class="qty-btn" onclick="updateItemQty('${cartKey}', 1)">+</button>
              </div>
            ` : `
              <button class="btn-add-cart" onclick="addToCart('${p.id}')">ADD +</button>
            `}
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// Unit Dropdown Handler
function changeProductUnit(productId) {
  const p = KIRANA_CATALOG.find(i => i.id === productId);
  if (!p) return;

  const sel = document.getElementById(`unit-sel-${productId}`);
  const packIndex = parseInt(sel.value);
  const pack = p.packs[packIndex];

  document.getElementById(`price-${productId}`).innerText = `₹${pack.price}`;
  document.getElementById(`mrp-${productId}`).innerText = `MRP ₹${pack.mrp}`;

  const cartKey = `${productId}_${packIndex}`;
  const inCartQty = cart[cartKey] ? cart[cartKey].qty : 0;
  const btnBox = document.getElementById(`btn-container-${productId}`);

  if (inCartQty > 0) {
    btnBox.innerHTML = `
      <div class="qty-stepper">
        <button class="qty-btn" onclick="updateItemQty('${cartKey}', -1)">-</button>
        <span class="qty-val">${inCartQty}</span>
        <button class="qty-btn" onclick="updateItemQty('${cartKey}', 1)">+</button>
      </div>
    `;
  } else {
    btnBox.innerHTML = `<button class="btn-add-cart" onclick="addToCart('${productId}')">ADD +</button>`;
  }
}

// Category Filter
function filterCategory(cat) {
  document.querySelectorAll(".cat-pill").forEach(p => p.classList.remove("active"));
  event.target.classList.add("active");

  if (cat === "all") {
    renderCatalog(KIRANA_CATALOG);
    document.getElementById("catalog-title").innerText = "Daily Essentials & Grocery Catalog";
  } else {
    const filtered = KIRANA_CATALOG.filter(i => i.category === cat);
    renderCatalog(filtered);
    document.getElementById("catalog-title").innerText = cat;
  }
}

// Search
function handleSearch() {
  const query = document.getElementById("grocery-search").value.toLowerCase().trim();
  const filtered = KIRANA_CATALOG.filter(i => 
    i.name.toLowerCase().includes(query) || i.category.toLowerCase().includes(query)
  );
  renderCatalog(filtered);
}

// Add to Cart
function addToCart(productId) {
  const p = KIRANA_CATALOG.find(i => i.id === productId);
  if (!p) return;

  const sel = document.getElementById(`unit-sel-${productId}`);
  const packIndex = parseInt(sel ? sel.value : 0);
  const pack = p.packs[packIndex];
  const cartKey = `${productId}_${packIndex}`;

  if (!cart[cartKey]) {
    cart[cartKey] = {
      productId,
      name: p.name,
      unit: pack.unit,
      price: pack.price,
      qty: 1
    };
  } else {
    cart[cartKey].qty += 1;
  }

  saveCart();
  updateCartUI();
  changeProductUnit(productId);
  showToast(`Added ${p.name} (${pack.unit})`);
}

// Update Qty
function updateItemQty(cartKey, delta) {
  if (cart[cartKey]) {
    cart[cartKey].qty += delta;
    if (cart[cartKey].qty <= 0) {
      delete cart[cartKey];
    }
  }
  saveCart();
  updateCartUI();

  // Refresh current product card if visible
  const [prodId] = cartKey.split("_");
  if (document.getElementById(`unit-sel-${prodId}`)) {
    changeProductUnit(prodId);
  }
}

function saveCart() {
  localStorage.setItem("apna_kirana_cart", JSON.stringify(cart));
}

// Update Cart Drawer UI
function updateCartUI() {
  const items = Object.values(cart);
  const totalCount = items.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);

  // Update Badges
  document.getElementById("cart-badge").innerText = totalCount;
  document.getElementById("drawer-item-count").innerText = totalCount;

  // Delivery Free Progress (Threshold ₹499)
  const threshold = 499;
  const progressPercent = Math.min(100, Math.round((subtotal / threshold) * 100));
  const fill = document.getElementById("progress-bar-fill");
  const progText = document.getElementById("progress-text");

  if (subtotal >= threshold) {
    fill.style.width = "100%";
    progText.innerHTML = "🎉 Congratulations! You unlocked <b>FREE Express Delivery</b>";
  } else {
    fill.style.width = `${progressPercent}%`;
    progText.innerText = `Add ₹${threshold - subtotal} more for FREE Delivery`;
  }

  // Render Drawer Items
  const container = document.getElementById("cart-items-container");
  if (items.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 10px; color: #64748b;">
        <p style="font-size: 2rem; margin-bottom: 8px;">🛒</p>
        <p>Your Kirana cart is empty.<br>Select items from our fresh grocery catalog.</p>
      </div>
    `;
  } else {
    container.innerHTML = items.map(item => {
      const cartKey = `${item.productId}_${KIRANA_CATALOG.find(p => p.id === item.productId)?.packs.findIndex(pk => pk.unit === item.unit) || 0}`;
      return `
        <div class="cart-item">
          <div>
            <div class="cart-item-title">${item.name}</div>
            <div class="cart-item-pack">${item.unit} • ₹${item.price} each</div>
            <div class="cart-item-price">₹${item.price * item.qty}</div>
          </div>
          <div class="qty-stepper">
            <button class="qty-btn" onclick="updateItemQty('${cartKey}', -1)">-</button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn" onclick="updateItemQty('${cartKey}', 1)">+</button>
          </div>
        </div>
      `;
    }).join("");
  }

  // Calculate Bill
  const deliveryFee = (subtotal >= threshold || subtotal === 0) ? 0 : 30;
  const finalTotal = Math.max(0, subtotal - appliedDiscount + deliveryFee);

  document.getElementById("bill-subtotal").innerText = `₹${subtotal}`;
  document.getElementById("bill-delivery").innerText = deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`;
  document.getElementById("bill-total").innerText = `₹${finalTotal}`;
  document.getElementById("modal-order-total").innerText = `₹${finalTotal}`;
  document.getElementById("btn-pay-amount").innerText = finalTotal;
}

// Drawer Toggle
function toggleCartDrawer() {
  const drawer = document.getElementById("cart-drawer");
  const backdrop = document.getElementById("cart-backdrop");
  drawer.classList.toggle("open");
  backdrop.classList.toggle("open");
}

// Apply Promo Code
function applyPromoCode() {
  const code = document.getElementById("promo-code").value.trim().toUpperCase();
  const subtotal = Object.values(cart).reduce((sum, item) => sum + (item.price * item.qty), 0);

  if (code === "KIRANA50") {
    if (subtotal >= 299) {
      appliedDiscount = 50;
      document.getElementById("discount-row").style.display = "flex";
      document.getElementById("bill-discount").innerText = "-₹50";
      showToast("Coupon KIRANA50 applied! ₹50 Saved.");
    } else {
      showToast("Coupon KIRANA50 requires minimum order of ₹299.");
    }
  } else {
    showToast("Invalid Coupon Code. Try: KIRANA50");
  }
  updateCartUI();
}

// Open Checkout Modal
function openCheckoutModal() {
  if (Object.keys(cart).length === 0) {
    showToast("Your cart is empty! Add items first.");
    return;
  }
  toggleCartDrawer();
  document.getElementById("checkout-modal").classList.add("open");
}

function closeCheckoutModal() {
  document.getElementById("checkout-modal").classList.remove("open");
}

// Submit Order
function submitKiranaOrder() {
  const name = document.getElementById("cust-name").value.trim();
  const phone = document.getElementById("cust-phone").value.trim();
  const address = document.getElementById("cust-address").value.trim();
  const slot = document.querySelector("input[name='slot']:checked").value;
  const payment = document.querySelector("input[name='payment']:checked").value;

  if (!name) {
    showToast("Please enter your full name.");
    return;
  }
  if (!phone || phone.length !== 10 || isNaN(phone)) {
    showToast("Please enter a valid 10-digit mobile number.");
    return;
  }
  if (!address) {
    showToast("Please enter your delivery address.");
    return;
  }

  const items = Object.values(cart);
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const deliveryFee = subtotal >= 499 ? 0 : 30;
  const total = subtotal - appliedDiscount + deliveryFee;
  const orderId = "KRN-" + Math.floor(1000 + Math.random() * 9000);

  lastSubmittedOrder = {
    orderId,
    name,
    phone,
    address,
    slot,
    payment,
    items,
    total,
    date: new Date().toLocaleString()
  };

  // Clear Cart
  cart = {};
  appliedDiscount = 0;
  saveCart();
  updateCartUI();
  closeCheckoutModal();

  // Show Receipt
  renderReceipt(lastSubmittedOrder);
  document.getElementById("receipt-modal").classList.add("open");
}

function renderReceipt(order) {
  document.getElementById("receipt-order-id").innerText = `Order #${order.orderId}`;
  const details = document.getElementById("receipt-details-content");

  details.innerHTML = `
    <p><b>👤 Customer:</b> ${order.name} (${order.phone})</p>
    <p><b>📍 Address:</b> ${order.address}</p>
    <p><b>⏰ Delivery Slot:</b> ${order.slot}</p>
    <p><b>💳 Payment:</b> ${order.payment}</p>
    <hr style="margin: 10px 0; border: 0; border-top: 1px dashed #cbd5e1;">
    <p><b>📦 Items (${order.items.length}):</b></p>
    <ul style="padding-left: 20px; margin: 6px 0;">
      ${order.items.map(it => `<li>${it.name} (${it.unit}) × ${it.qty} = ₹${it.price * it.qty}</li>`).join("")}
    </ul>
    <p style="font-size: 1.05rem; font-weight: 800; color: #059669; margin-top: 8px;">
      Total Paid/Payable: ₹${order.total}
    </p>
  `;
}

function closeReceiptModal() {
  document.getElementById("receipt-modal").classList.remove("open");
}

// WhatsApp Direct Order Formatting
function openWhatsAppOrder() {
  const items = Object.values(cart);
  if (items.length === 0) {
    window.open("https://wa.me/919876543210?text=Hello%20Apna%20Kirana%2C%20I%20want%20to%20place%20a%20grocery%20order.", "_blank");
    return;
  }

  let text = "Namaste Apna Kirana, I want to place this grocery order:%0A%0A";
  items.forEach((it, idx) => {
    text += `${idx + 1}. ${it.name} (${it.unit}) x ${it.qty} = ₹${it.price * it.qty}%0A`;
  });
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  text += `%0ATotal Bill: ₹${subtotal}%0APlease confirm delivery!`;

  window.open(`https://wa.me/919876543210?text=${text}`, "_blank");
}

function shareOrderOnWhatsApp() {
  if (!lastSubmittedOrder) return;
  const o = lastSubmittedOrder;
  let text = `*Order Confirmation #${o.orderId}*%0A%0A`;
  text += `Customer: ${o.name} (${o.phone})%0A`;
  text += `Address: ${o.address}%0A`;
  text += `Slot: ${o.slot}%0A`;
  text += `Payment: ${o.payment}%0A%0A*Items:*%0A`;
  o.items.forEach(it => {
    text += `- ${it.name} (${it.unit}) x ${it.qty} = ₹${it.price * it.qty}%0A`;
  });
  text += `%0A*Total Amount: ₹${o.total}*`;

  window.open(`https://wa.me/919876543210?text=${text}`, "_blank");
}

function showToast(msg) {
  const t = document.getElementById("toast");
  t.innerText = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2500);
}
