import { Checkbox } from "@/components/ui/checkbox";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoader } from "@/hooks/useLoader";
import {
  updateAddedDependency,
  type AddedDependency,
} from "@/redux/slices/pipelineSlices/dependenciesSlice";
import {
  updateDependentApplication,
  type DependentRepository,
} from "@/redux/slices/pipelineSlices/dependentRepositoriesSlice";
import {
  updatePomFile,
  type PomFile,
} from "@/redux/slices/pipelineSlices/pomFilesSlice";
import { type RootState } from "@/redux/store";
import Cookies from "js-cookie";
import { AlertTriangle, CheckCircle, FileSliders, XCircle } from "lucide-react";
import React, { type ChangeEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "../../ui/button";
import { handleCommit } from "../pipelineActions/handleCommit";
import { handleUpdateFiles } from "../pipelineActions/handleUpdateFiles";

interface Props {
  dependency: AddedDependency;
  handleChange: (field: keyof AddedDependency, value: string) => void;
}

const IEUpdateFilesSection: React.FC<Props> = ({
  dependency,
  handleChange,
}) => {
  const { showLoader, hideLoader } = useLoader();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const dependentRepositories: DependentRepository[] = useSelector(
    (state: RootState) =>
      state.dependentRepositories.filter(
        (repo) => repo.dependencyId === dependency.id
      )
  );

  const allApps = dependentRepositories
    .filter((repo) => !repo.error)
    .flatMap((repo) =>
      repo.dependentApplications.map((app) => ({
        repoId: repo.id,
        app,
        branches: repo.branches,
      }))
    );

  const pomFiles: PomFile[] = useSelector((state: RootState) =>
    state.pomFiles.filter((file) => file.dependencyId === dependency.id)
  );

  const handleAppCheckboxChange = (
    repoId: string,
    appId: string,
    checked: boolean
  ) => {
    dispatch(
      updateDependentApplication({
        repoId,
        appId,
        updates: { updateDpendencyVersion: checked },
      })
    );
  };

  const toggleAllApps = (checked: boolean) => {
    allApps.forEach(({ repoId, app }) =>
      dispatch(
        updateDependentApplication({
          repoId,
          appId: app.id,
          updates: { updateDpendencyVersion: checked },
        })
      )
    );
  };

  const handleFileToggle = (fileId: string, checked: boolean) => {
    dispatch(
      updatePomFile({
        id: fileId,
        updates: { selectedForCommit: checked },
      })
    );
  };

  const toggleAllFiles = (checked: boolean) => {
    pomFiles.forEach((file) => {
      dispatch(
        updatePomFile({
          id: file.id,
          updates: { selectedForCommit: checked },
        })
      );
    });
  };

  const onUpdateFiles = async () => {
    try {
      showLoader("Updating files...");

      await handleUpdateFiles(
        dependency.id,
        dispatch,
        showLoader,
        dependency,
        dependentRepositories
      );

      dispatch(
        updateAddedDependency({
          id: dependency.id,
          updates: {
            individualModeExecuted: true,
          },
        })
      );
    } catch (error) {
      console.error("Error updating files:", error);
    } finally {
      hideLoader();
    }
  };

  const onCommitFiles = async () => {
    try {
      const hasValidTicket = true;
      const hasFilesToCommit = pomFiles.some((f) => f.selectedForCommit);

      if (!hasValidTicket || !hasFilesToCommit) return;

      showLoader("Committing selected files...");

      await handleCommit(dispatch, showLoader, dependency, pomFiles);
    } catch (err) {
      console.error("Commit failed:", err);
    } finally {
      dispatch(
        updateAddedDependency({
          id: dependency.id,
          updates: {
            individualModeExecuted: true,
          },
        })
      );
      hideLoader();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Label htmlFor="update-branch" className="mb-4 font-bold">
          Update File Branch
        </Label>
        <Input
          id="update-branch"
          value={dependency.updateFileBranch || ""}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            handleChange("updateFileBranch", e.target.value)
          }
          placeholder="Enter target branch to update POM files..."
          className="mt-1 max-w-md"
        />
      </div>

      <div>
        <h3 className="font-bold mt-6 mb-4">Applications</h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            className="text-xs"
            variant="outline"
            onClick={() => toggleAllApps(true)}
          >
            Select All
          </Button>
          <Button
            size="sm"
            className="text-xs"
            variant="outline"
            onClick={() => toggleAllApps(false)}
          >
            Deselect All
          </Button>
        </div>

        <div className="grid mt-12 grid-cols-[repeat(auto-fit,_minmax(500px,_1fr))] gap-3 pb-4">
          {allApps.length === 0 ? (
            <div className="text-muted-foreground italic">
              No dependent applications found.
            </div>
          ) : (
            allApps.map(({ repoId, app, branches }) => (
              <div
                key={app.id}
                className="flex items-center justify-between gap-4 border p-3 rounded-md flex-wrap"
              >
                <div className="flex gap-4 items-center">
                  <Checkbox
                    checked={app.updateDpendencyVersion}
                    onCheckedChange={(checked: boolean) =>
                      handleAppCheckboxChange(repoId, app.id, checked)
                    }
                  />
                  <div className="font-medium min-w-[200px]">
                    {app.repoName}
                    {app.moduleName?.trim() && <span>/ {app.moduleName}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {app.updateDpendencyVersionstatus && (
                    <HoverCard>
                      <HoverCardTrigger asChild className="text-xs">
                        <span className="cursor-pointer">
                          {app.updateDpendencyVersionstatus?.toLowerCase() ===
                          "success" ? (
                            <CheckCircle className="h-4 w-4 text-[#4BC78E]" />
                          ) : app.updateDpendencyVersionstatus?.toLowerCase() ===
                            "failure" ? (
                            <AlertTriangle className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
                          ) : (
                            <XCircle className="h-4 w-4 text-destructive" />
                          )}
                        </span>
                      </HoverCardTrigger>

                      <HoverCardContent className="text-xs space-y-1">
                        <div
                          className={
                            app.updateDpendencyVersionstatus?.toLowerCase() ===
                            "success"
                              ? "text-[#4BC78E]"
                              : app.updateDpendencyVersionstatus?.toLowerCase() ===
                                "failure"
                              ? "text-yellow-700 dark:text-yellow-400"
                              : "text-destructive"
                          }
                        >
                          Status:{" "}
                          <strong>{app.updateDpendencyVersionstatus}</strong>
                        </div>
                        <div>
                          <strong>Message:</strong>{" "}
                          {app.updateDpendencyVersionmessage || "N/A"}
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  )}
                  <HoverCard>
                    <HoverCardTrigger asChild className="text-xs">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-xs px-2"
                      >
                        Branches
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="p-2 w-fit">
                      <div className="mt-1 space-y-1 text-xs max-h-48 w-fit overflow-y-auto p-2">
                        {branches?.length > 0 ? (
                          branches.map((branch) => (
                            <div key={branch.displayId}>{branch.displayId}</div>
                          ))
                        ) : (
                          <div className="text-muted-foreground italic">
                            No branches
                          </div>
                        )}
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex w-full justify-end">
          <Button
            onClick={onUpdateFiles}
            disabled={
              !allApps.some((entry) => entry.app.updateDpendencyVersion) ||
              !dependency.selectedVersion ||
              !dependency.updateFileBranch?.trim()
            }
          >
            Update Files
          </Button>
        </div>
      </div>

      {pomFiles.length > 0 && (
        <div className="border-t pt-8">
          <div className="space-y-4">
            <div className="w-full max-w-md mb-4">
              <Label className="mb-4 font-bold">Commit Message</Label>
              <Input
                type="text"
                value={dependency.commitMessage || ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleChange("commitMessage", e.target.value)
                }
                placeholder="Commit message..."
              />
            </div>
            <h3 className="mt-12 font-bold">Pom files</h3>

            <div className="flex gap-2 mb-12">
              <Button
                size="sm"
                className="text-xs"
                variant="outline"
                onClick={() => toggleAllFiles(true)}
              >
                Select All Files
              </Button>
              <Button
                size="sm"
                className="text-xs"
                variant="outline"
                onClick={() => toggleAllFiles(false)}
              >
                Deselect All Files
              </Button>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,_minmax(500px,_1fr))] gap-3 pb-4">
              {pomFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex py-[18px] items-center justify-between gap-4 border p-3 rounded-md flex-wrap"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={file.selectedForCommit || false}
                      onCheckedChange={(checked: boolean) =>
                        handleFileToggle(file.id, checked)
                      }
                    />

                    <span className="text-sm font-medium">
                      {file.repoName}
                      {file.moduleName ? ` / ${file.moduleName}` : ""} /{" "}
                      {file.fileName}
                    </span>
                  </div>
                  <div className="flex items-center gap-6">
                    {file.commitStatus && (
                      <HoverCard>
                        <HoverCardTrigger asChild className="text-xs">
                          <span className="cursor-pointer">
                            {file.commitStatus?.toLowerCase() ===
                            "committed" ? (
                              <CheckCircle className="h-4 w-4 text-[#4BC78E]" />
                            ) : (
                              <XCircle className="h-4 w-4 text-destructive" />
                            )}
                          </span>
                        </HoverCardTrigger>

                        <HoverCardContent className="max-w-md text-xs whitespace-pre-wrap font-mono">
                          <div
                            className={`${
                              file.commitStatus?.toLowerCase() === "committed"
                                ? "text-[#4BC78E]"
                                : "text-destructive"
                            }`}
                          >
                            <strong>Status: {file.commitStatus}</strong>
                          </div>
                          <div>{file.commitStatusMessage || "N/A"}</div>
                        </HoverCardContent>
                      </HoverCard>
                    )}
                    <Button
                      variant="ghost"
                      size={"sm"}
                      className="text-xs"
                      onClick={() => {
                        Cookies.set("activeFileId", file.id);
                        navigate("/editor");
                      }}
                    >
                      <FileSliders />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <Button
                disabled={
                  false ||
                  pomFiles.filter((f) => f.selectedForCommit).length === 0
                }
                onClick={onCommitFiles}
              >
                Commit Files
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IEUpdateFilesSection;
