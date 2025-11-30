"use client"

import { useEffect, useState } from "react"

// Definiera hur en användare ser ut (matchar vår Java DTO)
interface User {
  id: string
  username: string
  isEnabled: boolean
  roles: string[]
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]) // Lista med användare
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUsers = async () => {
      try {
        // Hämta data från vår nya endpoint
        const res = await fetch("http://localhost:8080/admin/users", {
          credentials: "include" // Viktigt för att skicka med Cookies (JWT)
        })

        if (res.status === 401 || res.status === 403) {
          window.location.href = "/login"
          return
        }

        const data = await res.json()
        setUsers(data)
      } catch (e) {
        setError("Kunde inte hämta användare.")
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [])

  if (loading) return <div className="p-8">Laddar adminpanel...</div>
  if (error) return <div className="p-8 text-red-500">{error}</div>

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-4 border-b bg-gray-100">
            <h2 className="text-xl font-semibold">Registrerade Användare</h2>
          </div>

          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-sm font-medium text-gray-500">Username</th>
                <th className="p-4 text-sm font-medium text-gray-500">ID</th>
                <th className="p-4 text-sm font-medium text-gray-500">Roles</th>
                <th className="p-4 text-sm font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-medium text-gray-900">{user.username}</td>
                  <td className="p-4 text-xs text-gray-400 font-mono">{user.id}</td>
                  <td className="p-4">
                    {user.roles.map(role => (
                      <span key={role} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1">
                        {role}
                      </span>
                    ))}
                  </td>
                  <td className="p-4">
                    {user.isEnabled ? (
                      <span className="text-green-600 font-bold text-sm">Active</span>
                    ) : (
                      <span className="text-red-600 font-bold text-sm">Disabled</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {users.length === 0 && (
            <div className="p-8 text-center text-gray-500">Inga användare hittades.</div>
          )}
        </div>
        
        <div className="mt-6">
           <a href="/dashboard" className="text-blue-600 hover:underline">← Tillbaka till Dashboard</a>
        </div>
      </div>
    </div>
  )
}