"use client";

import { useState } from "react";
import { NotebookPen, Users } from "lucide-react";
import BootcampParticipantsTable from "@/components/admin/bootcamp/BootcampParticipantsTable";
import BootcampExerciseManager from "@/components/admin/bootcamp/BootcampExerciseManager";

const tabs = [
  { id: "participants", label: "Peserta", icon: Users },
  { id: "exercises", label: "Latihan", icon: NotebookPen },
];

export default function BootcampTabs({
  participants = [],
  exercises = [],
}) {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap gap-2'>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition ${
              activeTab === tab.id
                ? "text-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <tab.icon className='w-4 h-4' />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === "participants" && (
        <BootcampParticipantsTable participants={participants} />
      )}

      {activeTab === "exercises" && (
        <BootcampExerciseManager initialExercises={exercises} />
      )}
    </div>
  );
}
