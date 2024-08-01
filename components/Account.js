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
          <PopoverContent className='p-4'>
            <Button className="w-full" onClick={handleLogout}>Logout</Button>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

export default Account;
