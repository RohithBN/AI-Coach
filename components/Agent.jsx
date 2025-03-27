import React from 'react'

const Agent = ({username}) => {
    const isSpeaking = true
  return (
    <div className='flex flex-row justify-between items-center gap-8 p-6 max-w-6xl mx-auto'>
      {/* AI Agent Side */}
      <div className={`flex flex-col items-center w-1/2 transition-all duration-300 ${isSpeaking ? 'scale-105' : ''}`}>
        <div className={`relative w-80 h-80 rounded-2xl shadow-lg overflow-hidden ${isSpeaking ? 'animate-pulse' : ''}`}>
          <img 
            src='https://img.freepik.com/premium-photo/friendly-looking-ai-agent-as-logo-white-background-style-raw-job-id-ef2c5ef7e19b4dadbef969fcb37e_343960-103720.jpg' 
            alt="AI Agent"
            className='w-full h-full object-cover'
          />
          <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900/70 p-4'>
            <p className='text-white font-semibold text-center'>AI Career Coach</p>
          </div>
        </div>
      </div>

      {/* User Side */}
      <div className='flex flex-col items-center w-1/2'>
        <div className='w-80 h-80 rounded-2xl shadow-lg overflow-hidden'>
          <img 
            src='https://cdn-icons-png.flaticon.com/512/1077/1077114.png' 
            alt="User"
            className='w-full h-full object-cover bg-gray-100'
          />
          <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900/70 p-4'>
            <p className='text-white font-semibold text-center'>{username || 'User'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Agent