import React from 'react'
import { getInterviewById } from '@/app/lib/actions/firebase.actions'
import Agent from '@/components/Agent'
import { checkUser } from '@/lib/checkUser'

const InterviewDetailsPage = async ({ params }) => {
  const parameters = await params;
  const interview = await getInterviewById(parameters?.id)
  const user = await checkUser();

  if (!interview) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-xl text-white/80">Interview not found</p>
        </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="bg-black border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative">
        
        {/* Header Section */}
        <div className="bg-black p-6 rounded-t-2xl border-b border-white/10">
        <h1 className="text-3xl font-bold text-white">
          {interview.role.replace(/\b\w/g, char => char.toUpperCase())}
        </h1>
        <p className="text-white/70 mt-2 flex items-center">
          <span className="inline-block w-3 h-3 rounded-full bg-white/30 mr-2"></span>
          Created: {new Date(interview.createdAt).toLocaleDateString()}
        </p>
      </div>

        {/* Content Section */}
        <div className="p-6 space-y-8 relative z-10">
          {/* Interview Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 bg-white/5 p-4 rounded-xl backdrop-blur-sm">
              <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider">Interview Type</h2>
              <p className="text-xl text-white">{interview.type.replace(/\b\w/g, char => char.toUpperCase())}</p>
            </div>
            <div className="space-y-2 bg-white/5 p-4 rounded-xl backdrop-blur-sm">
              <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider">Experience Level</h2>
              <p className="text-xl text-white">{interview.level.replace(/\b\w/g, char => char.toUpperCase())}</p>
            </div>
          </div>
          
          {/* Agent Component */}
          <Agent
            type="interview"
            username={user?.name}
            interviewId={parameters.id}
            questions={interview.questions}
          />
        </div>
      </div>
    </div>
  )
}

export default InterviewDetailsPage