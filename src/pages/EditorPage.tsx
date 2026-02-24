import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import { updatePomFile } from "@/redux/slices/pipelineSlices/pomFilesSlice";
import CodeEditorFileNav from "@/components/codeEditorComponents/CodeEditorFileNav";
import CodeEditor from "@/components/codeEditorComponents/CodeEditor";
import Cookies from "js-cookie";

function EditorPage() {
  const dispatch = useDispatch();
  const pomFiles = useSelector((state: RootState) => state.pomFiles);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  useEffect(() => {
    if (pomFiles.length === 0) return;

    const savedId = Cookies.get("activeFileId");
    const defaultFile = pomFiles.find((f) => f.id === savedId) || pomFiles[0];

    setActiveFileId(defaultFile.id);
    Cookies.set("activeFileId", defaultFile.id);
  }, [pomFiles]);

  const handleChangeContent = (newContent: string) => {
    if (!activeFileId) return;
    dispatch(
      updatePomFile({ id: activeFileId, updates: { content: newContent } })
    );
  };

  const handleFileSelect = (id: string) => {
    setActiveFileId(id);
    Cookies.set("activeFileId", id);
  };

  const activeFile = pomFiles.find((f) => f.id === activeFileId);

  return (
    <div className="h-[calc(100vh-70px)] flex">
      <div className="w-[27.5%] h-full overflow-auto">
        <CodeEditorFileNav
          files={pomFiles}
          activeFileId={activeFileId}
          setActiveFileId={handleFileSelect}
        />
      </div>
      <div className="w-[72.5%] h-full overflow-auto">
        { pomFiles && pomFiles.length > 0 && (
          <CodeEditor
            content={activeFile?.content || ""}
            onChange={handleChangeContent}
          />
        )}
      </div>
    </div>
  );
}

export default EditorPage;
