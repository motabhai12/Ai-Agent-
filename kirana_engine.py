"""Apna Kirana Store - Inventory, Cart Calculation, and Order Engine.

Implements backend-patterns: coupon code validation, delivery charge waiver calculation,
and Indian phone number/address verification.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Dict, Optional
import uuid


@dataclass
class KiranaPack:
    unit: str
    price: float
    mrp: float


@dataclass
class KiranaProduct:
    id: str
    name: str
    category: str
    packs: List[KiranaPack] = field(default_factory=list)


@dataclass
class CartItem:
    product_id: str
    name: str
    unit: str
    price_per_unit: float
    quantity: int

    @property
    def total_price(self) -> float:
        return self.price_per_unit * self.quantity


@dataclass
class KiranaOrder:
    order_id: str
    customer_name: str
    customer_phone: str
    address: str
    delivery_slot: str
    payment_method: str
    items: List[CartItem]
    subtotal: float
    discount: float
    delivery_fee: float
    total_amount: float
    status: str = "CONFIRMED"
    created_at: datetime = field(default_factory=datetime.now)


class KiranaEngine:
    """Core domain logic for Kirana cart pricing, delivery fee rules, and order dispatching."""

    FREE_DELIVERY_THRESHOLD = 499.0
    STANDARD_DELIVERY_FEE = 30.0

    VALID_COUPONS = {
        "KIRANA50": {"min_order": 299.0, "discount": 50.0},
        "APNA100": {"min_order": 799.0, "discount": 100.0},
    }

    def __init__(self):
        self.orders: Dict[str, KiranaOrder] = {}

    def calculate_cart_bill(self, items: List[CartItem], coupon_code: Optional[str] = None) -> Dict[str, float]:
        """Calculates subtotal, discount, delivery fee, and net payable amount."""
        subtotal = sum(item.total_price for item in items)

        discount = 0.0
        if coupon_code:
            code = coupon_code.strip().toUpperCase() if hasattr(coupon_code.strip(), "toUpperCase") else coupon_code.strip().upper()
            if code in self.VALID_COUPONS:
                rule = self.VALID_COUPONS[code]
                if subtotal >= rule["min_order"]:
                    discount = rule["discount"]

        # Delivery fee waiver calculation
        if subtotal == 0.0 or subtotal >= self.FREE_DELIVERY_THRESHOLD:
            delivery_fee = 0.0
        else:
            delivery_fee = self.STANDARD_DELIVERY_FEE

        total = max(0.0, subtotal - discount + delivery_fee)

        return {
            "subtotal": round(subtotal, 2),
            "discount": round(discount, 2),
            "delivery_fee": round(delivery_fee, 2),
            "total": round(total, 2),
        }

    def create_order(
        self,
        customer_name: str,
        customer_phone: str,
        address: str,
        delivery_slot: str,
        payment_method: str,
        items: List[CartItem],
        coupon_code: Optional[str] = None,
    ) -> KiranaOrder:
        """Validates customer credentials and creates a confirmed Kirana order."""
        if not customer_name or not customer_name.strip():
            raise ValueError("Customer name is required.")

        clean_phone = customer_phone.strip()
        if not clean_phone.isdigit() or len(clean_phone) != 10:
            raise ValueError("Invalid phone number. Must be a 10-digit mobile number.")

        if not address or len(address.strip()) < 5:
            raise ValueError("Delivery address must be at least 5 characters.")

        if not items:
            raise ValueError("Cannot place an order with an empty cart.")

        bill = self.calculate_cart_bill(items, coupon_code)
        order_id = f"KRN-{uuid.uuid4().hex[:5].upper()}"

        order = KiranaOrder(
            order_id=order_id,
            customer_name=customer_name.strip(),
            customer_phone=clean_phone,
            address=address.strip(),
            delivery_slot=delivery_slot,
            payment_method=payment_method,
            items=items,
            subtotal=bill["subtotal"],
            discount=bill["discount"],
            delivery_fee=bill["delivery_fee"],
            total_amount=bill["total"],
            status="CONFIRMED",
        )
        self.orders[order_id] = order
        return order
