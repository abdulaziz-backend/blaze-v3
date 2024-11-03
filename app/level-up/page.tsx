'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrophy, faArrowUp, faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import LoadingAnimation from '@/components/LoadingAnimation'
import MovingStar from '@/components/MovingStar'
import { User, AdminStats } from '@/types'
import { fetchUserData, fetchAdminStats, levelUp } from '@/utils/api'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

const LevelBox = ({ level, cost, prize, selected, onClick, disabled }) => {
  return (
    <div
      className={`bg-white/10 backdrop-filter backdrop-blur-lg rounded-2xl shadow-lg p-5 cursor-pointer transition-all duration-300 ${
        selected ? 'border-2 border-white' : ''
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={disabled ? undefined : onClick}
    >
      <h3 className="text-2xl font-bold text-yellow-400 mb-2">{level}</h3>
      {cost && <p className="text-sm text-white mb-1">Cost: {cost} $BLAZE</p>}
      <p className="text-sm text-white mb-4">Prize: {prize} $BLAZE</p>
    </div>
  )
}

export default function LevelUpPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [selectedLevel, setSelectedLevel] = useState(null)
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const router = useRouter()

  const levels = [
    { name: 'Platinum', cost: 10000, prize: 15000 },
    { name: 'Gold', cost: 3000, prize: 5000 },
    { name: 'Bronze', cost: null, prize: 100 },
  ]

  useEffect(() => {
    const initData = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const userId = urlParams.get('user_id')
      if (userId) {
        const userData = await fetchUserData(userId)
        setUser(userData)
      }
      const stats = await fetchAdminStats()
      setAdminStats(stats)
      setLoading(false)
    }

    initData()
  }, [])

  const handleLevelUp = async () => {
    if (!selectedLevel || !user) return

    const levelToUpgrade = levels.find(level => level.name === selectedLevel)
    if (levelToUpgrade && (!levelToUpgrade.cost || user.coins >= levelToUpgrade.cost)) {
      const confirmUpgrade = window.confirm(`Are you sure you want to upgrade to ${selectedLevel}?`)
      if (confirmUpgrade) {
        const updatedUser = await levelUp(user.user_id, selectedLevel, levelToUpgrade.cost || 0, levelToUpgrade.prize)
        if (updatedUser) {
          setUser(updatedUser)
          showAlertMessage(`Congratulations! You are now ${selectedLevel}. You received ${levelToUpgrade.prize} $BLAZE as a prize!`)
        }
      }
    } else {
      showAlertMessage("You don't have enough $BLAZE to level up.")
    }
  }

  const showAlertMessage = (message: string) => {
    setAlertMessage(message)
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 5000)
  }

  if (loading) {
    return <LoadingAnimation />
  }

  return (
    <div className="min-h-screen bg-black p-6 relative overflow-hidden">
      {/* Circular light effects */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-yellow-400 rounded-full filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-yellow-400 rounded-full filter blur-3xl opacity-20"></div>

      {/* Animated moving stars */}
      {[...Array(20)].map((_, i) => (
        <MovingStar key={i} index={i} />
      ))}

      {/* Back button */}
      <Link href={`/?user_id=${user?.user_id}`} className="absolute top-6 left-6 text-white hover:text-yellow-400 transition-colors z-20">
        <FontAwesomeIcon icon={faArrowLeft} className="text-2xl" />
      </Link>

      <div className="relative z-10 flex flex-col items-center mb-12">
        <div className="mb-8">
          <FontAwesomeIcon icon={faTrophy} className="text-6xl text-yellow-400" />
        </div>
        <p className="text-lg text-gray-400 mb-4">Higher levels unlock more opportunities</p>
        <p className="text-xl text-white">You are currently <span className="font-bold">{user?.level || 'Bronze'}</span></p>
        <p className="text-xl text-yellow-400 mt-2">Your $BLAZE: {user?.coins || 0}</p>
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {levels.map((level) => (
          <LevelBox
            key={level.name}
            level={level.name}
            cost={level.cost}
            prize={level.prize}
            selected={selectedLevel === level.name}
            onClick={() => setSelectedLevel(level.name)}
            disabled={user?.level === level.name || (level.cost && user?.coins < level.cost)}
          />
        ))}
      </div>

      {selectedLevel && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center z-20">
          <button
            onClick={handleLevelUp}
            className="py-3 px-8 bg-yellow-400 text-black font-bold rounded-full shadow-lg transition duration-300 hover:bg-opacity-90"
          >
            Level Up to {selectedLevel}
          </button>
        </div>
      )}

      {user?.username === 'ablaze_coder' && adminStats && (
        <div className="mt-8 p-4 bg-white/10 backdrop-filter backdrop-blur-lg rounded-2xl">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">Admin Statistics</h2>
          <p className="text-white">Total Users: {adminStats.totalUsers}</p>
          <p className="text-white">Total $BLAZE Coins: {adminStats.totalBlazeCoins}</p>
        </div>
      )}

      {/* Success Alert */}
      {showAlert && (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-up">
          {alertMessage}
        </div>
      )}
    </div>
  )
}