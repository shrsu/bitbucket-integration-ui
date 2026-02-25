import { Checkbox } from "@/components/ui/checkbox";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Label } from "@/components/ui/label";
import { useLoader } from "@/hooks/useLoader";
import {
  updateAddedDependency,
  type AddedDependency,
} from "@/redux/slices/pipelineSlices/dependenciesSlice";
import {
  updateDependentRepository,
  type DependentRepository,
} from "@/redux/slices/pipelineSlices/dependentRepositoriesSlice";
import { type RootState } from "@/redux/store";
import { CheckCircle, XCircle } from "lucide-react";
import React, { type ChangeEvent, useMemo } from "react";
import { FaLink } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { handleCreatePullRequests } from "../pipelineActions/handleCreatePullRequests";

interface IECreatePullRequestsDivProps {
  dependency: AddedDependency;
  handleChange: (field: keyof AddedDependency, value: string) => void;
}

const IECreatePullRequestsSection: React.FC<IECreatePullRequestsDivProps> = ({
  dependency,
  handleChange,
}) => {
  const { showLoader, hideLoader } = useLoader();
  const dispatch = useDispatch();

  const allDependentRepositories: DependentRepository[] = useSelector(
    (state: RootState) => state.dependentRepositories
  );

  const dependentRepositories = useMemo(
    () =>
      allDependentRepositories.filter(
        (repo) => repo.dependencyId === dependency.id
      ),
    [allDependentRepositories, dependency.id]
  );

  const handleInputChange =
    (field: keyof AddedDependency) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      handleChange(field, e.target.value);
    };

  const handleCheckboxChange = (repoId: string, checked: boolean) => {
    dispatch(
      updateDependentRepository({
        id: repoId,
        updates: { createPullRequests: checked },
      })
    );
  };

  const toggleAll = (value: boolean) => {
    dependentRepositories.forEach((repo) =>
      dispatch(
        updateDependentRepository({
          id: repo.id,
          updates: { createPullRequests: value },
        })
      )
    );
  };

  const handleCreate = async () => {
    try {
      showLoader("Creating pull requests...");

      await handleCreatePullRequests(
        dependency,
        dependentRepositories,
        showLoader,
        dispatch
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
      console.error("Error creating pull requests:", error);
    } finally {
      hideLoader();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-4 w-full">
        <div className="space-y-2">
          <Label className="font-bold">From Branch</Label>
          <Input
            type="text"
            value={dependency.prFromBranch || ""}
            onChange={handleInputChange("prFromBranch")}
            className="w-60"
          />
        </div>
        <div className="space-y-2">
          <Label className="font-bold">Target Branch</Label>
          <Input
            type="text"
            value={dependency.toBranch || ""}
            onChange={handleInputChange("toBranch")}
            className="w-60"
          />
        </div>
      </div>

      <h3 className="mt-12 font-bold">Repositories</h3>

      <div className="flex gap-2 mb-8">
        <Button
          size="sm"
          className="text-xs"
          variant="outline"
          onClick={() => toggleAll(true)}
        >
          Select All
        </Button>
        <Button
          size="sm"
          className="text-xs"
          variant="outline"
          onClick={() => toggleAll(false)}
        >
          Deselect All
        </Button>
      </div>

      <div className="grid mb-8 grid-cols-[repeat(auto-fit,_minmax(500px,_1fr))] gap-3 pb-4">
        {dependentRepositories.length === 0 ? (
          <div className="text-muted-foreground italic">
            No dependent repositories found.
          </div>
        ) : (
          dependentRepositories.map((repo) =>
            repo.error ? (
              ""
            ) : (
              <div
                key={repo.id}
                className="flex items-center justify-between gap-4 border p-3 rounded-md flex-wrap"
              >
                <div className="flex gap-4 items-center">
                  <Checkbox
                    checked={repo.createPullRequests}
                    onCheckedChange={(checked: boolean) =>
                      handleCheckboxChange(repo.id, checked)
                    }
                  />
                  <div className="font-medium min-w-[200px]">
                    {repo.repoName}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {repo.prLink?.trim() && (
                    <a
                      href={repo.prLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open Pull Request"
                      className="text-[#4BC78E]"
                    >
                      <Button variant={"ghost"}>
                        <FaLink size={18} />
                      </Button>
                    </a>
                  )}

                  {repo.createPullRequestsStatus && (
                    <HoverCard>
                      <HoverCardTrigger asChild className="text-xs">
                        <span className="cursor-pointer">
                          {repo.createPullRequestsStatus?.toLowerCase() ===
                          "success" ? (
                            <CheckCircle className="h-4 w-4 text-[#4BC78E]" />
                          ) : (
                            <XCircle className="h-4 w-4 text-destructive" />
                          )}
                        </span>
                      </HoverCardTrigger>
                      <HoverCardContent className="text-xs space-y-1">
                        <div
                          className={`${
                            repo.createPullRequestsStatus?.toLowerCase() ===
                            "success"
                              ? "text-[#4BC78E]"
                              : "text-destructive"
                          }`}
                        >
                          <strong>
                            {" "}
                            Status:{repo.createPullRequestsStatus}
                          </strong>
                        </div>
                        <div>{repo.createPullRequestsMessage || "N/A"}</div>
                      </HoverCardContent>
                    </HoverCard>
                  )}

                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-xs px-2"
                      >
                        Branches
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="p-2 w-fit">
                      <div className="mt-1 space-y-1 text-sm max-h-48 w-fit overflow-y-auto p-2">
                        {repo.branches?.length > 0 ? (
                          repo.branches.map((branch) => (
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
            )
          )
        )}
      </div>

      <div className="flex flex-col gap-4 w-full">
        <div className="space-y-2">
          <Label className="font-bold">Pull Request Title</Label>
          <Input
            type="text"
            value={dependency.pullRequestTitle || ""}
            onChange={handleInputChange("pullRequestTitle")}
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label className="font-bold">Pull Request Description</Label>
          <textarea
            rows={2.5}
            value={dependency.pullRequestDescription || ""}
            onChange={handleInputChange("pullRequestDescription")}
            className="w-full p-2 border rounded-md text-sm resize-y"
          />
        </div>
      </div>

      <div className="flex w-full justify-end">
        <Button onClick={handleCreate}>Create Pull Requests</Button>
      </div>
    </div>
  );
};

export default IECreatePullRequestsSection;
