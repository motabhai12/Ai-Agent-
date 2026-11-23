"""Automated QA Test Suite for Apna Kirana Store Engine.

Covers: cart pricing, delivery fee threshold (₹499), discount coupon rules, and phone validation.
"""

import pytest
from kirana_engine import KiranaEngine, CartItem


@pytest.fixture
def engine():
    return KiranaEngine()


def test_cart_calculation_below_free_delivery_threshold(engine):
    """Orders below ₹499 must include a ₹30 delivery fee."""
    items = [
        CartItem(product_id="krn-1", name="Aashirvaad Atta", unit="1 kg", price_per_unit=58.0, quantity=2), # 116
        CartItem(product_id="krn-6", name="Everest Masala", unit="100 g", price_per_unit=82.0, quantity=1),  # 82
    ]
    # Subtotal = 198.0 (< 499) -> Delivery fee = 30.0 -> Total = 228.0
    bill = engine.calculate_cart_bill(items)
    assert bill["subtotal"] == 198.0
    assert bill["delivery_fee"] == 30.0
    assert bill["total"] == 228.0


def test_free_delivery_threshold_waiver(engine):
    """Orders ₹499 or above receive free delivery (₹0 delivery fee)."""
    items = [
        CartItem(product_id="krn-4", name="Amul Cow Ghee", unit="1 Litre", price_per_unit=595.0, quantity=1)
    ]
    # Subtotal = 595.0 (>= 499) -> Delivery fee = 0.0 -> Total = 595.0
    bill = engine.calculate_cart_bill(items)
    assert bill["subtotal"] == 595.0
    assert bill["delivery_fee"] == 0.0
    assert bill["total"] == 595.0


def test_coupon_discount_applied_when_eligible(engine):
    """Coupon KIRANA50 gives ₹50 discount when subtotal >= ₹299."""
    items = [
        CartItem(product_id="krn-2", name="Daawat Basmati", unit="5 kg", price_per_unit=440.0, quantity=1)
    ]
    # Subtotal = 440.0, Discount = 50.0, Delivery Fee = 30.0 -> Total = 420.0
    bill = engine.calculate_cart_bill(items, coupon_code="KIRANA50")
    assert bill["subtotal"] == 440.0
    assert bill["discount"] == 50.0
    assert bill["delivery_fee"] == 30.0
    assert bill["total"] == 420.0


def test_coupon_discount_not_applied_below_min_order(engine):
    """Coupon KIRANA50 is rejected if subtotal < ₹299."""
    items = [
        CartItem(product_id="krn-1", name="Aashirvaad Atta", unit="1 kg", price_per_unit=58.0, quantity=2) # 116
    ]
    bill = engine.calculate_cart_bill(items, coupon_code="KIRANA50")
    assert bill["discount"] == 0.0


def test_create_order_success(engine):
    """Valid order is generated with KRN- prefix and confirmed status."""
    items = [
        CartItem(product_id="krn-3", name="Tata Toor Dal", unit="1 kg", price_per_unit=178.0, quantity=3) # 534
    ]
    order = engine.create_order(
        customer_name="Aarav Mehta",
        customer_phone="9876543210",
        address="B-204, Royal Palms, MG Road",
        delivery_slot="Instant 30-Min",
        payment_method="UPI / QR Code",
        items=items,
    )
    assert order.order_id.startswith("KRN-")
    assert order.status == "CONFIRMED"
    assert order.total_amount == 534.0


def test_create_order_invalid_phone_rejected(engine):
    """Phone numbers not matching 10 digits must raise ValueError."""
    items = [
        CartItem(product_id="krn-1", name="Atta", unit="1 kg", price_per_unit=58.0, quantity=1)
    ]
    with pytest.raises(ValueError, match="Invalid phone number"):
        engine.create_order(
            customer_name="Test User",
            customer_phone="12345",  # Invalid
            address="Valid address string",
            delivery_slot="Morning",
            payment_method="COD",
            items=items,
        )
