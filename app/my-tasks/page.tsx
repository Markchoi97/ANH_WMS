'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import StatusBadge from '@/components/StatusBadge';
import { mockMyTasks } from '@/lib/mockData';
import { MyTask } from '@/types';
import {
  PlayIcon,
  QrCodeIcon,
  CheckCircleIcon,
  PauseIcon,
  CameraIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<MyTask[]>(mockMyTasks);
  const [selectedTask, setSelectedTask] = useState<MyTask | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [note, setNote] = useState('');

  const handleStart = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: 'in-progress' as const }
        : task
    ));
  };

  const handleScan = (task: MyTask) => {
    setSelectedTask(task);
    setIsScanning(true);
    
    // 시뮬레이션: 2초 후 스캔 완료
    setTimeout(() => {
      setIsScanning(false);
      alert(`✅ 스캔 완료!\n제품: ${task.productName}\nSKU: ${task.barcode}\n위치: ${task.location}`);
    }, 2000);
  };

  const handleComplete = (taskId: string) => {
    if (confirm('작업을 완료하시겠습니까?')) {
      setTasks(tasks.map(task => 
        task.id === taskId 
          ? { ...task, status: 'completed' as const }
          : task
      ));
    }
  };

  const handleHold = (task: MyTask) => {
    setSelectedTask(task);
    setShowNoteModal(true);
  };

  const handleSaveNote = () => {
    if (selectedTask && note) {
      setTasks(tasks.map(task => 
        task.id === selectedTask.id 
          ? { ...task, status: 'on-hold' as const, note }
          : task
      ));
      setShowNoteModal(false);
      setNote('');
      setSelectedTask(null);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'inbound': return '입고';
      case 'outbound': return '출고';
      case 'packing': return '포장';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'inbound': return 'bg-green-100 text-green-800';
      case 'outbound': return 'bg-blue-100 text-blue-800';
      case 'packing': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="px-2 py-1 text-xs font-bold bg-red-100 text-red-800 rounded">높음</span>;
      case 'medium':
        return <span className="px-2 py-1 text-xs font-bold bg-yellow-100 text-yellow-800 rounded">중간</span>;
      case 'low':
        return <span className="px-2 py-1 text-xs font-bold bg-gray-100 text-gray-800 rounded">낮음</span>;
      default:
        return null;
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const pendingTasks = tasks.filter(t => t.status === 'planned');
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const onHoldTasks = tasks.filter(t => t.status === 'on-hold');

  return (
    <div className="flex flex-col h-screen">
      <Header title="My Tasks" />
      
      <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
        {/* 헤더 */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">내 작업 목록</h2>
          <p className="text-gray-600 mt-1">
            오늘 해야 할 {tasks.length}개의 작업이 있습니다
          </p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">예정</div>
            <div className="text-3xl font-bold text-gray-900 mt-1">{pendingTasks.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">진행중</div>
            <div className="text-3xl font-bold text-yellow-600 mt-1">{inProgressTasks.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">완료</div>
            <div className="text-3xl font-bold text-green-600 mt-1">{completedTasks.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">보류</div>
            <div className="text-3xl font-bold text-purple-600 mt-1">{onHoldTasks.length}</div>
          </div>
        </div>

        {/* 작업 목록 */}
        <div className="space-y-4">
          {tasks.map((task) => (
            <div 
              key={task.id} 
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getTypeColor(task.type)}`}>
                      {getTypeLabel(task.type)}
                    </span>
                    <StatusBadge status={task.status} />
                    {getPriorityBadge(task.priority)}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{task.title}</h3>
                  <p className="text-gray-600 mb-3">{task.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">제품:</span>
                      <span className="ml-2 font-medium text-gray-900">{task.productName}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">수량:</span>
                      <span className="ml-2 font-medium text-gray-900">{task.quantity} {task.unit}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">위치:</span>
                      <span className="ml-2 font-medium text-gray-900">{task.location}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">마감:</span>
                      <span className="ml-2 font-medium text-gray-900">{formatTime(task.dueDate)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">SKU:</span>
                      <span className="ml-2 font-mono text-sm font-medium text-gray-900">{task.barcode}</span>
                    </div>
                  </div>

                  {task.note && (
                    <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <p className="text-sm text-purple-800">
                        <strong>메모:</strong> {task.note}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 액션 버튼 */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                {task.status === 'planned' && (
                  <button
                    onClick={() => handleStart(task.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <PlayIcon className="h-5 w-5" />
                    시작
                  </button>
                )}

                {task.status === 'in-progress' && (
                  <>
                    <button
                      onClick={() => handleScan(task)}
                      disabled={isScanning}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      {isScanning && selectedTask?.id === task.id ? (
                        <>
                          <CameraIcon className="h-5 w-5 animate-pulse" />
                          스캔중...
                        </>
                      ) : (
                        <>
                          <QrCodeIcon className="h-5 w-5" />
                          스캔
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleComplete(task.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircleIcon className="h-5 w-5" />
                      완료
                    </button>
                    <button
                      onClick={() => handleHold(task)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <PauseIcon className="h-5 w-5" />
                      보류
                    </button>
                  </>
                )}

                {task.status === 'completed' && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircleIcon className="h-5 w-5" />
                    <span className="font-semibold">작업 완료됨</span>
                  </div>
                )}

                {task.status === 'on-hold' && (
                  <div className="flex items-center gap-2 text-purple-600">
                    <PauseIcon className="h-5 w-5" />
                    <span className="font-semibold">보류 중</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {tasks.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">할당된 작업이 없습니다.</p>
          </div>
        )}
      </main>

      {/* 보류 메모 모달 */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowNoteModal(false)}></div>
            
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <DocumentTextIcon className="h-6 w-6 text-purple-600" />
                <h3 className="text-xl font-semibold text-gray-900">작업 보류</h3>
              </div>
              
              <p className="text-gray-600 mb-4">
                보류 사유를 입력해주세요. (불량, 대기, 재검수 필요 등)
              </p>

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                placeholder="보류 사유를 상세히 입력하세요..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />

              <div className="mt-4 text-sm text-gray-500">
                💡 추후 사진 첨부 기능이 추가될 예정입니다.
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowNoteModal(false);
                    setNote('');
                    setSelectedTask(null);
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveNote}
                  disabled={!note.trim()}
                  className="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  보류 처리
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

