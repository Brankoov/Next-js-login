"use client"

import Link from "next/link"
import { Button } from "@/app/_components/button.component"

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-bold">Admin-IT</h1>
      <p className="text-gray-600">Välj vad du vill göra</p>

      <div className="flex gap-4">
        <Link href="/login">
          <Button name="Login" />
        </Link>

        <Link href="/register">
          <Button name="Register" />
        </Link>
      </div>
    </main>
  )
}
