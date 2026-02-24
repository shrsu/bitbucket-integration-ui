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
import { type ChangeEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { handleCreateBranches } from "../pipelineActions/handleCreateBranches";

interface Props {
  dependency: AddedDependency;
  handleChange: (field: keyof AddedDependency, value: string) => void;
}

const IECreateBranchesSection: React.FC<Props> = ({
  dependency,
  handleChange,
}) => {
  const dispatch = useDispatch();
  const { showLoader, hideLoader } = useLoader();

  const dependentRepositories: DependentRepository[] = useSelector(
    (state: RootState) =>
      state.dependentRepositories.filter(
        (repo) => repo.dependencyId === dependency.id
      )
  );

  const handleInputChange =
    (field: keyof AddedDependency) => (e: ChangeEvent<HTMLInputElement>) => {
      handleChange(field, e.target.value);
    };

  const handleCheckboxChange = (repoId: string, checked: boolean) => {
    dispatch(
      updateDependentRepository({
        id: repoId,
        updates: { createBranches: checked },
      })
    );
  };

  const toggleAll = (value: boolean) => {
    dependentRepositories.forEach((repo) =>
      dispatch(
        updateDependentRepository({
          id: repo.id,
          updates: { createBranches: value },
        })
      )
    );
  };

  const onCreateBranches = async () => {
    const dependencyId = dependency.id;

    try {
      showLoader("Creating branches...");

      await handleCreateBranches(
        dependencyId,
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
      console.error("Error creating branches:", error);
    } finally {
      hideLoader();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Input Section */}
      <div className="flex gap-2 w-full">
        <div className="space-y-2">
          <Label className="font-bold">From Branch</Label>
          <Input
            type="text"
            value={dependency.fromBranch || ""}
            onChange={handleInputChange("fromBranch")}
            className="w-60"
          />
        </div>
        <div className="space-y-2">
          <Label className="font-bold">New Branch Name</Label>
          <Input
            type="text"
            value={dependency.newBranch || ""}
            onChange={handleInputChange("newBranch")}
            className="w-60"
          />
        </div>
      </div>

      <h3 className="mt-6 font-bold">Repositories</h3>

      <div className="flex gap-2 mb-2">
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

      <div className="grid grid-cols-[repeat(auto-fit,_minmax(500px,_1fr))] gap-3 pb-4 mt-6">
        {dependentRepositories.length === 0 ? (
          <div className="text-muted-foreground">
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
                    checked={repo.createBranches}
                    onCheckedChange={(checked: boolean) =>
                      handleCheckboxChange(repo.id, checked)
                    }
                  />
                  <div className="font-medium min-w-[200px]">
                    {repo.repoName}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {repo.createBranchesStatus?.trim() !== "" && (
                    <HoverCard>
                      <HoverCardTrigger asChild className="text-xs">
                        <span className="cursor-pointer">
                          {repo.createBranchesStatus?.toLowerCase() ===
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
                            repo.createBranchesStatus?.toLowerCase() ===
                            "success"
                              ? "text-[#4BC78E]"
                              : "text-destructive"
                          }`}
                        >
                          <strong> Status: {repo.createBranchesStatus}</strong>
                        </div>
                        <div>{repo.createBranchesMessage || "N/A"}</div>
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
                        {repo.branches?.map((branch) => (
                          <div key={branch.displayId}>{branch.displayId}</div>
                        ))}
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
              </div>
            )
          )
        )}
      </div>

      <div className="flex w-full justify-end">
        <Button onClick={onCreateBranches}>Create Branches</Button>
      </div>
    </div>
  );
};

export default IECreateBranchesSection;
