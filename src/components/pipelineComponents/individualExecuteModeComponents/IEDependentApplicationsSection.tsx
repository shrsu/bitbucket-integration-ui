import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import type {
  DependentApplication,
  DependentRepository,
} from "@/redux/slices/pipelineSlices/dependentRepositoriesSlice";
import {
  updateDependentApplication,
  updateDependentRepository,
} from "@/redux/slices/pipelineSlices/dependentRepositoriesSlice";
import { updatePomFileUsingAppId } from "@/redux/slices/pipelineSlices/pomFilesSlice";
import type { RootState } from "@/redux/store";
import { OctagonAlert } from "lucide-react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

interface Props {
  dependency: {
    id: string;
  };
}

const IEDependentApplicationsSection: React.FC<Props> = ({ dependency }) => {
  const dispatch = useDispatch();

  const dependentRepositories: DependentRepository[] = useSelector(
    (state: RootState) =>
      state.dependentRepositories.filter(
        (repo) => repo.dependencyId === dependency.id
      )
  );

  const toggleApp = (
    repo: DependentRepository,
    app: DependentApplication,
    newValue: boolean
  ): void => {
    dispatch(
      updateDependentRepository({
        id: repo.id,
        updates: {
          createBranches: newValue,
          createPullRequests: newValue,
        },
      })
    );

    dispatch(
      updateDependentApplication({
        repoId: repo.id,
        appId: app.id,
        updates: {
          updateDpendencyVersion: newValue,
        },
      })
    );

    dispatch(
      updatePomFileUsingAppId({
        appId: app.id,
        updates: {
          selectedForCommit: newValue,
        },
      })
    );
  };

  const setAll = (value: boolean): void => {
    dependentRepositories.forEach((repo) => {
      repo.dependentApplications.forEach((app) => {
        const current =
          repo.createBranches &&
          app.updateDpendencyVersion &&
          repo.createPullRequests;

        if (current !== value) {
          toggleApp(repo, app, value);
        }
      });
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Button
          size="sm"
          className="text-xs"
          variant="outline"
          onClick={() => setAll(true)}
        >
          Select All
        </Button>
        <Button
          size="sm"
          className="text-xs"
          variant="outline"
          onClick={() => setAll(false)}
        >
          Deselect All
        </Button>
      </div>

      <div className="flex mt-6 flex-wrap gap-2 pb-4">
        {dependentRepositories.length === 0 ? (
          <div className="text-muted-foreground italic">
            No dependent applications found.
          </div>
        ) : (
          dependentRepositories.flatMap((repo) =>
            repo.dependentApplications.map((app) => {
              const isSelected =
                repo.createBranches &&
                app.updateDpendencyVersion &&
                repo.createPullRequests;

              return (
                <Button
                  key={app.id}
                  size="sm"
                  onClick={() => toggleApp(repo, app, !isSelected)}
                  className={`text-sm px-3 py-1 border rounded-md transition-colors duration-200
                  ${
                    isSelected
                      ? "bg-blue-100 text-black border-blue-300 dark:bg-blue-900 dark:text-white dark:border-blue-600"
                      : "bg-transparent text-gray-700 border-gray-300 hover:bg-gray-100 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-800"
                  }`}
                >
                  {repo.repoName} {app.moduleName ? `/${app.moduleName}` : ""}
                  {repo.error && (
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <div className="text-destructive cursor-default">
                          <OctagonAlert size={16} />
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="text-xs max-w-xs">
                        {repo.error}
                      </HoverCardContent>
                    </HoverCard>
                  )}
                </Button>
              );
            })
          )
        )}
      </div>
    </div>
  );
};

export default IEDependentApplicationsSection;
