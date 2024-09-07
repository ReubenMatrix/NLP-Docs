import React from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from '@/components/ui/button'; 
import { useRouter } from 'next/navigation';

function Account() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter()

  console.log(user)

  const handleLogout = () => {
    router.push('/')
    signOut();
    
  };

  return (
    <div>
      {user && (
        <Popover>
          <PopoverTrigger>
            <img
              loading='lazy'
              className='cursor-pointer bg-gray-500 h-12 w-12 rounded-full ml-2'
              src={user.imageUrl} 
              alt='User profile'
            />
          </PopoverTrigger>
          <PopoverContent className='p-4  bg-gray-500'>
            <p className='mb-1 font-bold text-white'>Your Account</p>
            <p className='mb-1 text-sm text-white'>{user.fullName}</p>
            <p className='mb-2 text-sm text-white'>{user.primaryEmailAddress?.emailAddress}</p>
            <Button className="w-full" onClick={handleLogout}>Logout</Button>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

export default Account;
