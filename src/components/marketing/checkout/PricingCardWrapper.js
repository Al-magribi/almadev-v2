"use client";
import { useRouter } from "next/navigation";

export default function PricingCardWrapper({
  plan,
  onSelectPlan,
}) {
  const router = useRouter();

  const handleSelection = (e) => {
    if (plan.name === "Online Bootcamp") {
      router.push("/bootcamp");
      return;
    }

    e.preventDefault();
    onSelectPlan?.(plan);
  };

  return (
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
  );
}
