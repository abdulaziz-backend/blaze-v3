'use client'

import { useState, useEffect, lazy, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWallet, faUserGroup, faTrophy, faArrowUp, faBolt, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import LoadingAnimation from '@/components/LoadingAnimation'
import MovingStar from '@/components/MovingStar'
import { User, Task } from '@/types'
import { fetchUserData, fetchTasks, addTask, completeTask, deleteTask, updateUserCoins } from '@/utils/api'

const LazyAdminDashboard = lazy(() => import('@/components/AdminDashboard'))
const LazyTaskList = lazy(() => import('@/components/TaskList'))

const ADMIN_ID = 6236467772

interface HomePageProps {
  initialUser: User | null
  initialTasks: Task[]
}

export default function HomePage({ initialUser, initialTasks }: HomePageProps) {
  const [user, setUser] = useState<User | null>(initialUser)
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertType, setAlertType] = useState<'success' | 'error'>('success')

  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        try {
          const urlParams = new URLSearchParams(window.location.search)
          const userId = urlParams.get('user_id')
          if (userId) {
            const userData = await fetchUserData(parseInt(userId))
            setUser(userData)
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
          setError('Failed to load user data. Please try refreshing the page.')
        }
      }
    }

    fetchData()
  }, [user])
  const handleConnectWallet = async () => {
    // Implement TON Connect functionality here
    console.log('Connecting wallet with TON Connect')
  }

  const handleCompleteTask = async (taskId: number, reward: number, type: string, link: string) => {
    if (user) {
      setLoading(true)
      try {
        const completedTask = await completeTask(user.user_id, taskId, reward)
        if (completedTask) {
          const updatedUser = await updateUserCoins(user.user_id, reward)
          if (updatedUser) {
            setUser(updatedUser)
            setTasks(prevTasks => prevTasks.map(task => task.id === taskId ? { ...task, completed: true } : task))
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
        setLoading(false)
      }
    }
  }

  const handleDeleteTask = async (taskId: number) => {
    if (user?.user_id === ADMIN_ID) {
      setLoading(true)
      try {
        const success = await deleteTask(taskId)
        if (success) {
          setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId))
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

        <Suspense fallback={<LoadingAnimation />}>
          <LazyTaskList
            tasks={tasks}
            user={user}
            onCompleteTask={handleCompleteTask}
            onDeleteTask={handleDeleteTask}
          />
        </Suspense>

        {user?.user_id === ADMIN_ID && (
          <Suspense fallback={<LoadingAnimation />}>
            <LazyAdminDashboard user={user} />
          </Suspense>
        )}
      </div>

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