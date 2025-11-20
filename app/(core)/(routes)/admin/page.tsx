"use client"

import { useEffect, useState } from "react"

export default function AdminPage() {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("http://localhost:8080/admin", {
          credentials: "include"
        })

        if (res.status === 401 || res.status === 403) {
          // Inte admin eller inte inloggad → tillbaka till login
          window.location.href = "/login"
          return
        }

        const json = await res.json()
        setData(json)
      } catch (e) {
        setError("Failed to load admin data")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  if (loading) {
    return <div>Loading admin page...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Admin area</h1>
      <p>Only admins should be able to see this.</p>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
