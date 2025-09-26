import Input from "../ui/input";
import { DailyTargetSettingsProps } from "./types";

export const DailyTargetSettings = ({
  target,
  onTargetChange,
}: DailyTargetSettingsProps) => {
  const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTarget = parseInt(e.target.value) || 100;
    onTargetChange(newTarget);
  };

  return (
    <div className="bg-white p-4 rounded-lg w-full">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">الهدف اليومي</h3>
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            value={target}
            onChange={handleTargetChange}
            min="1"
            className="w-[100px]"
          />
          <span className="text-sm text-gray-600">ذكر</span>
        </div>
      </div>
    </div>
  );
};
