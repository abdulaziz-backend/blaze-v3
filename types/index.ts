export interface User {
  user_id: number
  username: string
  coins: number
  level: string
  invited_frens: number
}

export interface Task {
  id: number
  description: string
  reward: number
  imageUrl: string
  header: string
  link: string
  type: 'Telegram' | 'Other'
  completed: boolean
}

export interface AdminStats {
  totalUsers: number
  totalBlazeCoins: number
}