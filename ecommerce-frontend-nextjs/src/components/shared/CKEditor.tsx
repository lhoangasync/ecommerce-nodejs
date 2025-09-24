"use client";

import dynamic from "next/dynamic";
import PacmanSpinner from "./PacmanLoader";

const CKEditor = dynamic(() => import("./CustomEditor"), {
  ssr: false,
  loading: () => <PacmanSpinner />,
});

export default CKEditor;
