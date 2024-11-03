'use client'

import { useState } from 'react'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBolt, faChevronRight, faTimes, faSpinner, faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import { User, Task } from '@/types'

interface TaskListProps {
  tasks: Task[]
  user: User | null
  onCompleteTask: (taskId: number, reward: number, type: string, link: string) => Promise<void>
  onDeleteTask: (taskId: number) => Promise<void>
}

export default function TaskList({ tasks, user, onCompleteTask, onDeleteTask }: TaskListProps) {
  const [completingTask, setCompletingTask] = useState<number | null>(null)

  const handleCompleteTask = async (taskId: number, reward: number, type: string, link: string) => {
    setCompletingTask(taskId)
    await onCompleteTask(taskId, reward, type, link)
    setCompletingTask(null)
  }

  return (
    <div className="w-full bg-white/10 backdrop-filter backdrop-blur-lg rounded-2xl shadow-lg p-5">
      <h2 className="text-2xl font-bold text-yellow-400 mb-4">Earn</h2>
      {tasks.map((task) => (
        <div key={task.id} className="flex items-center space-x-5 mb-4 relative">
          <div className="w-16 h-16 bg-yellow-400 rounded-xl flex items-center justify-center">
            <Image src={task.imageUrl} alt={task.header} width={48} height={48} className="object-cover rounded" />
          </div>
          <div className="flex-grow">
            <h3 className="text-xl font-bold text-white">{task.header}</h3>
            <p className="text-sm text-gray-300">{task.description}</p>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-yellow-400">{task.reward}</span>
              <FontAwesomeIcon icon={faBolt} className="text-yellow-400 text-sm" />
            </div>
          </div>
          <button
            onClick={() => handleCompleteTask(task.id, task.reward, task.type, task.link)}
            className={`text-yellow-400 hover:text-yellow-300 transition-colors ${task.completed ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={task.completed || completingTask === task.id}
          >
            {completingTask === task.id ? (
              <FontAwesomeIcon icon={faSpinner} className="text-xl animate-spin" />
            ) : task.completed ? (
              <FontAwesomeIcon icon={faCheckCircle} className="text-xl text-green-500" />
            ) : (
              <FontAwesomeIcon icon={faChevronRight} className="text-xl" />
            )}
          </button>
          {user?.user_id === 6236467772 && (
            <button
              onClick={() => onDeleteTask(task.id)}
              className="absolute top-0 right-0 text-red-500 hover:text-red-600 transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} className="text-xl" />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}