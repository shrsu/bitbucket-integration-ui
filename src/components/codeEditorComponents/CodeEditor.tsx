import { useSidebar } from "@/components/ui/sidebar";
import { useTheme } from "@/theme/ThemeProvider";
import Editor, { loader, type OnMount } from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";

interface Props {
  content: string;
  onChange: (value: string) => void;
}

function CodeEditor({ content, onChange }: Props) {
  const { theme } = useTheme();
  const { open } = useSidebar();
  const [monacoTheme, setMonacoTheme] = useState("custom-light");
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    const defineThemes = async () => {
      const monaco = await loader.init();
      monaco.editor.defineTheme("custom-light", {
        base: "vs",
        inherit: true,
        rules: [],
        colors: { "editor.background": "#ffffff" },
      });
      monaco.editor.defineTheme("custom-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [],
        colors: { "editor.background": "#09090b" },
      });
    };
    defineThemes();

    if (theme === "dark") setMonacoTheme("custom-dark");
    else if (theme === "light") setMonacoTheme("custom-light");
    else
      setMonacoTheme(
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "custom-dark"
          : "custom-light"
      );
  }, [theme]);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(() => {
      if (editorRef.current) {
        editorRef.current.layout();
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.layout();
    }
  }, [open]);

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  return (
    <div className="h-full p-2" ref={containerRef}>
      <Editor
        height="100%"
        defaultLanguage="xml"
        value={content}
        onChange={(val) => onChange(val ?? "")}
        onMount={handleEditorMount}
        theme={monacoTheme}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          glyphMargin: false,
          lineNumbersMinChars: 2,
          padding: { top: 8, bottom: 8 },
          lineHeight: 20,
          readOnly: false,
          domReadOnly: false,
          renderLineHighlight: "none",
          renderLineHighlightOnlyWhenFocus: true,
          tabFocusMode: false,
          renderValidationDecorations: "on",
          tabSize: 4,
          insertSpaces: true,
          detectIndentation: false,
        }}
      />
    </div>
  );
}

export default CodeEditor;
