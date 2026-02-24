import { Input } from "@/components/ui/input";
import { toggleRepositorySelection } from "@/redux/slices/createBranchesAndPrsSlices/branchActionsDataSlice";
import type { RootState } from "@/redux/store";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../ui/button";

interface SelectRepositoriesPopOverProps {
  projectName: string;
}

function SelectRepositoriesPopOver({
  projectName,
}: SelectRepositoriesPopOverProps) {
  const dispatch = useDispatch();
  const project = useSelector((state: RootState) =>
    state.branchActionsData.projects.find((p) => p.name === projectName)
  );

  const [search, setSearch] = useState("");

  if (!project) return null;

  const filteredRepositories = project.repositories.filter((repo) =>
    repo.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div >
      <Input
        placeholder="Search repositories..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="h-[260px] mt-4 overflow-y-auto flex flex-col pr-1 space-y-1">
        {filteredRepositories.map((repo) => (
          <Button
            variant="ghost"
            key={repo.name}
            onClick={() =>
              dispatch(
                toggleRepositorySelection({
                  projectName,
                  repositoryName: repo.name,
                })
              )
            }
            className="justify-start"
          >
            {repo.name}
          </Button>
        ))}

        {filteredRepositories.length === 0 && (
          <div className="text-sm text-muted-foreground px-2 py-4 text-center">
            No repositories found
          </div>
        )}
      </div>
    </div>
  );
}


export default SelectRepositoriesPopOver;
