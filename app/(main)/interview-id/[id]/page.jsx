import React from 'react'
import { getInterviewById } from '@/app/lib/actions/firebase.actions'
import Agent from '@/components/Agent'
import { checkUser } from '@/lib/checkUser'

const InterviewDetailsPage = async ({ params }) => {
  const interview = await getInterviewById(params.id)
  const user=await checkUser();

  if (!interview) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-xl text-gray-600">Interview not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white/10 backdrop-blur-lg rounded-lg shadow-xl border border-gray-200/20">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-6 rounded-t-lg">
          <h1 className="text-3xl font-bold">{interview.role}</h1>
          <p className="text-gray-400 mt-2">
            Created: {new Date(interview.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-8">
          {/* Interview Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-gray-400">Interview Type</h2>
              <p className="text-xl">{interview.type}</p>
            </div>
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-gray-400">Experience Level</h2>
              <p className="text-xl">{interview.level}</p>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-gray-400">Tech Stack</h2>
            <div className="flex flex-wrap gap-2">
              {interview.techstack.map((tech, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
          <Agent
          type="interview"
          username={user?.name}
          interviewId={params.id}
          questions={interview.questions}
          />
        </div>
      </div>
    </div>
  )
}

export default InterviewDetailsPage