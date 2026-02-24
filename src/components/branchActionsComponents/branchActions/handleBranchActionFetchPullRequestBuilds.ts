import { getPullRequestBuildsAPI } from "@/apis/api";
import { updateRepository } from "@/redux/slices/createBranchesAndPrsSlices/branchActionsDataSlice";
import { type AppDispatch } from "@/redux/store";
import { type Repository } from "@/redux/slices/createBranchesAndPrsSlices/branchActionsDataSlice";

export const handleBranchActionFetchPullRequestBuilds = async (
  projectName: string,
  repositories: Repository[],
  dispatch: AppDispatch
): Promise<void> => {
  const reposWithPRIds = repositories.filter((repo) => repo.prId);
  if (reposWithPRIds.length === 0) return;

  const requestBody = {
    requestItems: reposWithPRIds.map((repo) => ({
      repository: {
        projectName,
        repoSlug: repo.name,
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
        updateRepository({
          projectName,
          repositoryName: repoSlug,
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
