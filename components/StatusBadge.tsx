import { WorkStatus } from '@/types';

interface StatusBadgeProps {
  status: WorkStatus;
  size?: 'sm' | 'md' | 'lg';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const statusConfig: Record<WorkStatus, { label: string; color: string; icon: string }> = {
    'planned': {
      label: '예정',
      color: 'bg-gray-100 text-gray-800 border border-gray-300',
      icon: '⚪',
    },
    'in-progress': {
      label: '진행중',
      color: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
      icon: '🟡',
    },
    'completed': {
      label: '완료',
      color: 'bg-green-100 text-green-800 border border-green-300',
      icon: '🟢',
    },
    'overdue': {
      label: '지연',
      color: 'bg-red-100 text-red-800 border border-red-300',
      icon: '🔴',
    },
    'on-hold': {
      label: '보류',
      color: 'bg-purple-100 text-purple-800 border border-purple-300',
      icon: '🟣',
    },
  };

  const config = statusConfig[status];

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-semibold ${config.color} ${sizeClasses[size]}`}>
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
}

