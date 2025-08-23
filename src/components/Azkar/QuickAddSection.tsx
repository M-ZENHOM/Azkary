import { useState } from "react";
import Button from "../ui/button";
import { QuickAddSectionProps } from "./types";

const QUICK_ADD_ZEKR = [
  { text: "سبحان الله", color: "bg-blue-500 hover:bg-blue-600" },
  { text: "الحمد لله", color: "bg-green-500 hover:bg-green-600" },
  { text: "لا إله إلا الله", color: "bg-purple-500 hover:bg-purple-600" },
  { text: "الله أكبر", color: "bg-red-500 hover:bg-red-600" },
  {
    text: "لا حول ولا قوة إلا بالله",
    color: "bg-orange-500 hover:bg-orange-600",
  },
  { text: "أستغفر الله", color: "bg-teal-500 hover:bg-teal-600" },
];

export const QuickAddSection = ({ onQuickAdd }: QuickAddSectionProps) => {
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const handleQuickAdd = (text: string) => {
    onQuickAdd(text);
  };

  return (
    <div className="bg-white p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">إضافة سريعة للأذكار</h3>
        <Button
          onClick={() => setShowQuickAdd(!showQuickAdd)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          {showQuickAdd ? "إخفاء" : "إظهار"}
        </Button>
      </div>

      {showQuickAdd && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {QUICK_ADD_ZEKR.map((item) => (
            <Button
              key={item.text}
              onClick={() => handleQuickAdd(item.text)}
              className={`${item.color} text-white`}
            >
              {item.text}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};
