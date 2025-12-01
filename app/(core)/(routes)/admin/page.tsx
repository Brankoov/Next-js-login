"use client"

import { useEffect, useState } from "react"

interface User {
  id: string
  username: string
  isEnabled: boolean
  roles: string[]
}

// Interface för Todos (så vi kan visa dem)
interface Todo {
  id: string
  title: string
  description: string
  completed: boolean
  dueDate: string
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // State för Delete Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  // State för Todo Modal
  const [isTodoModalOpen, setIsTodoModalOpen] = useState(false)
  const [selectedUserTodos, setSelectedUserTodos] = useState<Todo[]>([])
  const [selectedUserName, setSelectedUserName] = useState("")

  useEffect(() => {
    const loadData = async () => {
      try {
        const meRes = await fetch("http://localhost:8080/user", { credentials: "include" })
        if (meRes.ok) {
          const meData = await meRes.json()
          setCurrentUser(meData.username)
        }

        const usersRes = await fetch("http://localhost:8080/admin/users", { credentials: "include" })
        if (usersRes.status === 401 || usersRes.status === 403) {
          window.location.href = "/login"
          return
        }
        const usersData = await usersRes.json()
        setUsers(usersData)
      } catch (e) { setError("Kunde inte hämta data.") } finally { setLoading(false) }
    }
    loadData()
  }, [])

  // --- FUNKTIONER ---

  const confirmDelete = (user: User) => {
    setUserToDelete(user)
    setIsDeleteModalOpen(true)
  }

  const handleDelete = async () => {
    if (!userToDelete) return
    try {
      const res = await fetch(`http://localhost:8080/admin/users/${userToDelete.id}`, { method: "DELETE", credentials: "include" })
      if (!res.ok) return alert("Failed to delete")
      setUsers(users.filter(u => u.id !== userToDelete.id))
      setIsDeleteModalOpen(false)
    } catch (e) { alert("Network error") }
  }

  // NY FUNKTION: Hämta och visa todos
  const viewUserTodos = async (user: User) => {
    try {
      const res = await fetch(`http://localhost:8080/admin/users/${user.id}/todos`, { credentials: "include" })
      if (res.ok) {
        const todos = await res.json()
        setSelectedUserTodos(todos)
        setSelectedUserName(user.username)
        setIsTodoModalOpen(true)
      }
    } catch (e) { alert("Could not fetch todos") }
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading admin panel...</div>
  if (error) return <div className="p-8 text-red-500 text-center">{error}</div>

  return (
    <div className="min-h-screen bg-gray-50 p-8 relative">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <div className="text-sm text-gray-500">Logged in as: <span className="font-bold text-gray-800">{currentUser}</span></div>
        </div>
        
        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
          <div className="p-5 border-b bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-700">User Management</h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">{users.length} Users</span>
          </div>

          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b text-gray-500 uppercase text-xs tracking-wider">
              <tr>
                <th className="p-5 font-medium">Username</th>
                <th className="p-5 font-medium">Role</th>
                <th className="p-5 font-medium">Status</th>
                <th className="p-5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  <td className="p-5 font-medium text-gray-900">
                    {user.username}
                    {user.username === currentUser && <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">You</span>}
                  </td>
                  <td className="p-5">
                    {user.roles.map(role => (
                      <span key={role} className="inline-block bg-blue-50 text-blue-700 border border-blue-100 text-xs px-2 py-1 rounded mr-1">{role}</span>
                    ))}
                  </td>
                  <td className="p-5">
                    {user.isEnabled ? <span className="text-green-600 font-bold text-sm">Active</span> : <span className="text-red-600 font-bold text-sm">Disabled</span>}
                  </td>
                  <td className="p-5 text-right flex justify-end gap-2">
                    
                    {/* KNAPP: SE TODOS */}
                    <button 
                      onClick={() => viewUserTodos(user)}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 text-xs font-bold py-2 px-3 rounded-lg transition"
                    >
                      View Tasks
                    </button>

                    {user.username !== currentUser ? (
                      <button onClick={() => confirmDelete(user)} className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold py-2 px-3 rounded-lg transition">Remove</button>
                    ) : (
                      <span className="text-xs text-gray-400 italic py-2 px-3">Current</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-8">
           <a href="/dashboard" className="text-gray-500 hover:text-black transition flex items-center gap-2"><span>←</span> Back to Dashboard</a>
        </div>
      </div>

      {/* --- DELETE MODAL --- */}
      {isDeleteModalOpen && userToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete User?</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to remove <span className="font-bold text-black">{userToDelete.username}</span>?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* --- TODO LIST MODAL (NY!) --- */}
      {isTodoModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-0 overflow-hidden max-h-[80vh] flex flex-col">
            
            {/* Header */}
            <div className="bg-slate-800 p-4 flex justify-between items-center">
              <h3 className="text-white font-bold text-lg">Tasks: {selectedUserName}</h3>
              <button onClick={() => setIsTodoModalOpen(false)} className="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
            </div>

            {/* Body (Scrollable) */}
            <div className="p-6 overflow-y-auto">
              {selectedUserTodos.length === 0 ? (
                <p className="text-center text-gray-500 italic">This user has no tasks yet.</p>
              ) : (
                <div className="space-y-3">
                  {selectedUserTodos.map(todo => (
                    <div key={todo.id} className={`p-4 rounded-lg border ${todo.completed ? 'bg-gray-50 border-gray-200 opacity-70' : 'bg-white border-blue-100 shadow-sm'}`}>
                      <div className="flex justify-between items-start">
                        <h4 className={`font-bold ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>{todo.title}</h4>
                        {todo.completed && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Done</span>}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{todo.description}</p>
                      <div className="text-xs text-gray-400 mt-2">Due: {todo.dueDate}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t text-right">
              <button onClick={() => setIsTodoModalOpen(false)} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-medium">Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}