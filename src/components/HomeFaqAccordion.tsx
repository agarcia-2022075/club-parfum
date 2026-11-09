"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { FAQ_ITEMS } from "@/data/mock-data";

export function HomeFaqAccordion() {
  const [openId, setOpenId] = useState<string | null>("faq-1");

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {FAQ_ITEMS.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div
            key={item.id}
            className={`border rounded-2xl transition-all duration-200 overflow-hidden bg-white ${
              isOpen
                ? "border-[#A16207] shadow-sm ring-1 ring-[#A16207]/20"
                : "border-[#E7E2DA] hover:border-[#1C1917]/30"
            }`}
          >
            <button
              type="button"
              onClick={() => toggle(item.id)}
              className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A16207]"
              aria-expanded={isOpen}
            >
              <span className="font-serif text-lg sm:text-xl font-normal text-[#1C1917] leading-snug">
                {item.question}
              </span>
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                  isOpen
                    ? "bg-[#A16207] text-white rotate-180"
                    : "bg-[#F2EFE9] text-[#57534E]"
                }`}
              >
                <ChevronDown className="w-4 h-4 stroke-[2]" />
              </span>
            </button>

            {isOpen && (
              <div className="px-5 pb-6 sm:px-6 text-sm sm:text-[15px] text-[#44403C] font-normal leading-relaxed border-t border-[#F2EFE9] pt-4 animate-in fade-in duration-200">
                <p>{item.answer}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
