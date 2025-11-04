interface ProgressBarProps {
  planned: number;
  inProgress: number;
  completed: number;
  overdue?: number;
}

export default function ProgressBar({ planned, inProgress, completed, overdue = 0 }: ProgressBarProps) {
  const total = planned + inProgress + completed + overdue;
  
  if (total === 0) {
    return (
      <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
        <div className="h-full flex items-center justify-center text-xs text-gray-500">
          작업 없음
        </div>
      </div>
    );
  }

  const plannedPercent = (planned / total) * 100;
  const inProgressPercent = (inProgress / total) * 100;
  const completedPercent = (completed / total) * 100;
  const overduePercent = (overdue / total) * 100;

  return (
    <div className="w-full">
      <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden flex">
        {planned > 0 && (
          <div 
            className="bg-gray-400 flex items-center justify-center text-xs text-white font-semibold"
            style={{ width: `${plannedPercent}%` }}
          >
            {plannedPercent >= 10 && `${planned}`}
          </div>
        )}
        {inProgress > 0 && (
          <div 
            className="bg-yellow-400 flex items-center justify-center text-xs text-gray-900 font-semibold"
            style={{ width: `${inProgressPercent}%` }}
          >
            {inProgressPercent >= 10 && `${inProgress}`}
          </div>
        )}
        {completed > 0 && (
          <div 
            className="bg-green-500 flex items-center justify-center text-xs text-white font-semibold"
            style={{ width: `${completedPercent}%` }}
          >
            {completedPercent >= 10 && `${completed}`}
          </div>
        )}
        {overdue > 0 && (
          <div 
            className="bg-red-500 flex items-center justify-center text-xs text-white font-semibold"
            style={{ width: `${overduePercent}%` }}
          >
            {overduePercent >= 10 && `${overdue}`}
          </div>
        )}
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-600">
        <span>⚪ 예정 {planned}</span>
        <span>🟡 진행 {inProgress}</span>
        <span>🟢 완료 {completed}</span>
        {overdue > 0 && <span>🔴 지연 {overdue}</span>}
      </div>
    </div>
  );
}

