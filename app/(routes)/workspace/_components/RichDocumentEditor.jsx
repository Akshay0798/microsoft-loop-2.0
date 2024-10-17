import React, { useEffect, useRef, useState } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import Delimiter from "@editorjs/delimiter";
import Alert from "editorjs-alert";
import List from "@editorjs/list";
import Checklist from "@editorjs/checklist";
import Embed from "@editorjs/embed";
import SimpleImage from "simple-image-editorjs";
import Table from "@editorjs/table";
import Paragraph from "@editorjs/paragraph";
import CodeTool from "@editorjs/code";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { useUser } from "@clerk/nextjs";

function RichDocumentEditor({ params }) {
  const editorRef = useRef(null); // Store the EditorJS instance here
  const { user } = useUser(); // Get the current logged-in user
  const isFetchedRef = useRef(false); // To track if data is already fetched
  const [documentOutput, setDocumentOutput] = useState(null); // State for document data

  // Initialize the editor when the component mounts and user data is available
  useEffect(() => {
    if (user) {
      initEditor();
    }
  }, [user]);

  // Function to save the document output to Firestore
  const saveDocument = async () => {
    if (!editorRef.current) return;
    try {
      const outputData = await editorRef.current.save(); // Save editor data
      const docRef = doc(db, "documentOutput", params?.documentid); // Firestore document reference
      const emailAddress = user?.primaryEmailAddress?.emailAddress; // Get the user's email address

      if (!emailAddress) {
        throw new Error("User email address is undefined.");
      }

      // Update the document with the new content and editor's email
      await updateDoc(docRef, {
        output: outputData, // Save as an object (not stringified)
        editedBy: emailAddress,
      });

      console.log("Document saved successfully:", outputData);
    } catch (error) {
      console.error("Error saving document:", error);
    }
  };

  // Function to fetch and render document output
  const getDocumentOutput = () => {
    const unsubscribe = onSnapshot(doc(db, "documentOutput", params?.documentid), (docSnapshot) => {
      const data = docSnapshot.data();
      if (data) {
        const { output, editedBy } = data;
        // Check if the document has been edited by someone else or it's the first fetch
        if (editedBy !== user?.primaryEmailAddress?.emailAddress || !isFetchedRef.current) {
          const parsedOutput = typeof output === "string" ? JSON.parse(output) : output; // Ensure output is parsed properly

          // Log the parsed output to check if it's valid
          console.log("Parsed Output:", parsedOutput);

          // Check if the output contains valid blocks for EditorJS to render
          if (editorRef.current && parsedOutput?.blocks) {
            editorRef.current.render(parsedOutput); // Render the document content
          } else {
            console.error("Parsed output is invalid or missing blocks:", parsedOutput);
          }
          isFetchedRef.current = true; // Mark data as fetched
        }
      } else {
        console.warn("Document does not exist or is undefined");
      }
    });

    return () => unsubscribe(); // Clean up the subscription when unmounting
  };

  // Initialize EditorJS and set up event listeners
  const initEditor = () => {
    if (!editorRef.current) {
      editorRef.current = new EditorJS({
        holder: "editorjs", // The ID of the element that holds the editor
        onChange: saveDocument, // Save document whenever changes occur
        onReady: getDocumentOutput, // Fetch document data when editor is ready
        tools: {
          header: Header,
          delimiter: Delimiter,
          paragraph: Paragraph,
          alert: {
            class: Alert,
            inlineToolbar: true,
            config: {
              alertTypes: ["primary", "secondary", "info", "success", "warning", "danger"],
              defaultType: "primary",
              messagePlaceholder: "Enter something",
            },
          },
          table: Table,
          list: {
            class: List,
            inlineToolbar: true,
            config: {
              defaultStyle: "unordered",
            },
          },
          checklist: {
            class: Checklist,
            inlineToolbar: true,
          },
          image: SimpleImage,
          code: {
            class: CodeTool,
          },
        },
      });
    }
  };

  return (
    <div className="lg:-ml-40">
      <div id="editorjs" className="w-[70%]"></div>
    </div>
  );
}

export default RichDocumentEditor;
