import React from 'react'

const page = ({params}) => {
    const feedback = getFeedbackById(params.id)
    if (!feedback) {
        return (
          <div className="flex items-center justify-center min-h-[60vh]">
            <p className="text-xl text-gray-600">Feedback not found</p>
          </div>
        )
      }
  return (
    <div>
        <h1>Feedback</h1>
        <p>Feedback for interview {params.id}</p>
        <p>{feedback}</p>

    </div>
  )
}

export default page