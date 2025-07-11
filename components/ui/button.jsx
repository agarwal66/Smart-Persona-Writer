// components/ui/button.jsx
import React from "react"
import { cn } from "@/lib/utils"

const Button = ({ className, type = "button", ...props }) => {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition",
        className
      )}
      {...props}
    />
  )
}

export { Button }
