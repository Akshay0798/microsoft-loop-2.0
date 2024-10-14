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
import { TextVariantTune } from "@editorjs/text-variant-tune";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { useUser } from "@clerk/nextjs";

// import GenerateAITemplate from './GenerateAITemplate';

function RichDocumentEditor({ params }) {
  
  const editorRef = useRef(null);
  const isFetchedRef = useRef(false);
  const { user } = useUser();

  const [documentOutput, setDocumentOutput] = useState([]);

  useEffect(() => {
    if (user) {
      initEditor();
    }
  }, [user]);

 
  const saveDocument = async () => {
    try {
      const outputData = await editorRef.current.save();
      const docRef = doc(db, "documentOutput", params?.documentid);

      await updateDoc(docRef, {
        output: JSON.stringify(outputData),
        editedBy: user?.primaryEmailAddress?.emailAddress,
      });
      console.log("Document saved successfully:", outputData);
    } catch (error) {
      console.error("Error saving document:", error);
    }
  };


  const getDocumentOutput = () => {
    const unsubscribe = onSnapshot(doc(db, "documentOutput", params?.documentid), (doc) => {
      if (doc.data()?.editedBy !== user?.primaryEmailAddress?.emailAddress || !isFetchedRef.current) {
        const output = doc.data()?.output;
        const parsedOutput = typeof output === "string" ? JSON.parse(output) : output;
        
        if (editorRef.current && parsedOutput) {
          editorRef.current.render(parsedOutput);
        }
        isFetchedRef.current = true;
      }
    });

    return () => unsubscribe();
  };

  const initEditor = () => {
    if (!editorRef.current) {
      const editor = new EditorJS({
        holder: "editorjs",
        onChange: () => saveDocument(),
        onReady: () => {
          getDocumentOutput();
        },
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

      editorRef.current = editor;
    }
  };

  return (
    <div className="lg:-ml-40">
      <div id="editorjs"></div>
    </div>
  );
}


export default RichDocumentEditor;
