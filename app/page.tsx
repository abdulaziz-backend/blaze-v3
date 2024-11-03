'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWallet, faUserGroup, faTrophy, faArrowUp, faBolt, faChevronRight, faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import LoadingAnimation from '@/components/LoadingAnimation'
import MovingStar from '@/components/MovingStar'
import { User, Task, AdminStats } from '@/types'
import { fetchUserData, fetchTasks, addTask, completeTask, deleteTask, updateUserCoins, fetchAdminStats } from '@/utils/api'

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name: string;
            username: string;
            language_code: string;
          };
        };
      };
    };
  }
}

const ADMIN_ID = 6236467772

export default function HomePage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [showAddTask, setShowAddTask] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertType, setAlertType] = useState<'success' | 'error'>('success')
  const [newTask, setNewTask] = useState<Omit<Task, 'id' | 'completed'>>({
    description: '',
    reward: 0,
    imageUrl: '',
    header: '',
    link: '',
    type: 'Other'
  })
  const [tasks, setTasks] = useState<Task[]>([])
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null)
  const [completingTask, setCompletingTask] = useState<number | null>(null)

  const router = useRouter()

  useEffect(() => {
    const initData = async () => {
      try {
        let userId: number | null = null;
    
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
          const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
          if (tgUser) {
            userId = tgUser.id;
            console.log("Telegram user ID:", userId);
          }
        }
    
        if (!userId) {
          const urlParams = new URLSearchParams(window.location.search)
          const userIdParam = urlParams.get('user_id')
          if (userIdParam) {
            userId = parseInt(userIdParam)
            console.log("URL user ID:", userId);
          }
        }
    
        if (userId) {
          console.log("Fetching user data for ID:", userId);
          const userData = await fetchUserData(userId)
          console.log("Fetched user data:", userData);
          if (userData) {
            setUser(userData)
            if (userData.user_id === ADMIN_ID) {
              const stats = await fetchAdminStats()
              setAdminStats(stats)
            }
          } else {
            throw new Error('User data not found')
          }
        } else {
          throw new Error('User ID not found')
        }
    
        const tasksData = await fetchTasks()
        setTasks(tasksData)
      } catch (err) {
        console.error('Error initializing data:', err)
        setError('Failed to load initial data. Please try refreshing the page.')
      } finally {
        setLoading(false)
      }
    }

      initData()
    }, [])

  const handleConnectWallet = async () => {
    console.log('Connecting wallet with TON Connect')
    // Implement TON Connect functionality here
  }

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (user?.user_id === ADMIN_ID) {
      setLoading(true)
      try {
        const addedTask = await addTask(newTask)
        if (addedTask) {
          setTasks([...tasks, addedTask])
          setShowAddTask(false)
          setNewTask({
            description: '',
            reward: 0,
            imageUrl: '',
            header: '',
            link: '',
            type: 'Other'
          })
          showAlertMessage('Task added successfully!', 'success')
        } else {
          throw new Error('Failed to add task')
        }
      } catch (error) {
        console.error('Error adding task:', error)
        showAlertMessage('Failed to add task. Please try again.', 'error')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleCompleteTask = async (taskId: number, reward: number, type: string, link: string) => {
    if (user) {
      setCompletingTask(taskId)
      try {
        const completedTask = await completeTask(user.user_id, taskId, reward)
        if (completedTask) {
          const updatedUser = await updateUserCoins(user.user_id, reward)
          if (updatedUser) {
            setUser(updatedUser)
            setTasks(tasks.map(task => task.id === taskId ? { ...task, completed: true } : task))
            showAlertMessage(`Task completed successfully! You earned ${reward} $BLAZE`, 'success')
          } else {
            throw new Error('Failed to update user coins')
          }
        } else {
          throw new Error('Failed to complete task')
        }
      } catch (error) {
        console.error('Error completing task:', error)
        showAlertMessage('Failed to complete task. Please try again.', 'error')
      } finally {
        setCompletingTask(null)
      }
    }
  }

  const handleDeleteTask = async (taskId: number) => {
    if (user?.user_id === ADMIN_ID) {
      setLoading(true)
      try {
        const success = await deleteTask(taskId)
        if (success) {
          setTasks(tasks.filter(task => task.id !== taskId))
          showAlertMessage('Task deleted successfully!', 'success')
        } else {
          throw new Error('Failed to delete task')
        }
      } catch (error) {
        console.error('Error deleting task:', error)
        showAlertMessage('Failed to delete task. Please try again.', 'error')
      } finally {
        setLoading(false)
      }
    }
  }

  const showAlertMessage = (message: string, type: 'success' | 'error') => {
    setAlertMessage(message)
    setAlertType(type)
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 5000)
  }

  if (loading) {
    return <LoadingAnimation />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="bg-red-500 text-white p-4 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-2">Error</h1>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-64 h-64 bg-yellow-400 rounded-full filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-yellow-400 rounded-full filter blur-3xl opacity-20"></div>

      {[...Array(20)].map((_, i) => (
        <MovingStar key={i} index={i} />
      ))}

      <div className="relative z-10 flex flex-col items-center space-y-8">
        <button
          onClick={handleConnectWallet}
          className="w-[90%] py-3 px-6 bg-white/10 backdrop-filter backdrop-blur-lg rounded-2xl shadow-lg flex items-center justify-center space-x-2 text-white font-bold transition duration-300 hover:bg-white/20"
        >
          <FontAwesomeIcon icon={faWallet} className="text-lg" />
          <span className="text-lg">Connect Wallet with TON</span>
        </button>

        <div className="text-center py-4">
          <p className="text-lg text-yellow-200 mb-2">Earned balance</p>
          <div className="flex items-center justify-center space-x-4">
            <FontAwesomeIcon icon={faBolt} className="text-4xl text-yellow-400" />
            <h1 className="text-5xl font-bold text-white shadow-lg">{user?.coins || 0}</h1>
          </div>
        </div>

        <div className="flex w-full space-x-4">
          <Link href={`/level-up?user_id=${user?.user_id}`} className="flex-1 py-4 px-4 bg-white/10 backdrop-filter backdrop-blur-lg rounded-2xl shadow-lg flex flex-col items-center justify-center text-white font-bold transition duration-300 hover:bg-white/20">
            <FontAwesomeIcon icon={faTrophy} className="text-3xl text-yellow-400 mb-2" />
            <span className="text-sm text-orange-300">{user?.level || 'Bronze'}</span>
          </Link>
          <Link href={`/frens?user_id=${user?.user_id}`} className="flex-1 py-4 px-4 bg-white/10 backdrop-filter backdrop-blur-lg rounded-2xl shadow-lg flex flex-col items-center justify-center text-white font-bold transition duration-300 hover:bg-white/20">
            <FontAwesomeIcon icon={faUserGroup} className="text-3xl mb-2" />
            <span className="text-sm text-orange-300">{user?.invited_frens || 0} Frens</span>
          </Link>
          <Link href={`/level-up?user_id=${user?.user_id}`} className="flex-1 py-4 px-4 bg-white/10 backdrop-filter backdrop-blur-lg rounded-2xl shadow-lg flex flex-col items-center justify-center text-white font-bold transition duration-300 hover:bg-white/20">
            <FontAwesomeIcon icon={faArrowUp} className="text-3xl mb-2" />
            <span className="text-sm text-orange-300">Level Up</span>
          </Link>
        </div>

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
                ) : (
                  <FontAwesomeIcon icon={faChevronRight} className="text-xl" />
                )}
              </button>
              {user?.user_id === ADMIN_ID && (
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="absolute top-0 right-0 text-red-500 hover:text-red-600 transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-xl" />
                </button>
              )}
            </div>
          ))}
        </div>

        {user?.user_id === ADMIN_ID && (
          <div className="w-full bg-white/10 backdrop-filter backdrop-blur-lg rounded-2xl shadow-lg p-5">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">Admin Dashboard</h2>
            {adminStats && (
              <div className="mb-4">
                <p className="text-white">Total Users: {adminStats.totalUsers}</p>
                <p className="text-white">Total $BLAZE Coins: {adminStats.totalBlazeCoins}</p>
              </div>
            )}
            <button
              onClick={() => setShowAddTask(true)}
              className="w-full py-2 px-4 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors"
            >
              Add New Task
            </button>
          </div>
        )}
      </div>

      {showAddTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">Add New Task</h2>
            <form onSubmit={handleAddTask} className="space-y-4">
              <input
                type="text"
                placeholder="Task Image URL"
                value={newTask.imageUrl}
                onChange={(e) => setNewTask({ ...newTask, imageUrl: e.target.value })}
                className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded"
                required
              />
              <input
                type="text"
                placeholder="Task Header"
                value={newTask.header}
                onChange={(e) => setNewTask({ ...newTask, header: e.target.value })}
                className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded"
                required
              />
              <input
                type="text"
                placeholder="Task Description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded"
                required
              />
              <input
                type="text"
                placeholder="Task Link"
                value={newTask.link}
                onChange={(e) => setNewTask({ ...newTask, link: e.target.value })}
                className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded"
                required
              />
              <input
                type="number"
                placeholder="Task Reward"
                value={newTask.reward}
                onChange={(e) => setNewTask({ ...newTask, reward: parseInt(e.target.value) })}
                className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded"
                required
              />
              <select
                value={newTask.type}
                onChange={(e) => setNewTask({ ...newTask, type: e.target.value as 'Telegram' | 'Other' })}
                className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded"
                required
              >
                <option value="Telegram">Telegram</option>
                <option value="Other">Other</option>
              </select>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddTask(false)}
                  className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-500 transition-colors"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAlert && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg animate-fade-in-down ${
          alertType === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white backdrop-filter backdrop-blur-lg bg-opacity-90`}>
          {alertMessage}
        </div>
      )}
    </div>
  )
}