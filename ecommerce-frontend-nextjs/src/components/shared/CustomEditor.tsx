"use client";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
  Essentials,
  Paragraph,
  Bold,
  Italic,
  Heading,
  Link,
  List,
  BlockQuote,
  FontFamily,
  FontColor,
} from "ckeditor5";

import "ckeditor5/ckeditor5.css";
import "ckeditor5-premium-features/ckeditor5-premium-features.css";

interface CustomEditorProps {
  initialData?: string;
  onChange?: (data: string) => void;
}

function CustomEditor({ initialData = "", onChange }: CustomEditorProps) {
  return (
    <CKEditor
      editor={ClassicEditor}
      data={initialData}
      config={{
        licenseKey: "GPL",
        plugins: [
          Essentials,
          Paragraph,
          Bold,
          Italic,
          Heading,
          Link,
          List,
          BlockQuote,
          FontFamily,
          FontColor,
        ],
        toolbar: [
          "heading",
          "|",
          "bold",
          "fontFamily",
          "fontColor",
          "italic",
          "link",
          "bulletedList",
          "numberedList",
          "blockQuote",
          "|",
          "undo",
          "redo",
        ],
      }}
      onChange={(event, editor) => {
        const data = editor.getData();
        if (onChange) {
          onChange(data);
        }
      }}
    />
  );
}

export default CustomEditor;
