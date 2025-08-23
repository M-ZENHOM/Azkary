import { useState } from "react";
import { Icons } from "../Icons";
import Button from "../ui/button";
import Input from "../ui/input";
import { AddZekrFormProps } from "./types";

export const AddZekrForm = ({ onAddZekr }: AddZekrFormProps) => {
  const [inputValue, setInputValue] = useState("");
  const [priority, setPriority] = useState(1);

  const handleSubmit = () => {
    if (!inputValue.trim()) return;

    onAddZekr(inputValue.trim(), priority);
    setInputValue("");
    setPriority(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex w-full gap-2 items-center">
        <Input
          placeholder="أدخل ذكرك هنا"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          icon={<Icons.AddIcon className="size-[12px] text-black" />}
          className="w-full flex-1"
        />
        <Input
          type="number"
          placeholder="أدخل الأولوية"
          value={priority}
          onChange={(e) => setPriority(Number(e.target.value))}
          min="1"
          max="10"
          icon={<Icons.PriorityIcon className="size-[12px] text-black" />}
          className="w-full"
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!inputValue.trim()}
        className="w-full px-4 py-2"
      >
        إضافة ذكر
      </Button>
    </div>
  );
};
