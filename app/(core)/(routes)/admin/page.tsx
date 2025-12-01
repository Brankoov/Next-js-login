"use client"

import { useEffect, useState } from "react"

interface User {
  id: string
  username: string
  isEnabled: boolean
  roles: string[]
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<string>("") // Sparar mitt eget namn
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // State för Modal (Popup)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Hämta vem JAG är (för att inte radera mig själv)
        const meRes = await fetch("http://localhost:8080/user", { credentials: "include" })
        if (meRes.ok) {
          const meData = await meRes.json()
          setCurrentUser(meData.username)
        }

        // 2. Hämta alla användare
        const usersRes = await fetch("http://localhost:8080/admin/users", {
          credentials: "include"
        })

        if (usersRes.status === 401 || usersRes.status === 403) {
          window.location.href = "/login"
          return
        }

        const usersData = await usersRes.json()
        setUsers(usersData)
      } catch (e) {
        setError("Kunde inte hämta data.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Öppna modalen
  const confirmDelete = (user: User) => {
    setUserToDelete(user)
    setIsModalOpen(true)
  }

  // Utför raderingen
  const handleDelete = async () => {
    if (!userToDelete) return

    try {
      const res = await fetch(`http://localhost:8080/admin/users/${userToDelete.id}`, {
        method: "DELETE",
        credentials: "include"
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        alert(body?.error || "Failed to delete")
        setIsModalOpen(false)
        return
      }

      // Uppdatera listan
      setUsers(users.filter(u => u.id !== userToDelete.id))
      setIsModalOpen(false)
      setUserToDelete(null)

    } catch (e) {
      alert("Network error")
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading admin panel...</div>
  if (error) return <div className="p-8 text-red-500 text-center">{error}</div>

  return (
    <div className="min-h-screen bg-gray-50 p-8 relative">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <div className="text-sm text-gray-500">
            Logged in as: <span className="font-bold text-gray-800">{currentUser}</span>
          </div>
        </div>
        
        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
          <div className="p-5 border-b bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-700">User Management</h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
              {users.length} Users
            </span>
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
                <tr key={user.id} className="hover:bg-gray-50 transition duration-150">
                  <td className="p-5 font-medium text-gray-900">
                    {user.username}
                    {user.username === currentUser && (
                      <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">You</span>
                    )}
                  </td>
                  <td className="p-5">
                    {user.roles.map(role => (
                      <span key={role} className="inline-block bg-blue-50 text-blue-700 border border-blue-100 text-xs px-2 py-1 rounded mr-1">
                        {role}
                      </span>
                    ))}
                  </td>
                  <td className="p-5">
                    {user.isEnabled ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Disabled
                      </span>
                    )}
                  </td>
                  <td className="p-5 text-right">
                    {/* Visa bara delete-knappen om det INTE är jag själv */}
                    {user.username !== currentUser ? (
                      <button 
                        onClick={() => confirmDelete(user)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold py-2 px-4 rounded-lg transition"
                      >
                        Remove
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400 italic pr-2">Current User</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {users.length === 0 && (
            <div className="p-10 text-center text-gray-400">No users found in the database.</div>
          )}
        </div>
        
        <div className="mt-8">
           <a href="/dashboard" className="text-gray-500 hover:text-black transition flex items-center gap-2">
             <span>←</span> Back to Dashboard
           </a>
        </div>
      </div>

      {/* --- CUSTOM MODAL --- */}
      {isModalOpen && userToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all scale-100">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete User?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove <span className="font-bold text-black">{userToDelete.username}</span>? 
              This action cannot be undone.
            </p>
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow-md transition"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}