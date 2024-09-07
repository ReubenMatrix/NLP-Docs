import React, { useState, useEffect, useRef } from 'react';
import 'draft-js/dist/Draft.css';
import dynamic from 'next/dynamic';
import { EditorState, convertFromRaw, convertToRaw, ContentState } from 'draft-js';
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
  const [suggestions, setSuggestions] = useState([]);
  const [cursorPosition, setCursorPosition] = useState({ top: 0, left: 0 });
  const editorRef = useRef(null);
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
          setEditorState(EditorState.createEmpty()); 
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
    fetchSuggestions(newEditorState);
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

  const fetchSuggestions = async (editorState) => {
    try {
      const contentState = editorState.getCurrentContent();
      const rawContent = JSON.stringify(convertToRaw(contentState));
      const plainText = contentState.getPlainText();
      const words = plainText.split(/\s+/);
      const lastTenWords = words.slice(-10).join(' ');

      const response = await axios.post('https://fe57-34-170-206-193.ngrok-free.app/predict', {
        text: lastTenWords,
        n_best: 5
      });

      setSuggestions(response.data.predictions);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const handleMouseUp = (event) => {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    setCursorPosition({
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX
    });
  };

  useEffect(() => {
    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      if (editor) {
        editor.removeEventListener('mouseup', handleMouseUp);
      }
    };
  }, [editorRef]);

  return (
    <div className="editor-container bg-[#F8F9FA] min-h-screen pb-16" ref={editorRef}>
      <Editor 
        editorState={editorState}
        onEditorStateChange={handleEditorChange}
        toolbarClassName='flex sticky top-0 z-50 !justify-center mx-auto'
        editorClassName="mt-6 p-10 bg-white shadow-lg max-w-6xl mx-auto mb-12 border"
      />
      {suggestions.length > 0 && (
        <div
          className="suggestions bg-white shadow-lg p-2 border absolute"
          style={{ top: cursorPosition.top + 20, left: cursorPosition.left }}
        >
          <h4 className="font-bold mb-2">Suggestions:</h4>
          <ul>
            {suggestions.map((suggestion, index) => (
              <li key={index} className="text-gray-800">{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default TextEditor;


