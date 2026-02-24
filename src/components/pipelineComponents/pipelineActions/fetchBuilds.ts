import { getPullRequestBuildsAPI } from "@/apis/api";
import { updateDependentRepositoryUsingAttributes } from "@/redux/slices/pipelineSlices/dependentRepositoriesSlice";

import { type AddedDependency } from "@/redux/slices/pipelineSlices/dependenciesSlice";
import { type DependentRepository } from "@/redux/slices/pipelineSlices/dependentRepositoriesSlice";
import { type AppDispatch } from "@/redux/store";
import { toast } from "sonner";

export const handleFetchPullRequestBuilds = async (
  dependency: AddedDependency,
  dependentRepositories: DependentRepository[],
  dispatch: AppDispatch
): Promise<void> => {
  const reposWithPRIds = dependentRepositories.filter(
    (repo) => repo.prId != null
  );

  if (reposWithPRIds.length === 0) {
    toast.info("No repositories with PRs to fetch build statuses.");
    return;
  }

  const requestBody = {
    requestItems: reposWithPRIds.map((repo) => ({
      repository: {
        projectName: repo.projectName,
        repoSlug: repo.repoName,
      },
      prId: repo.prId!,
    })),
  };

  try {
    const res = await getPullRequestBuildsAPI(requestBody);
    const builds = res.data.pullRequestBuilds;

    builds.forEach((buildResult: any) => {
      const { repoSlug, projectName, buildData } = buildResult;
      const [buildHash] = Object.keys(buildData || {});
      const buildMetrics = buildData?.[buildHash];

      if (!buildMetrics) return;

      dispatch(
        updateDependentRepositoryUsingAttributes({
          dependencyId: dependency.id!,
          repoName: repoSlug,
          projectName,
          updates: {
            build: {
              cancelled: buildMetrics.cancelled,
              successful: buildMetrics.successful,
              inProgress: buildMetrics.inProgress,
              failed: buildMetrics.failed,
              unknown: buildMetrics.unknown,
            },
          },
        })
      );
    });
  } catch (error: any) {
    console.error("Error fetching build statuses:", error);
  }
};
