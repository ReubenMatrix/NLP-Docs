import React from 'react'
import { FilePlusIcon } from 'lucide-react'
import Account from './Account'


function Header() {

  return (
      <div className='flex items-center justify-between top-0 z-50 px-4 py-2 shadow-md bg-white'>
          <div className='flex items-center'>
              <FilePlusIcon />

              <h1 className=' ml-2 text-gray-700 text-2xl'>
                  Docs
              </h1>
          </div>

          <Account/>

      </div>
  )
}

export default Header
