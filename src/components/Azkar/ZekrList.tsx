import { useState } from "react";
import { Icons } from "../Icons";
import Button from "../ui/button";
import Input from "../ui/input";
import { ZekrListProps, EditingZekr } from "./types";

export const ZekrList = ({
  zekr,
  onUpdateZekr,
  onDeleteZekr,
  onDecrementCount,
}: ZekrListProps) => {
  const [editingZekr, setEditingZekr] = useState<EditingZekr | null>(null);

  const startEditing = (index: number, text: string, priority: number) => {
    setEditingZekr({ index, text, priority });
  };

  const cancelEditing = () => {
    setEditingZekr(null);
  };

  const handleUpdate = async (
    index: number,
    text: string,
    priority: number
  ) => {
    await onUpdateZekr(index, text, priority);
    setEditingZekr(null);
  };

  if (zekr.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8">
        لا توجد أذكار بعد. أضف ذكرك الأول!
      </p>
    );
  }

  return (
    <div className="space-y-2 h-[25vh]">
      <h3 className="text-lg font-semibold text-gray-800">قائمة الأذكار</h3>
      <ul className="w-full flex flex-col gap-2 pb-2">
        {zekr.map((item, index) => (
          <ZekrItem
            key={index}
            item={item}
            index={index}
            isEditing={editingZekr?.index === index}
            editingData={editingZekr}
            onStartEditing={startEditing}
            onCancelEditing={cancelEditing}
            onUpdate={handleUpdate}
            onDelete={onDeleteZekr}
            onDecrementCount={onDecrementCount}
          />
        ))}
      </ul>
    </div>
  );
};

interface ZekrItemProps {
  item: { text: string; priority: number; count: number };
  index: number;
  isEditing: boolean;
  editingData: EditingZekr | null;
  onStartEditing: (index: number, text: string, priority: number) => void;
  onCancelEditing: () => void;
  onUpdate: (index: number, text: string, priority: number) => Promise<void>;
  onDelete: (index: number) => Promise<void>;
  onDecrementCount: (index: number) => Promise<void>;
}

const ZekrItem = ({
  item,
  index,
  isEditing,
  editingData,
  onStartEditing,
  onCancelEditing,
  onUpdate,
  onDelete,
  onDecrementCount,
}: ZekrItemProps) => {
  if (isEditing && editingData) {
    return (
      <li className="flex justify-between items-center gap-4 p-3 bg-gray-100 rounded-lg border">
        <div className="flex-1 flex gap-2 items-center">
          <Input
            type="text"
            value={editingData.text}
            onChange={(e) =>
              onStartEditing(index, e.target.value, editingData.priority)
            }
            className="flex-1"
          />
          <Input
            type="number"
            value={editingData.priority}
            onChange={(e) =>
              onStartEditing(index, editingData.text, Number(e.target.value))
            }
            min="1"
            max="10"
            className="w-20"
          />
          <Button
            onClick={() =>
              onUpdate(index, editingData.text, editingData.priority)
            }
            disabled={!editingData.text.trim()}
            variant="success"
            size="icon"
          >
            <Icons.SaveIcon className="size-4" />
          </Button>
          <Button onClick={onCancelEditing} variant="error" size="icon">
            <Icons.CancelIcon className="size-4" />
          </Button>
        </div>
      </li>
    );
  }

  return (
    <li className="flex justify-between items-center gap-4 p-3 bg-gray-100 rounded-lg border">
      <div className="flex-1">
        <span className="text-right block">{item.text}</span>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-gray-600 bg-green-100/70 border border-green-500/50 px-2 py-1 rounded">
            الأولوية: {item.priority}
          </span>
          <span className="text-sm text-blue-600 bg-blue-100/70 border border-blue-500/50 px-2 py-1 rounded">
            العدد: {item.count || 0}
          </span>
        </div>
      </div>
      <div className="flex gap-1">
        <Button
          onClick={() => onDecrementCount(index)}
          variant="info"
          size="icon"
          title="إنقاص ذكر"
          disabled={!item.count || item.count <= 0}
        >
          <Icons.CancelIcon className="size-4" />
        </Button>
        <Button
          onClick={() => onStartEditing(index, item.text, item.priority)}
          variant="info"
          size="icon"
          title="تعديل"
        >
          <Icons.EditIcon className="size-4" />
        </Button>
        <Button
          onClick={() => onDelete(index)}
          className="px-2 py-1 bg-red-500 text-white hover:bg-red-600"
          title="حذف"
          variant="error"
          size="icon"
        >
          <Icons.DeleteIcon className="size-4" />
        </Button>
      </div>
    </li>
  );
};
