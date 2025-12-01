"use client"

import { useEffect, useState } from "react"

// Definiera hur en Todo ser ut (matchar Java DTO)
interface Todo {
  id: string
  title: string
  description: string
  dueDate: string
  createdDate: string
}

export default function DashboardPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State för formuläret
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")

  // --- 1. HÄMTA TODOS ---
  useEffect(() => {
    const loadTodos = async () => {
      try {
        const res = await fetch("http://localhost:8080/todos", {
          credentials: "include" // Viktigt för JWT
        })

        if (res.status === 401 || res.status === 403) {
          window.location.href = "/login"
          return
        }

        const data = await res.json()
        setTodos(data)
      } catch (e) {
        setError("Kunde inte hämta todos.")
      } finally {
        setLoading(false)
      }
    }
    loadTodos()
  }, [])

  // --- 2. SKAPA TODO ---
  const createTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title || !dueDate) {
      alert("Titel och Datum krävs!")
      return
    }

    try {
      const res = await fetch("http://localhost:8080/todos", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            title, 
            description, 
            dueDate 
        }),
      })

      if (res.ok) {
        const newTodo = await res.json()
        setTodos([newTodo, ...todos]) // Lägg till den nya överst i listan
        // Rensa formulär
        setTitle("")
        setDescription("")
        setDueDate("")
      } else {
        alert("Något gick fel vid sparandet.")
      }
    } catch (e) {
      alert("Kunde inte nå servern.")
    }
  }

  // --- 3. TA BORT TODO ---
  const deleteTodo = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8080/todos/${id}`, {
        method: "DELETE",
        credentials: "include"
      })

      if (res.ok) {
        setTodos(todos.filter(t => t.id !== id)) // Ta bort från listan direkt
      }
    } catch (e) {
      alert("Kunde inte radera.")
    }
  }

  // --- LOGOUT ---
  const logout = async () => {
    await fetch("http://localhost:8080/logout", { method: "POST", credentials: "include" })
    window.location.href = "/login"
  }

  if (loading) return <div className="p-8 text-center">Laddar dina uppgifter...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Dashboard</h1>
            <p className="text-gray-500">Manage your tasks efficiently</p>
          </div>
          <div className="flex gap-4">
            <a href="/admin" className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium transition">
              Admin Panel
            </a>
            <button onClick={logout} className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg font-medium transition border border-red-100">
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* VÄNSTER: FORMULÄR */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 sticky top-8">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Create New Todo</h2>
              
              <form onSubmit={createTodo} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
                  <input 
                    type="text" 
                    placeholder="E.g. Gå och handla"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded text-black focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                  <textarea 
                    placeholder="E.g. Mjölk, ägg, kaffe..."
                    rows={3}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded text-black focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Due Date</label>
                  <input 
                    type="date" 
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded text-black focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition mt-2 shadow-md">
                  + Add Todo
                </button>
              </form>
            </div>
          </div>

          {/* HÖGER: LISTA */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
              Your Tasks <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{todos.length}</span>
            </h2>

            {todos.length === 0 ? (
              // TOMT LÄGE
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-lg font-bold text-gray-700">Inga todos skapade ännu</h3>
                <p className="text-gray-500">Använd formuläret till vänster för att skapa din första uppgift!</p>
              </div>
            ) : (
              // LISTA MED KORT
              <div className="space-y-4">
                {todos.map(todo => (
                  <div key={todo.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition group">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{todo.title}</h3>
                        <p className="text-gray-600 mt-1">{todo.description}</p>
                        
                        <div className="flex gap-4 mt-4 text-xs font-medium text-gray-400">
                          <span className="flex items-center gap-1">
                            📅 Due: <span className="text-blue-600">{todo.dueDate}</span>
                          </span>
                          <span>Created: {new Date(todo.createdDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => deleteTodo(todo.id)}
                        className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition opacity-0 group-hover:opacity-100"
                        title="Delete task"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}