import { useState } from 'react'
import ChatMessage from './components/ChatMessage'
import TypingIndicator from './components/TypingIndicator'
import React from 'react'

export default function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    try {
      const response = await fetch('http://127.0.0.1:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: input,
          conversation_id: 'test-session-001'
        })
      })

      if (!response.ok || !response.body) {
        throw new Error('Invalid response from server')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let partial = ''

      let aiContent = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        partial += decoder.decode(value, { stream: true })

        const lines = partial.split('\n')
        partial = lines.pop() // Save incomplete line for next chunk

        for (const line of lines) {
          if (line.startsWith('data:')) {
            const jsonStr = line.replace('data: ', '')
            try {
              const parsed = JSON.parse(jsonStr)

              aiContent += parsed.content || ''

              setMessages(prev => {
                const last = prev[prev.length - 1]
                if (last?.role === 'ai') {
                  return [...prev.slice(0, -1), { role: 'ai', content: aiContent }]
                } else {
                  return [...prev, { role: 'ai', content: aiContent }]
                }
              })
            } catch (err) {
              console.error('Invalid JSON in SSE:', jsonStr)
            }
          }
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Server error: could not get a response.' }])
      console.error('Fetch error:', error)
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter') sendMessage()
  }

  const clearChat = () => {
    setMessages([])
    setInput('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
      <div className="bg-white shadow-md rounded-lg w-full max-w-2xl p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">🤖 Chatbot</h1>

        <div className="border rounded-md h-96 overflow-y-auto p-4 bg-gray-50 mb-4">
          {messages.map((msg, idx) => (
            <ChatMessage key={idx} role={msg.role} content={msg.content} />
          ))}
          {isTyping && <TypingIndicator />}
        </div>

        <div className="flex gap-2">
          <input
            className="flex-1 border px-4 py-2 rounded-md"
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
            onClick={sendMessage}
          >
            Send
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded-md"
            onClick={clearChat}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  )
}



// import { useState } from 'react'
// import ChatMessage from './components/ChatMessage'
// import TypingIndicator from './components/TypingIndicator'
// import React from "react"

// export default function App() {
//   const [messages, setMessages] = useState([])
//   const [input, setInput] = useState('')
//   const [isTyping, setIsTyping] = useState(false)

//   const sendMessage = async () => {
//     if (!input.trim()) return

//     // Add user message to the chat
//     const userMessage = { role: 'user', content: input }
//     setMessages(prev => [...prev, userMessage])
//     setInput('')
//     setIsTyping(true)

//     try {
//       // Send POST request to backend
//       const response = await fetch('http://127.0.0.1:8000/chat', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           message: input,
//           conversation_id: 'test-session-001'
//         })
//       })

//       if (!response.ok) {
//         throw new Error('Request failed')
//       }

//       const data = await response.json()

//       // Add AI response to the chat
//       const aiMessage = { role: 'ai', content: data.content }
//       setMessages(prev => [...prev, aiMessage])
//     } catch (error) {
//       // Show fallback error message
//       setMessages(prev => [...prev, { role: 'ai', content: 'Server error: could not get a response.' }])
//       console.error(error)
//     } finally {
//       setIsTyping(false)
//     }
//   }

//   const handleKeyDown = e => {
//     if (e.key === 'Enter') sendMessage()
//   }

//   const clearChat = () => {
//     setMessages([])
//     setInput('')
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
//       <div className="bg-white shadow-md rounded-lg w-full max-w-2xl p-6">
//         <h1 className="text-2xl font-bold mb-4 text-center">🤖 Chatbot</h1>

//         {/* Chat messages */}
//         <div className="border rounded-md h-96 overflow-y-auto p-4 bg-gray-50 mb-4">
//           {messages.map((msg, idx) => (
//             <ChatMessage key={idx} role={msg.role} content={msg.content} />
//           ))}
//           {isTyping && <TypingIndicator />}
//         </div>

//         {/* Input and action buttons */}
//         <div className="flex gap-2">
//           <input
//             className="flex-1 border px-4 py-2 rounded-md"
//             type="text"
//             placeholder="Type a message..."
//             value={input}
//             onChange={e => setInput(e.target.value)}
//             onKeyDown={handleKeyDown}
//           />
//           <button
//             className="bg-blue-500 text-white px-4 py-2 rounded-md"
//             onClick={sendMessage}
//           >
//             Send
//           </button>
//           <button
//             className="bg-red-500 text-white px-4 py-2 rounded-md"
//             onClick={clearChat}
//           >
//             Clear
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }




// // import { useState } from 'react'
// // import ChatMessage from './components/ChatMessage'
// // import TypingIndicator from './components/TypingIndicator'
// // import React from "react"
 
// // export default function App() {
// //   const [messages, setMessages] = useState([])
// //   const [input, setInput] = useState('')
// //   const [isTyping, setIsTyping] = useState(false)

// //   const sendMessage = async () => {
// //     if (!input.trim()) return

// //     const userMessage = { role: 'user', content: input }
// //     setMessages(prev => [...prev, userMessage])
// //     setInput('')
// //     setIsTyping(true)

// //     // Simulación de respuesta de IA con streaming
// //     const simulated = 'Esta es una respuesta simulada por IA.'
// //     let current = ''
// //     for (let i = 0; i < simulated.length; i++) {
// //       await new Promise(res => setTimeout(res, 30))
// //       current += simulated[i]
// //       setMessages(prev => {
// //         const last = prev[prev.length - 1]
// //         if (last?.role === 'ai') {
// //           return [...prev.slice(0, -1), { role: 'ai', content: current }]
// //         } else {
// //           return [...prev, { role: 'ai', content: current }]
// //         }
// //       })
// //     }

// //     setIsTyping(false)
// //   }

// //   const handleKeyDown = e => {
// //     if (e.key === 'Enter') sendMessage()
// //   }

// //   const clearChat = () => {
// //     setMessages([])
// //     setInput('')
// //   }

// //   return (
// //     <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
// //       <div className="bg-white shadow-md rounded-lg w-full max-w-2xl p-6">
// //         <h1 className="text-2xl font-bold mb-4 text-center">🤖 Chatbot</h1>

// //         <div className="border rounded-md h-96 overflow-y-auto p-4 bg-gray-50 mb-4">
// //           {messages.map((msg, idx) => (
// //             <ChatMessage key={idx} role={msg.role} content={msg.content} />
// //           ))}
// //           {isTyping && <TypingIndicator />}
// //         </div>

// //         <div className="flex gap-2">
// //           <input
// //             className="flex-1 border px-4 py-2 rounded-md"
// //             type="text"
// //             placeholder="Escribe un mensaje..."
// //             value={input}
// //             onChange={e => setInput(e.target.value)}
// //             onKeyDown={handleKeyDown}
// //           />
// //           <button
// //             className="bg-blue-500 text-white px-4 py-2 rounded-md"
// //             onClick={sendMessage}
// //           >
// //             Enviar
// //           </button>
// //           <button
// //             className="bg-red-500 text-white px-4 py-2 rounded-md"
// //             onClick={clearChat}
// //           >
// //             Limpiar
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   )
// // }
