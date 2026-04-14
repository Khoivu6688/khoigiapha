"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LandingOverlay() {
  const [show, setShow] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const seen = localStorage.getItem("seenLanding")
    if (seen) setShow(false)
  }, [])

  if (!show) return null

  return (
    <div className="landing-overlay">
      <div className="landing-content">

        <button 
          className="btn-primary"
          onClick={() => {
            localStorage.setItem("seenLanding", "true")
            setShow(false)
          }}
        >
          Xem gia phả
        </button>

        <button 
          className="btn-secondary"
          onClick={() => router.push("/login")}
        >
          Đăng nhập
        </button>

      </div>
    </div>
  )
}
