"use client"

import { useEffect, useState } from "react"
import { Button } from "@/app/_components/button.component"

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("http://localhost:8080/user", {
          credentials: "include"
        })

        if (res.status === 401 || res.status === 403) {
          window.location.href = "/login"
          return
        }

        const json = await res.json()
        setData(json)
      } catch (e) {
        setError("Failed to load user data")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const logout = async () => {
    await fetch("http://localhost:8080/logout", {
      method: "POST",
      credentials: "include"
    })

    window.location.href = "/login"
  }

  if (loading) {
    return <div>Loading dashboard...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  return (
    <div style={{ padding: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
        <h1>Dashboard</h1>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button
            name="Admin"
            onClick={() => (window.location.href = "/admin")}
          />
          <Button
            name="Logout"
            onClick={logout}
          />
        </div>
      </div>

      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
