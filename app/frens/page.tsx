'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserPlus, faArrowLeft, faUserGroup } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import LoadingAnimation from '@/components/LoadingAnimation'
import MovingStar from '@/components/MovingStar'
import { User, Fren } from '@/types'
import { fetchUserData, fetchFrens, inviteFren, updateUserCoins } from '@/utils/api'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

export default function FrensPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [frens, setFrens] = useState<Fren[]>([])
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    const initData = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const userId = urlParams.get('user_id')
      if (userId) {
        const userData = await fetchUserData(userId)
        setUser(userData)
        const frensData = await fetchFrens(userId)
        setFrens(frensData)
      }
      setLoading(false)
    }

    initData()
  }, [])

  const handleInviteFren = async () => {
    if (user) {
      const inviteLink = await inviteFren(user.user_id)
      if (inviteLink) {
        showAlertMessage(`Invite link sent: ${inviteLink}`)
      }
    }
  }

  const showAlertMessage = (message: string) => {
    setAlertMessage(message)
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 3000)
  }

  if (loading) {
    return <LoadingAnimation />
  }

  return (
    <div className="min-h-screen bg-black p-6 relative overflow-hidden flex flex-col">
      {/* Top lighting effect */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-white rounded-full filter blur-3xl opacity-10"></div>

      {/* Animated moving stars */}
      {[...Array(20)].map((_, i) => (
        <MovingStar key={i} index={i} />
      ))}

      {/* Back button */}
      <Link href={`/?user_id=${user?.user_id}`} className="absolute top-6 left-6 text-white hover:text-yellow-400 transition-colors z-20">
        <FontAwesomeIcon icon={faArrowLeft} className="text-2xl" />
      </Link>

      {/* Content */}
      <div className="relative z-10 flex-grow flex flex-col items-center justify-between">
        <div className="text-center w-full">
          <h1 className="text-4xl font-bold text-white mb-4">Frens</h1>
          <p className="text-xl text-yellow-400 mb-8">You have {user?.invited_frens || 0} frens</p>
          <h2 className="text-2xl font-semibold text-white mb-4">Invite frens get more $BLAZE</h2>
        </div>

        <div className="w-full max-w-md mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Your Frens List</h3>
          <div className="space-y-4">
            {frens.map((fren, index) => (
              <div key={index} className="bg-white/10 backdrop-filter backdrop-blur-lg rounded-2xl shadow-lg p-4 flex items-center">
                <FontAwesomeIcon icon={faUserGroup} className="text-yellow-400 text-2xl mr-4" />
                <div>
                  <h4 className="text-lg font-semibold text-white">{fren.username}</h4>
                  <p className="text-sm text-gray-300">Coins: {fren.coins}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleInviteFren}
          className="w-full max-w-md py-3 px-6 bg-white text-black font-bold rounded-full shadow-lg transition duration-300 hover:bg-opacity-90"
        >
          <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
          Invite fren
        </button>
      </div>

      {/* Success Alert */}
      {showAlert && (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-up">
          {alertMessage}
        </div>
      )}
    </div>
  )
}