'use client'

import Account from '@/components/Account';
import TextEditor from '@/components/TextEditor';
import { useUser } from '@clerk/nextjs';
import { FilePlusIcon } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

function Page() {
    const router = useRouter();
    const { title } = useParams();
    const [id, setId] = useState(null);
    const user = useUser()


    useEffect(() => {
        if (title) {
            setId(title);
        }
    }, [title]);

    useEffect(() => {
        if (id) {
            console.log(id);
        }
    }, [id]);

    return (
        <div>
            <div className='flex items-center justify-between top-0 z-50 px-4 py-2 shadow-md bg-white'>
                <div onClick={() => {
                    router.push('/');
                }} className='flex items-center cursor-pointer justify-center'>

                    <FilePlusIcon />

                    <h2 className='font-bold'>
                        {id ? id : 'Loading...'}
                    </h2>
                </div>

                <Account/>


            </div>

            <TextEditor fileId={title} />
        </div>
    );
}

export default Page;
