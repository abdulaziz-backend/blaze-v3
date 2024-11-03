'use client'

import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUsers, faCoins, faChartLine, faUserPlus } from '@fortawesome/free-solid-svg-icons'
import { Line } from 'react-chartjs-2'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { User, AdminStats } from '@/types'
import { fetchAdminStats } from '@/utils/api'
import LoadingAnimation from '@/components/LoadingAnimation'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface AdminDashboardProps {
  user: User
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await fetchAdminStats()
        setAdminStats(stats)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching admin stats:', error)
        setError('Failed to load admin stats. Please try again later.')
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return <LoadingAnimation />
  }

  if (error) {
    return (
      <div className="bg-red-500 text-white p-4 rounded-lg">
        <h3 className="text-lg font-semibold">Error</h3>
        <p>{error}</p>
      </div>
    )
  }

  if (!adminStats) {
    return null
  }

  const userGrowthChartData = {
    labels: adminStats.userGrowth.map(data => data.date),
    datasets: [
      {
        label: 'Total Users',
        data: adminStats.userGrowth.map(data => data.totalUsers),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        label: 'New Users',
        data: adminStats.userGrowth.map(data => data.newUsers),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      }
    ]
  }

  const inviteGrowthChartData = {
    labels: adminStats.inviteGrowth.map(data => data.date),
    datasets: [
      {
        label: 'Invites',
        data: adminStats.inviteGrowth.map(data => data.invites),
        borderColor: 'rgb(255, 159, 64)',
        tension: 0.1
      }
    ]
  }

  const coinGrowthChartData = {
    labels: adminStats.coinGrowth.map(data => data.date),
    datasets: [
      {
        label: 'Total Coins',
        data: adminStats.coinGrowth.map(data => data.totalCoins),
        borderColor: 'rgb(153, 102, 255)',
        tension: 0.1
      }
    ]
  }

  return (
    <div className="w-full bg-white/10 backdrop-filter backdrop-blur-lg rounded-2xl shadow-lg p-5">
      <h2 className="text-2xl font-bold text-yellow-400 mb-4">Admin Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg">
          <FontAwesomeIcon icon={faUsers} className="text-2xl text-yellow-400 mb-2" />
          <h3 className="text-lg font-semibold text-white">Total Users</h3>
          <p className="text-2xl font-bold text-yellow-400">{adminStats.totalUsers}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <FontAwesomeIcon icon={faCoins} className="text-2xl text-yellow-400 mb-2" />
          <h3 className="text-lg font-semibold text-white">Total $BLAZE</h3>
          <p className="text-2xl font-bold text-yellow-400">{adminStats.totalBlazeCoins}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <FontAwesomeIcon icon={faUserPlus} className="text-2xl text-yellow-400 mb-2" />
          <h3 className="text-lg font-semibold text-white">New Users (24h)</h3>
          <p className="text-2xl font-bold text-yellow-400">{adminStats.newUsers24h}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <FontAwesomeIcon icon={faChartLine} className="text-2xl text-yellow-400 mb-2" />
          <h3 className="text-lg font-semibold text-white">Active Users (24h)</h3>
          <p className="text-2xl font-bold text-yellow-400">{adminStats.activeUsers24h}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">User Growth</h3>
          <Line data={userGrowthChartData} options={{ responsive: true }} />
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Invite Growth</h3>
          <Line data={inviteGrowthChartData} options={{ responsive: true }} />
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Coin Growth</h3>
        <Line data={coinGrowthChartData} options={{ responsive: true }} />
      </div>

      <button
        onClick={() => {/* Implement add task functionality */}}
        className="w-full py-2 px-4 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors"
      >
        Add New Task
      </button>
    </div>
  )
}