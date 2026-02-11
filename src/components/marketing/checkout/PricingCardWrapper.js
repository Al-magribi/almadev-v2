"use client";
import { useState } from "react";
import CheckoutModal from "./CheckoutModal";
import { useRouter } from "next/navigation";

export default function PricingCardWrapper({
  plan,
  courseId,
  planIndex,
  user,
  courseData,
  utmData,
  metaPixelId,
}) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelection = (e) => {
    if (plan.name === "Online Bootcamp") {
      router.push("/bootcamp");
      return;
    }

    e.preventDefault();
    setIsModalOpen(true);
  };

  return (
    <>
      <button
        onClick={handleSelection}
        className={`block w-full py-4 text-center rounded-xl font-bold transition-transform active:scale-95 ${
          plan.isRecommended
            ? "bg-white text-violet-700 hover:bg-slate-100"
            : "bg-slate-700 text-white hover:bg-slate-600"
        }`}
      >
        {plan.buttonText || `Pilih ${plan.name}`}
      </button>

      {isModalOpen && (
        <CheckoutModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          user={user}
          courseId={courseId}
          itemId={courseId}
          itemType='Course'
          // PENTING: Oper data plan ke modal agar bisa dibaca saat submit
          planData={plan}
          courseData={courseData}
          utmData={utmData}
          metaPixelId={metaPixelId}
        />
      )}
    </>
  );
}
