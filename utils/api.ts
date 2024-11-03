import { User, Task, Fren, AdminStats } from '@/types'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'


export async function fetchUserData(userId: number): Promise<User | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/${userId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}


export async function fetchTasks() {
  try {
    const res = await fetch(`${BACKEND_URL}/tasks`)
    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.error || 'Failed to fetch tasks')
    }
    return res.json()
  } catch (error) {
    console.error('Error fetching tasks:', error)
    throw new Error('Failed to fetch tasks. Please check your connection and try again.')
  }
}




export async function addTask(task: Omit<Task, 'id' | 'completed'>): Promise<Task | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/add_task`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    })
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.error('Error adding task:', error)
  }
  return null
}

export async function completeTask(userId: number, taskId: number, reward: number): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/complete_task`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId, task_id: taskId, reward }),
    })
    return response.ok
  } catch (error) {
    console.error('Error completing task:', error)
  }
  return false
}

export async function updateUserCoins(userId: number, coins: number): Promise<User | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/update_coins`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId, coins }),
    })
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.error('Error updating user coins:', error)
  }
  return null
}

export async function fetchFrens(userId: string): Promise<Fren[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/get_frens/${userId}`)
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.error('Error fetching frens:', error)
  }
  return []
}

export async function inviteFren(userId: number): Promise<string | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/invite_fren`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    })
    if (response.ok) {
      const data = await response.json()
      return data.invite_link
    }
  } catch (error) {
    console.error('Error inviting fren:', error)
  }
  return null
}


export async function fetchAdminStats() {
  try {
    const res = await fetch(`${BACKEND_URL}/admin_stats`)
    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.error || 'Failed to fetch admin stats')
    }
    return res.json()
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    throw new Error('Failed to fetch admin stats. Please check your connection and try again.')
  }
}


export async function levelUp(userId: number, newLevel: string, cost: number, prize: number): Promise<User | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/level_up`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId, new_level: newLevel, cost, prize }),
    })
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.error('Error leveling up:', error)
  }
  return null
}

export async function deleteTask(taskId: number): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/delete_task`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ task_id: taskId }),
    })
    return response.ok
  } catch (error) {
    console.error('Error deleting task:', error)
    return false
  }
}