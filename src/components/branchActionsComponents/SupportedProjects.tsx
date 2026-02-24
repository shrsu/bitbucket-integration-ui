import { Checkbox } from "@/components/ui/checkbox";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Label } from "@/components/ui/label";
import { useLoader } from "@/hooks/useLoader";
import { type AppDispatch, type RootState } from "@/redux/store";
import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../ui/button";
import { getRepositories } from "./branchActions/getRepositories";

const toBackendProjectName = (name: string): string => name.toLowerCase();

function SupportedProjects() {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const dispatch = useDispatch<AppDispatch>();
  const { showLoader, hideLoader } = useLoader();

  const supportedProjects = useSelector(
    (state: RootState) => state.branchActionsData.supportedProjects
  );

  const availableProjects = useMemo(
    () =>
      supportedProjects.map((name) => ({
        name,
        projectName: toBackendProjectName(name),
      })),
    [supportedProjects]
  );

  const handleToggle = (projectName: string) => {
    setSelected((prev) => ({
      ...prev,
      [projectName]: !prev[projectName],
    }));
  };

  const handleAddProjects = async () => {
    try {
      showLoader("Getting the repositories list...");

      for (const { name, projectName } of availableProjects) {
        if (selected[name]) {
          const requestBody = { projectName };

          await getRepositories(dispatch, name, requestBody);
        }
      }

      setSelected({});
    } catch (error) {
      console.error("Error adding selected projects:", error);
    } finally {
      hideLoader();
    }
  };

  return (
    <HoverCard openDelay={100}>
      <HoverCardTrigger asChild>
        <Button>Add Projects</Button>
      </HoverCardTrigger>

      <HoverCardContent className="mt-2 p-4 w-fit space-y-3 mr-16">
        <h4 className="font-bold mb-6">Select Projects</h4>

        {availableProjects.length === 0 ? (
          <div className="text-muted-foreground px-2 py-6 text-sm text-center">
            None present
          </div>
        ) : (
          <>
            <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
              {availableProjects.map((project) => (
                <div key={project.name} className="flex items-start gap-3">
                  <Checkbox
                    id={`check-${project.name}`}
                    checked={!!selected[project.name]}
                    onCheckedChange={() => handleToggle(project.name)}
                  />
                  <Label htmlFor={`check-${project.name}`}>
                    {project.name}
                  </Label>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="secondary"
                className="text-xs"
                size="sm"
                onClick={handleAddProjects}
              >
                Add
              </Button>
            </div>
          </>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}

export default SupportedProjects;
