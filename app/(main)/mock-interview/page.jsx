import Agent from '@/components/Agent'
import { checkUser } from '@/lib/checkUser';
import React from 'react'

const MockInterview = async() => {
  const user=await checkUser();
  if (!user) return <div>Not signed in</div>

  return (
    <div className=''>
      <Agent username={user?.name} userId={user?.id} type="generate"/>
      
    </div>
  )
}

export default MockInterview