"use client"

import { useState } from "react"
import Link from "next/link"

export default function RegisterPage() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("") // NY STATE
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch("http://localhost:8080/register", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        // SKICKA MED EMAIL
        body: JSON.stringify({ username, email, password }),
      })

      if (!res.ok) {
        let body: any = null
        try { body = await res.json() } catch {}
        setError(body?.error || "Registration failed")
        return
      }

      setSuccess(true)
    } catch (err) {
      setError("Network error: backend unreachable")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm border border-slate-200">
        <h1 className="text-3xl font-extrabold mb-6 text-slate-800 text-center">Create Account</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Username</label>
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-slate-300 p-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-green-500 transition" />
          </div>

          {/* NYTT INPUT FÄLT FÖR EMAIL */}
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Email</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-300 p-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-green-500 transition" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Password</label>
            <input type="password" placeholder="Strong password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-300 p-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-green-500 transition" />
            <p className="text-xs text-slate-400 mt-1 ml-1">Must contain Upper, Lower, Number & Symbol</p>
          </div>

          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition duration-200 shadow-md">
            Register
          </button>
        </form>

        <div className="mt-4">
            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200 text-center font-medium">⚠️ {error}</div>}
            {success && <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg border border-green-200 text-center font-medium">✅ Account created! <Link href="/login" className="underline font-bold">Go to Login</Link></div>}
        </div>
        
        <div className="text-center mt-4 text-sm text-slate-500">
            Already have an account? <Link href="/login" className="text-blue-600 font-bold hover:underline">Log in</Link>
        </div>
      </div>
    </div>
  )
}