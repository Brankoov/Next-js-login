"use client"

import { useEffect, useState } from "react"

interface User {
  id: string
  username: string
  isEnabled: boolean
  roles: string[]
}

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
  
  // State för Sökning
  const [searchTerm, setSearchTerm] = useState("")

  // State för Modaler
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [userToToggle, setUserToToggle] = useState<User | null>(null)
  const [isTodoModalOpen, setIsTodoModalOpen] = useState(false)
  const [selectedUserTodos, setSelectedUserTodos] = useState<Todo[]>([])
  const [selectedUserName, setSelectedUserName] = useState("")

  // --- HÄMTA DATA ---
  
  // Vi bröt ut hämta-funktionen så vi kan återanvända den vid sökning
  const fetchUsers = async (search = "") => {
    setLoading(true)
    try {
      // Bygg URL:en. Lägg till ?search=om det finns en sökterm
      let url = "http://localhost:8080/admin/users"
      if (search) url += `?search=${encodeURIComponent(search)}`

      const res = await fetch(url, { credentials: "include" })
      
      if (res.status === 401 || res.status === 403) {
        window.location.href = "/login"
        return
      }
      
      const data = await res.json()
      setUsers(data)
    } catch (e) {
      setError("Could not load users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      // 1. Hämta Current User
      try {
        const meRes = await fetch("http://localhost:8080/user", { credentials: "include" })
        if (meRes.ok) {
          const meData = await meRes.json()
          setCurrentUser(meData.username)
        }
      } catch {}

      // 2. Hämta alla users (tom sökning)
      await fetchUsers()
    }
    init()
  }, [])

  // Hantera sök-knapp eller Enter
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchUsers(searchTerm)
  }

  // --- STATUS TOGGLE ---
  const openStatusModal = (user: User) => {
    setUserToToggle(user)
    setIsStatusModalOpen(true)
  }

  const handleStatusChange = async () => {
    if (!userToToggle) return
    const newStatus = !userToToggle.isEnabled
    try {
      const res = await fetch(`http://localhost:8080/admin/users/${userToToggle.id}/status?enabled=${newStatus}`, {
        method: "PUT", credentials: "include"
      })
      if (!res.ok) { alert("Failed"); return }
      
      // Uppdatera listan lokalt
      setUsers(users.map(u => u.id === userToToggle.id ? { ...u, isEnabled: newStatus } : u))
      setIsStatusModalOpen(false)
      setUserToToggle(null)
    } catch (e) { alert("Network error") }
  }

  // --- DELETE ---
  const confirmDelete = (user: User) => { setUserToDelete(user); setIsDeleteModalOpen(true) }
  
  const handleDelete = async () => {
    if (!userToDelete) return
    try {
      const res = await fetch(`http://localhost:8080/admin/users/${userToDelete.id}`, { method: "DELETE", credentials: "include" })
      if (!res.ok) return alert("Failed")
      setUsers(users.filter(u => u.id !== userToDelete.id))
      setIsDeleteModalOpen(false)
    } catch (e) { alert("Network error") }
  }

  // --- TODOS ---
  const viewUserTodos = async (user: User) => {
    try {
      const res = await fetch(`http://localhost:8080/admin/users/${user.id}/todos`, { credentials: "include" })
      if (res.ok) {
        const todos = await res.json()
        setSelectedUserTodos(todos)
        setSelectedUserName(user.username)
        setIsTodoModalOpen(true)
      }
    } catch (e) { alert("Error") }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 relative">
      <div className="max-w-6xl mx-auto">
        
        {/* Header med Sökfält */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <div className="text-sm text-gray-500">Logged in as: <span className="font-bold text-gray-800">{currentUser}</span></div>
          </div>

          {/* SÖKFÄLT */}
          <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
            <input 
              type="text" 
              placeholder="Search username..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-64 focus:ring-2 focus:ring-blue-500 outline-none text-black"
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">
              Search
            </button>
            {searchTerm && (
              <button 
                type="button" 
                onClick={() => { setSearchTerm(""); fetchUsers("") }} 
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-lg"
              >
                Reset
              </button>
            )}
          </form>
        </div>
        
        {/* Tabell */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
          <div className="p-5 border-b bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-700">User Management</h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">{users.length} found</span>
          </div>

          {loading ? (
             <div className="p-10 text-center text-gray-500">Searching...</div>
          ) : (
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
                {users.length > 0 ? users.map((user) => (
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
                      <div className="flex items-center gap-3">
                        {user.isEnabled ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Disabled</span>
                        )}
                        {user.username !== currentUser && (
                          <button onClick={() => openStatusModal(user)} className={`text-xs font-bold px-2 py-1 rounded border transition ${user.isEnabled ? "border-red-200 text-red-600 hover:bg-red-50" : "border-green-200 text-green-600 hover:bg-green-50"}`}>
                            {user.isEnabled ? "Disable" : "Enable"}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-5 text-right flex justify-end gap-2">
                      <button onClick={() => viewUserTodos(user)} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 text-xs font-bold py-2 px-3 rounded-lg transition">View Tasks</button>
                      {user.username !== currentUser ? (
                        <button onClick={() => confirmDelete(user)} className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold py-2 px-3 rounded-lg transition">Remove</button>
                      ) : <span className="text-xs text-gray-400 italic py-2 px-3">Current</span>}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="p-10 text-center text-gray-400">No users found matching "{searchTerm}"</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        
        <div className="mt-8">
           <a href="/dashboard" className="text-gray-500 hover:text-black transition flex items-center gap-2"><span>←</span> Back to Dashboard</a>
        </div>
      </div>

      {/* --- MODALS (Delete, Status, Todo) --- */}
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

      {isStatusModalOpen && userToToggle && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{userToToggle.isEnabled ? "Disable User?" : "Activate User?"}</h3>
            <p className="text-gray-600 mb-6">Change status for <span className="font-bold text-black">{userToToggle.username}</span>?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsStatusModalOpen(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg">Cancel</button>
              <button onClick={handleStatusChange} className={`px-4 py-2 text-white rounded-lg font-bold shadow-md transition ${userToToggle.isEnabled ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}>
                {userToToggle.isEnabled ? "Yes, Disable" : "Yes, Activate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isTodoModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-0 overflow-hidden max-h-[80vh] flex flex-col">
            <div className="bg-slate-800 p-4 flex justify-between items-center">
              <h3 className="text-white font-bold text-lg">Tasks: {selectedUserName}</h3>
              <button onClick={() => setIsTodoModalOpen(false)} className="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6 overflow-y-auto">
              {selectedUserTodos.length === 0 ? <p className="text-center text-gray-500 italic">No tasks found.</p> : (
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
            <div className="p-4 bg-gray-50 border-t text-right">
              <button onClick={() => setIsTodoModalOpen(false)} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-medium">Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}