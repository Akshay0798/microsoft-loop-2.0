"use client";
import React, { useEffect } from "react";
import SideNav from "../../_components/SideNav";
import DocumentEditorSection from "../../_components/DocumentEditorSection";
import { Room } from "@/app/Room";

function WorkspaceDocument({ params }) {
  // just for checking what params are
  // useEffect(()=>{
  //   console.log(params)
  // },[params])

  return (
    <Room params={params}>
      <div>
        {/* SideNav */}
        <div className="">
          <SideNav params={params} />
        </div>

        {/* Document */}
        <div className="md:ml-72">
          <DocumentEditorSection params={params} />
        </div>
      </div>
    </Room>
  );
}

export default WorkspaceDocument;
