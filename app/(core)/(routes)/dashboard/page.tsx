"use client"

import { useEffect, useState } from "react"

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      const res = await fetch("http://localhost:8080/user", {
        credentials: "include"
      })

      if (res.status === 401 || res.status === 403) {
        window.location.href = "/login"
        return
      }

      const json = await res.json()
      setData(json)
    }

    load()
  }, [])

  return (
    <div>
      <h1>Dashboard</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
