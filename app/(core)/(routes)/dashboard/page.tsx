"use client"

import { useEffect, useState } from "react"

// Typer
interface Todo {
  id: string
  title: string
  description: string
  dueDate: string
  createdDate: string
  completed: boolean
}

interface Authority {
  authority: string
}

export default function DashboardPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false) // För att styra knappen
  const [username, setUsername] = useState("")

  // State för formulär (Skapa)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")

  // State för flikar
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active")

  // State för Redigering (Modal)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)

  // --- HÄMTA DATA ---
  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Hämta User info (för att kolla Admin-roll)
        const userRes = await fetch("http://localhost:8080/user", { credentials: "include" })
        if (userRes.ok) {
          const userData = await userRes.json()
          setUsername(userData.username)
          // Kolla om listan med authorities innehåller ROLE_ADMIN
          const hasAdminRole = userData.authorities.some((a: Authority) => a.authority === "ROLE_ADMIN")
          setIsAdmin(hasAdminRole)
        } else if (userRes.status === 401 || userRes.status === 403) {
          window.location.href = "/login"
          return
        }

        // 2. Hämta Todos
        const todoRes = await fetch("http://localhost:8080/todos", { credentials: "include" })
        if (todoRes.ok) {
          const todoData = await todoRes.json()
          setTodos(todoData)
        }
      } catch (e) {
        console.error("Nätverksfel")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // --- SKAPA ---
  const createTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !dueDate) return alert("Titel och datum krävs!")

    try {
      const res = await fetch("http://localhost:8080/todos", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, dueDate, completed: false }),
      })

      if (res.ok) {
        const newTodo = await res.json()
        setTodos([newTodo, ...todos])
        setTitle(""); setDescription(""); setDueDate("")
      }
    } catch (e) { alert("Kunde inte spara.") }
  }

  // --- UPPDATERA (Markera klar ELLER Redigera text) ---
  const updateTodo = async (todo: Todo) => {
    try {
      const res = await fetch(`http://localhost:8080/todos/${todo.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: todo.title,
          description: todo.description,
          dueDate: todo.dueDate,
          completed: todo.completed 
        }),
      })

      if (res.ok) {
        const updated = await res.json()
        // Uppdatera listan lokalt
        setTodos(todos.map(t => (t.id === updated.id ? updated : t)))
        setIsEditOpen(false) // Stäng modal om den var öppen
        setEditingTodo(null)
      }
    } catch (e) { alert("Kunde inte uppdatera.") }
  }

  // --- TA BORT ---
  const deleteTodo = async (id: string) => {
    if(!confirm("Ta bort denna uppgift?")) return
    try {
      const res = await fetch(`http://localhost:8080/todos/${id}`, { method: "DELETE", credentials: "include" })
      if (res.ok) setTodos(todos.filter(t => t.id !== id))
    } catch (e) { alert("Kunde inte ta bort.") }
  }

  // --- LOGOUT ---
  const logout = async () => {
    await fetch("http://localhost:8080/logout", { method: "POST", credentials: "include" })
    window.location.href = "/login"
  }

  // Filtrera listan baserat på flik
  const filteredTodos = todos.filter(t => activeTab === "active" ? !t.completed : t.completed)

  if (loading) return <div className="p-10 text-center">Laddar...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Hej, {username} 👋</h1>
            <p className="text-gray-500">Här är dina uppgifter</p>
          </div>
          <div className="flex gap-3">
            {/* VISA BARA FÖR ADMIN */}
            {isAdmin && (
              <a href="/admin" className="bg-slate-800 hover:bg-black text-white px-4 py-2 rounded-lg font-medium transition shadow-md">
                👑 Admin Panel
              </a>
            )}
            <button onClick={logout} className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg font-medium border border-red-100 transition">
              Logga ut
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* VÄNSTER: SKAPA NY */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 sticky top-8">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Ny Uppgift</h2>
              <form onSubmit={createTodo} className="flex flex-col gap-4">
                <input type="text" placeholder="Titel (t.ex. Handla)" value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded text-black focus:ring-2 focus:ring-blue-500 outline-none" />
                <textarea placeholder="Beskrivning..." rows={3} value={description} onChange={e => setDescription(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded text-black focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded text-black focus:ring-2 focus:ring-blue-500 outline-none" />
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg shadow-md transition">
                  + Lägg till
                </button>
              </form>
            </div>
          </div>

          {/* HÖGER: LISTA */}
          <div className="lg:col-span-2">
            
            {/* FLIKAR */}
            <div className="flex gap-4 mb-6 border-b border-gray-200">
              <button 
                onClick={() => setActiveTab("active")}
                className={`pb-2 px-1 font-semibold transition ${activeTab === "active" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-400 hover:text-gray-600"}`}
              >
                Aktiva ({todos.filter(t => !t.completed).length})
              </button>
              <button 
                onClick={() => setActiveTab("completed")}
                className={`pb-2 px-1 font-semibold transition ${activeTab === "completed" ? "text-green-600 border-b-2 border-green-600" : "text-gray-400 hover:text-gray-600"}`}
              >
                Avklarade ({todos.filter(t => t.completed).length})
              </button>
            </div>

            {/* LISTAN */}
            <div className="space-y-4">
              {filteredTodos.length === 0 && (
                <div className="text-center p-12 bg-white rounded-xl border border-dashed border-gray-300">
                  <p className="text-gray-500 font-medium">Inga {activeTab === "active" ? "aktiva" : "avklarade"} uppgifter just nu.</p>
                </div>
              )}

              {filteredTodos.map(todo => (
                <div key={todo.id} className={`bg-white p-5 rounded-xl shadow-sm border transition group ${todo.completed ? 'bg-gray-50 border-gray-100' : 'border-gray-200 hover:shadow-md'}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      {/* CHECKBOX */}
                      <button 
                        onClick={() => updateTodo({ ...todo, completed: !todo.completed })}
                        className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${todo.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-blue-500 text-transparent'}`}
                      >
                        ✓
                      </button>
                      
                      <div>
                        <h3 className={`text-lg font-bold ${todo.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                          {todo.title}
                        </h3>
                        <p className={`text-gray-600 mt-1 ${todo.completed ? 'text-gray-400 line-through' : ''}`}>
                          {todo.description}
                        </p>
                        <div className="flex gap-4 mt-3 text-xs font-medium text-gray-400">
                          <span className={`${todo.completed ? '' : 'text-blue-600'}`}>📅 {todo.dueDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => { setEditingTodo(todo); setIsEditOpen(true) }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">✏️</button>
                      <button onClick={() => deleteTodo(todo.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">🗑️</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- REDIGERA MODAL --- */}
      {isEditOpen && editingTodo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Redigera Uppgift</h3>
            <div className="flex flex-col gap-4">
              <input 
                type="text" 
                value={editingTodo.title} 
                onChange={e => setEditingTodo({...editingTodo, title: e.target.value})}
                className="w-full border border-gray-300 p-2 rounded text-black font-bold"
              />
              <textarea 
                value={editingTodo.description} 
                onChange={e => setEditingTodo({...editingTodo, description: e.target.value})}
                rows={3}
                className="w-full border border-gray-300 p-2 rounded text-black resize-none"
              />
              <input 
                type="date" 
                value={editingTodo.dueDate} 
                onChange={e => setEditingTodo({...editingTodo, dueDate: e.target.value})}
                className="w-full border border-gray-300 p-2 rounded text-black"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button onClick={() => setIsEditOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Avbryt</button>
                <button onClick={() => updateTodo(editingTodo)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Spara</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}