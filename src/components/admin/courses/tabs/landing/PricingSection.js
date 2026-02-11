"use client";

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus, Trash2, Star, GripVertical } from "lucide-react";

export default function PricingSection({
  items = [],
  addPricingTier,
  removePricingTier,
  updatePricingTier,
  toggleRecommended,
  reorderPricingTiers,
}) {
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    reorderPricingTiers?.(result.source.index, result.destination.index);
  };

  const getPlanId = (plan, index) =>
    String(plan?._id || plan?.__tempId || `pricing-item-${index}`);

  return (
    <section className='bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <span className='w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-sm'>
            3
          </span>
          <h3 className='font-semibold text-zinc-900 dark:text-zinc-100'>
            Penawaran Harga
          </h3>
        </div>
        <button
          onClick={addPricingTier}
          className='flex items-center gap-2 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold rounded-lg hover:opacity-90'
        >
          <Plus size={14} /> Tambah Paket
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId='pricing-tiers'>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className='grid grid-cols-1 md:grid-cols-2 gap-6'
            >
              {items?.map((plan, i) => (
                <Draggable
                  key={getPlanId(plan, i)}
                  draggableId={getPlanId(plan, i)}
                  index={i}
                >
                  {(draggableProvided, snapshot) => (
                    <div
                      ref={draggableProvided.innerRef}
                      {...draggableProvided.draggableProps}
                      className={`relative flex flex-col gap-4 p-5 rounded-xl border-2 transition-all ${
                        plan.isRecommended
                          ? "border-violet-500 bg-violet-50/10 dark:bg-violet-900/10"
                          : "border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50"
                      } ${snapshot.isDragging ? "shadow-2xl ring-2 ring-violet-300 z-20" : ""}`}
                    >
                      <div className='flex justify-between items-start'>
                        <div className='flex items-center gap-2'>
                          <button
                            type='button'
                            {...draggableProvided.dragHandleProps}
                            className='p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-grab active:cursor-grabbing'
                            title='Geser untuk ubah urutan'
                            aria-label='Geser untuk ubah urutan'
                          >
                            <GripVertical size={16} />
                          </button>
                          <button
                            onClick={() => toggleRecommended(i)}
                            className={`p-1.5 rounded-full transition-colors ${
                              plan.isRecommended
                                ? "text-yellow-500 bg-yellow-100 hover:bg-yellow-200"
                                : "text-zinc-300 hover:text-yellow-500 hover:bg-zinc-100"
                            }`}
                          >
                            <Star
                              size={16}
                              fill={plan.isRecommended ? "currentColor" : "none"}
                            />
                          </button>
                        </div>
                        <button
                          onClick={() => removePricingTier(i)}
                          className='text-zinc-300 hover:text-rose-500 transition-colors'
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className='space-y-1'>
                        <label className='text-xs font-semibold text-zinc-500 uppercase'>
                          Nama Paket
                        </label>
                        <input
                          value={plan.name}
                          onChange={(e) =>
                            updatePricingTier(i, "name", e.target.value)
                          }
                          placeholder='Contoh: Paket Basic'
                          className='w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 focus:border-violet-500 px-0 py-1 font-bold text-lg focus:outline-none focus:ring-0'
                        />
                      </div>

                      <div className='space-y-1'>
                        <label className='text-xs font-semibold text-zinc-500 uppercase'>
                          Subjudul Paket
                        </label>
                        <input
                          value={plan.subtitle || ""}
                          onChange={(e) =>
                            updatePricingTier(i, "subtitle", e.target.value)
                          }
                          placeholder='Contoh: Cocok untuk pemula'
                          className='w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 focus:border-violet-500 px-0 py-1 text-sm focus:outline-none focus:ring-0'
                        />
                      </div>

                      <div className='space-y-1'>
                        <label className='text-xs font-semibold text-zinc-500 uppercase'>
                          Keterangan Promo
                        </label>
                        <input
                          value={plan.promoText || ""}
                          onChange={(e) =>
                            updatePricingTier(i, "promoText", e.target.value)
                          }
                          placeholder='Contoh: Promo Ramadan'
                          className='w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 focus:border-violet-500 px-0 py-1 text-sm focus:outline-none focus:ring-0'
                        />
                      </div>

                      <div className='space-y-1'>
                        <label className='text-xs font-semibold text-zinc-500 uppercase'>
                          Harga (IDR)
                        </label>
                        <div className='flex items-center gap-2'>
                          <p className='text-zinc-400'>Rp</p>
                          <input
                            type='number'
                            value={plan.price}
                            onChange={(e) =>
                              updatePricingTier(i, "price", e.target.value)
                            }
                            placeholder='500000'
                            className='w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 focus:border-violet-500 px-0 py-1 font-mono text-lg focus:outline-none focus:ring-0'
                          />
                        </div>
                      </div>

                      <div className='space-y-1'>
                        <label className='text-xs font-semibold text-zinc-500 uppercase'>
                          Nama Tombol
                        </label>
                        <input
                          value={plan.buttonText || ""}
                          onChange={(e) =>
                            updatePricingTier(i, "buttonText", e.target.value)
                          }
                          placeholder='Contoh: Ambil Promo Ini'
                          className='w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 focus:border-violet-500 px-0 py-1 text-sm focus:outline-none focus:ring-0'
                        />
                      </div>

                      <div className='space-y-1 flex-1'>
                        <label className='text-xs font-semibold text-zinc-500 uppercase'>
                          Benefit
                        </label>
                        <p className='text-[10px] text-zinc-400'>
                          Tekan <strong>Enter</strong> untuk poin baru.
                        </p>
                        <textarea
                          value={plan.benefits?.join("\n") || ""}
                          onChange={(e) =>
                            updatePricingTier(i, "benefits", e.target.value)
                          }
                          rows={5}
                          className='w-full mt-1 px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-violet-500 resize-none'
                        />
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {(!items || items.length === 0) && (
        <div className='py-8 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl'>
          <p className='text-zinc-500 text-sm'>Belum ada paket harga.</p>
          <button
            onClick={addPricingTier}
            className='text-violet-600 font-bold text-sm mt-2'
          >
            Tambah Paket
          </button>
        </div>
      )}
    </section>
  );
}
