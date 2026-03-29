"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import CheckoutModal from "./CheckoutModal";

export default function ProductCheckoutButton({
  product,
  planData,
  user,
  utmData,
  label = "Beli Sekarang",
  className = "",
  metaPixelId,
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
          planData={planData}
          courseData={{
            name: product?.name,
            price: Number(planData?.price ?? product?.price ?? 0),
            image: product?.image,
          }}
          planName={planData?.name || 'Produk Digital'}
          utmData={utmData}
          metaPixelId={metaPixelId}
        />
      )}
    </>
  );
}
