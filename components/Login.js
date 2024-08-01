import { FilePlusIcon } from 'lucide-react'
import React from 'react'
import { Button } from './ui/button'
import { signIn } from 'next-auth/react'

function Login() {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen py-2'>
       <FilePlusIcon size={"100"} />
       <Button onClick={signIn}>
        Sign In
       </Button>
      
    </div>
  )
}

export default Login
