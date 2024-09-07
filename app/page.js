'use client'

import React, { useEffect, useState } from 'react';
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { EllipsisVerticalIcon, FileIcon, FolderIcon, GripVerticalIcon } from "lucide-react";
import NewDoc from '@/components/NewDoc';
import { collection, query, getDocs, doc, deleteDoc } from "firebase/firestore";
import { useUser } from '@clerk/nextjs';
import { db } from '@/firebase';
import { useRouter } from 'next/navigation';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";


export default function Home() {
  const [documents, setDocuments] = useState([]);
  const { user } = useUser();
  const router = useRouter();

  const fetchDocuments = async () => {
    const userEmail = user.primaryEmailAddress?.emailAddress;
    if (!userEmail) {
      return;
    }

    const q = query(collection(db, 'userDocs', userEmail, 'docs'));
    const querySnapshot = await getDocs(q);
    const docList = querySnapshot.docs.map(doc => ({ fileName: doc.id, ...doc.data() }));
    setDocuments(docList);
  };

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  const handleDelete = async (fileName) => {
      const userEmail = user.primaryEmailAddress?.emailAddress;
      if (!userEmail) {
        return;
      }

      const docRef = doc(db, 'userDocs', userEmail, 'docs', fileName);
  
      await deleteDoc(docRef);
      fetchDocuments();
    
  };

  return (
    <main>
      <Header />

      <section className="bg-gray-100 pb-10">
        <div className="max-w-3xl mx-auto py-6 flex items-center justify-between">
          <h2 className="text-gray-700 text-lg">Start a new document</h2>

          <Button variant="ghost">
            <GripVerticalIcon />
          </Button>
        </div>

        <div className="max-w-3xl mx-auto">
          <NewDoc />

          <p className="ml-2 mt-2 font-semibold text-sm text-gray-700">Blank</p>
        </div>
      </section>

      <section className="bg-white px-10 md:px-0">
        <div className="max-w-3xl mx-auto py-8 text-sm text-gray-500">
          <div className="flex items-center justify-between pb-5">
            <h2 className="font-medium flex-grow">My Documents</h2>
            <p className="mr-5">Date Created</p>
            <FolderIcon className="w-6 h-6 mr-6 text-gray-400" />
          </div>
          {documents.map((doc) => (
            <div key={doc.fileName} className="flex justify-between items-center cursor-pointer p-3 mb-2 bg-white hover:bg-gray-100 rounded-md shadow-sm">
              <h1 onClick={() => {
                router.push(`/${doc.fileName}`);
              }} className="text-lg gap-2 font-semibold text-gray-700 flex flex-row justify-center items-center">
                <FileIcon />
                {doc.fileName}
              </h1>
              <div className='flex flex-row items-center justify-center'>
                <h2 className="text-sm text-gray-500 flex flex-row">
                  {new Date(doc.timestamp.seconds * 1000).toLocaleDateString()}
                </h2>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant='ghost'>
                      <EllipsisVerticalIcon />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="bg-white p-2 border border-gray-300 rounded shadow-lg">
                    <Button className="w-full" variant="destructive" onClick={() => handleDelete(doc.fileName)}>Delete</Button>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}