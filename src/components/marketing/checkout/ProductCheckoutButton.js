"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import CheckoutModal from "./CheckoutModal";

export default function ProductCheckoutButton({
  product,
  user,
  utmData,
  label = "Beli Sekarang",
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={className}
        type='button'
      >
        <ShoppingCart size={18} />
        {label}
      </button>

      {isOpen && (
        <CheckoutModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          user={user}
          itemId={product?._id}
          itemType='Product'
          planName='Produk Digital'
          utmData={utmData}
        />
      )}
    </>
  );
}
