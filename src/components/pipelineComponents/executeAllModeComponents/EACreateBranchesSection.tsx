import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Label } from "@/components/ui/label";
import { type AddedDependency } from "@/redux/slices/pipelineSlices/dependenciesSlice";
import { type DependentRepository } from "@/redux/slices/pipelineSlices/dependentRepositoriesSlice";
import { type RootState } from "@/redux/store";
import { CheckCircle, XCircle } from "lucide-react";
import { type ChangeEvent } from "react";
import { useSelector } from "react-redux";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";

interface Props {
  dependency: AddedDependency;
  handleChange: (field: keyof AddedDependency, value: string) => void;
}

const EACreateBranchesSection: React.FC<Props> = ({
  dependency,
  handleChange,
}) => {
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

      {/* Section Header */}
      <h3 className="mt-6 font-bold">Repositories</h3>

      {/* Repositories List */}
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
                          <strong>Status: {repo.createBranchesStatus}</strong>
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
    </div>
  );
};

export default EACreateBranchesSection;
