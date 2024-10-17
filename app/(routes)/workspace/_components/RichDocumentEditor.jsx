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
  const ref = useRef();
  let editor;
  const { user } = useUser();
  const [documentOutput, setDocumentOutput] = useState([]);
  let isFetched = false;

  useEffect(() => {
    user && InitEditor();
  }, [user]);

  const SaveDocument = () => {
    console.log("UPDATE");
    ref.current.save().then(async (outputData) => {
      const docRef = doc(db, "documentOutput", params?.documentid);

      await updateDoc(docRef, {
        // output: JSON.stringify(outputData),
        output: outputData,
        editedBy: user?.primaryEmailAddress?.emailAddress,
      });
    });
  };

  const GetDocumentOutput = () => {
    const unsubscribe = onSnapshot(
      doc(db, "documentOutput", params?.documentid),
      (doc) => {
        if (
          isFetched == false ||
          doc.data()?.editedBy != user?.primaryEmailAddress?.emailAddress
        )
          doc.data().output && editor.render(doc.data()?.output);
        isFetched = true;
      }
    );
  };

  const InitEditor = () => {
    if (!editor?.current) {
      editor = new EditorJS({
        onChange: (api, event) => {
          SaveDocument();
        },
        onReady: () => {
          GetDocumentOutput();
        },

        holder: "editorjs",
        tools: {
          header: Header,
          delimiter: Delimiter,
          paragraph: Paragraph,
          alert: {
            class: Alert,
            inlineToolbar: true,
            shortcut: "CMD+SHIFT+A",
            config: {
              alertTypes: [
                "primary",
                "secondary",
                "info",
                "success",
                "warning",
                "danger",
                "light",
                "dark",
              ],
              defaultType: "primary",
              messagePlaceholder: "Enter something",
            },
          },
          table: Table,
          list: {
            class: List,
            inlineToolbar: true,
            shortcut: "CMD+SHIFT+L",
            config: {
              defaultStyle: "unordered",
            },
          },
          checklist: {
            class: Checklist,
            shortcut: "CMD+SHIFT+C",
            inlineToolbar: true,
          },
          image: SimpleImage,
          code: {
            class: CodeTool,
            shortcut: "CMD+SHIFT+P",
          },
        },
      });
      ref.current = editor;
    }
  };
  return (
    <div className=" ">
      <div id="editorjs" className="w-[70%]"></div>
      {/* <div className='fixed bottom-10 md:ml-80 left-0 z-10'>
        <GenerateAITemplate setGenerateAIOutput={(output)=>editor?.render(output)} />
      </div> */}
    </div>
  );
}

export default RichDocumentEditor;
