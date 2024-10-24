import React, { useState, useEffect, useRef } from 'react';
import 'draft-js/dist/Draft.css';
import dynamic from 'next/dynamic';
import { EditorState, convertFromRaw, convertToRaw } from 'draft-js';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { db } from '@/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useUser } from '@clerk/nextjs';
import axios from 'axios';

const Editor = dynamic(
  () => import('react-draft-wysiwyg').then((mod) => mod.Editor),
  { ssr: false }
);

function TextEditor({ fileId }) {
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const [prediction, setPrediction] = useState('');
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const editorRef = useRef(null);
  const { user } = useUser();
  const isMounted = useRef(true); 

  useEffect(() => {
    isMounted.current = true; 

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
          if (isMounted.current) setEditorState(EditorState.createWithContent(contentState));
        } else {
          if (isMounted.current) setEditorState(EditorState.createEmpty()); 
        }
      } catch (error) {
        console.error("Error fetching content from Firestore:", error);
      }
    };

    if (fileId) {
      fetchContent();
    }

    return () => {
      isMounted.current = false; 
      if (debounceTimeout) {
        clearTimeout(debounceTimeout); 
      }
    };
  }, [fileId, user]);

  const handleEditorChange = (newEditorState) => {
    setEditorState(newEditorState);
    saveContentToFirestore(newEditorState);

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    const newTimeout = setTimeout(() => {
      fetchPrediction(newEditorState);
    }, 500); 
    setDebounceTimeout(newTimeout);
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


  const fetchPrediction = async (editorState) => {
    try {
      const contentState = editorState.getCurrentContent();
      const plainText = contentState.getPlainText(); 

      if (plainText.length > 0) {
        const response = await axios.post('https://126c-35-237-191-169.ngrok-free.app/predict', {
          input_text: plainText 
        });

        if (isMounted.current) setPrediction(response.data.prediction); 
      } else {
        if (isMounted.current) setPrediction(''); 
      }
    } catch (error) {
      console.error("Error fetching prediction:", error);
      if (isMounted.current) setPrediction(''); 
    }
  };

  return (
    <div className="editor-container bg-[#F8F9FA] min-h-screen pb-16 relative" ref={editorRef}>
      <Editor 
        editorState={editorState}
        onEditorStateChange={handleEditorChange}
        toolbarClassName='flex sticky top-0 z-50 !justify-center mx-auto'
        editorClassName="mt-6 p-10 bg-white shadow-lg max-w-6xl mx-auto mb-12 border"
      />
      {prediction && (
        <div 
          className="prediction fixed bottom-4 right-4 bg-white shadow-lg p-3 border rounded-md z-50 cursor-pointer transition-all duration-200"
        >
          <span className="text-sm text-gray-600">Suggested Word: </span>
          <span className="font-semibold">{prediction}</span>
        </div>
      )}
    </div>
  );
}

export default TextEditor;

