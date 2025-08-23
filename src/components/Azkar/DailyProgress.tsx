import { DailyProgressProps } from "./types";

export const DailyProgress = ({ todayTotal, target }: DailyProgressProps) => {
  const progressPercentage = Math.min((todayTotal / target) * 100, 100);

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
      <div className="text-right">
        <h2 className="text-2xl font-bold">إجمالي الأذكار اليوم</h2>
        <div className="text-5xl font-bold mb-2">{todayTotal}</div>
        <p className="text-blue-100">ذكر اليوم</p>
        <div className="mt-2 text-sm">
          <span>الهدف اليومي: {target}</span>
          <div className="w-full bg-white/20 rounded-full h-2 mt-1">
            <div
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
