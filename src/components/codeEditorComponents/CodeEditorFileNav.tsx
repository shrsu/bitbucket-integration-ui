import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { PomFile } from "@/redux/slices/pipelineSlices/pomFilesSlice";
import clsx from "clsx";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";

interface Props {
  files: PomFile[];
  activeFileId: string | null;
  setActiveFileId: (id: string) => void;
}

function CodeEditorFileNav({ files, activeFileId, setActiveFileId }: Props) {
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  useEffect(() => {
    try {
      const savedKeys = Cookies.get("openDependencyGroups");
      if (savedKeys) {
        const parsed = JSON.parse(savedKeys);
        if (Array.isArray(parsed)) {
          setOpenKeys(parsed);
        }
      }
    } catch (e) {
      console.warn("Failed to parse openDependencyGroups cookie", e);
    }
  }, []);

  useEffect(() => {
    if (openKeys.length > 0) {
      Cookies.set("openDependencyGroups", JSON.stringify(openKeys));
    } else {
      Cookies.remove("openDependencyGroups");
    }
  }, [openKeys]);

  const grouped = files.reduce<Record<string, PomFile[]>>((acc, file) => {
    const depName = file.dependencyName || "Unknown";
    if (!acc[depName]) acc[depName] = [];
    acc[depName].push(file);
    return acc;
  }, {});

  const handleAccordionChange = (value: string | string[]) => {
    const newOpenKeys = Array.isArray(value) ? value : [value];
    setOpenKeys(newOpenKeys);
  };

  if (!files || files.length === 0) {
    return (
      <div className="h-full w-full relative overflow-y-auto border-r border-border p-2 transition-colors">
        <p className="text-sm text-muted-foreground absolute top-1/2 left-1/2 -translate-1/2">No files to display</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto border-r border-border bg-background p-4 transition-colors">
      <Accordion
        type="multiple"
        value={openKeys}
        onValueChange={handleAccordionChange}
        className="w-full"
      >
        {Object.entries(grouped).map(([depName, groupFiles]) => (
          <AccordionItem
            key={depName}
            value={depName}
            className="border-border"
          >
            <AccordionTrigger className="text-sm font-medium text-foreground hover:text-foreground/80 transition-colors [&[data-state=open]>svg]:rotate-180">
              {depName}
            </AccordionTrigger>
            <AccordionContent className="w-full overflow-x-auto pb-2">
              <div className="space-y-2">
                {groupFiles.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => setActiveFileId(file.id)}
                    className={clsx(
                      "cursor-pointer rounded-md px-3 py-2 text-sm transition-all duration-200 ease-in-out",
                      "border border-transparent hover:border-border/50",
                      file.id === activeFileId
                        ? "bg-secondary text-secondary-foreground"
                        : "hover:bg-accent hover:text-accent-foreground bg-card text-card-foreground"
                    )}
                  >
                    <div className="truncate text-[12px] font-medium text-inherit">
                      {file.fileName}
                    </div>
                    <div
                      className={clsx(
                        "text-[11px] transition-colors",
                        file.id === activeFileId
                          ? "text-secondary-foreground/70"
                          : "text-secondary-foreground"
                      )}
                    >
                      {file.projectName} / {file.repoName} / {file.moduleName}
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

export default CodeEditorFileNav;
