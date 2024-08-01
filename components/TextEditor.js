import React, { useState, useEffect } from 'react';
import 'draft-js/dist/Draft.css';
import dynamic from 'next/dynamic';
import { EditorState, convertFromRaw, convertToRaw } from 'draft-js';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { db } from '@/firebase'; // Import your Firebase configuration
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useUser } from '@clerk/nextjs';

const Editor = dynamic(
  () => import('react-draft-wysiwyg').then((mod) => mod.Editor),
  { ssr: false }
);

function TextEditor({ fileId }) {
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const { user } = useUser();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const userEmail = user.primaryEmailAddress?.emailAddress;

        if (!userEmail) {
          console.error("User email not found");
          return;
        }

        const docRef = doc(db, 'userDocs', userEmail, 'editorContent', fileId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const rawContent = docSnap.data().content;
          const contentState = convertFromRaw(JSON.parse(rawContent));
          setEditorState(EditorState.createWithContent(contentState));
        } else {
          setEditorState(EditorState.createEmpty()); // Set to empty if no content
        }
      } catch (error) {
        console.error("Error fetching content from Firestore:", error);
      }
    };

    if (fileId) {
      fetchContent();
    }
  }, [fileId, user]);

  const handleEditorChange = (newEditorState) => {
    setEditorState(newEditorState);
    saveContentToFirestore(newEditorState);
  };

  const saveContentToFirestore = async (editorState) => {
    try {
      const contentState = editorState.getCurrentContent();
      const rawContent = JSON.stringify(convertToRaw(contentState));
      const userEmail = user.primaryEmailAddress?.emailAddress;

      if (!userEmail) {
        console.error("User email not found");
        return;
      }

      const docRef = doc(db, 'userDocs', userEmail, 'editorContent', fileId);
      await setDoc(docRef, {
        content: rawContent,
        timestamp: serverTimestamp()
      });

    } catch (error) {
      console.error("Error saving content to Firestore:", error);
    }
  };

  return (
    <div className="editor-container bg-[#F8F9FA] min-h-screen pb-16">
      <Editor 
        editorState={editorState}
        onEditorStateChange={handleEditorChange}
        toolbarClassName='flex sticky top-0 z-50 !justify-center mx-auto'
        editorClassName="mt-6 p-10 bg-white shadow-lg max-w-6xl mx-auto mb-12 border"
      />
    </div>
  );
}

export default TextEditor;
