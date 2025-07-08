import React from "react"


export default function ChatMessage({ role, content }) {
  const isUser = role === 'user'
  return (
    <div className={`my-2 p-3 rounded-lg ${isUser ? 'bg-blue-100 text-right' : 'bg-gray-200 text-left'}`}>
      <span className="font-bold">{isUser ? 'You' : 'IA'}:</span> {content}
    </div>
  )
}
