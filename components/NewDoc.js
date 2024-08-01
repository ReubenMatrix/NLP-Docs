import React, { useState } from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogTrigger, AlertDialogOverlay, AlertDialogAction, AlertDialogCancel } from "@radix-ui/react-alert-dialog";
import { PlusIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { db } from '@/firebase'; 
import { useUser } from '@clerk/nextjs';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

function NewDoc() {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const { user } = useUser();
    const router = useRouter()

    const createDocument = async () => {
        if (!input) {
            return;
        }

        const userEmail = user.primaryEmailAddress?.emailAddress;
        if (!userEmail) {
            return;
        }

        const docRef = doc(db, 'userDocs', userEmail, 'docs', input);
        await setDoc(docRef, {
            fileName: input,
            timestamp: serverTimestamp()
        });

        router.push(`/${input}`);

        setInput("")
        setOpen(false);
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <div
                    className="relative h-52 w-40 hover:border-black hover:bg-slate-400 bg-white flex items-center justify-center border-2 cursor-pointer"
                    onClick={() => setOpen(true)}
                >
                    <PlusIcon className="h-10 w-10" />
                </div>
            </AlertDialogTrigger>
            <AlertDialogOverlay className="fixed inset-0 bg-black bg-opacity-50" />
            <AlertDialogContent className="fixed inset-0 flex items-center justify-center p-4">
                <div className="bg-white rounded-md p-6 w-full max-w-md">
                    <AlertDialogTitle className="text-xl font-medium">Create New File</AlertDialogTitle>
                    <input
                        type="text"
                        placeholder="Enter File Name"
                        className="mt-4 w-full border rounded-md p-2"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <div className="mt-6 flex justify-end">
                        <AlertDialogCancel asChild>
                            <Button variant="outline" className="mr-2" onClick={() => setOpen(false)}>Cancel</Button>
                        </AlertDialogCancel>
                        <AlertDialogAction asChild>
                            <Button onClick={createDocument}>Create</Button>
                        </AlertDialogAction>
                    </div>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default NewDoc;
