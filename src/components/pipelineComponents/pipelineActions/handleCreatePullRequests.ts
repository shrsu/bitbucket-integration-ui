import { createPRsAPI } from "@/apis/api";
import { updateDependentRepositoryUsingAttributes } from "@/redux/slices/pipelineSlices/dependentRepositoriesSlice";

import { type AddedDependency } from "@/redux/slices/pipelineSlices/dependenciesSlice";
import { type DependentRepository } from "@/redux/slices/pipelineSlices/dependentRepositoriesSlice";
import { type AppDispatch } from "@/redux/store";
import { toast } from "sonner";

export const handleCreatePullRequests = async (
  dependency: AddedDependency,
  dependentRepositories: DependentRepository[],
  showLoader: (msg: string) => void,
  dispatch: AppDispatch
): Promise<void> => {
  const selectedRepos = dependentRepositories
    .filter((repo) => repo.createPullRequests)
    .map((repo) => ({
      projectName: repo.projectName,
      repoSlug: repo.repoName,
    }));

  const requestBody = {
    prInfoList: [
      {
        repoInfoList: selectedRepos,
        fromBranch: dependency.prFromBranch!,
        toBranch: dependency.toBranch!,
        title: dependency.pullRequestTitle!,
        description: dependency.pullRequestDescription!,
      },
    ],
  };

  try {
    showLoader("Creating pull requests...");
    const res = await createPRsAPI(requestBody);

    let successCount = 0;
    let errorCount = 0;

    res.data.createPullRequestResults.forEach((result: any) => {
      const isError = result.status === "error";

      if (isError) {
        errorCount++;
      } else {
        successCount++;
      }

      dispatch(
        updateDependentRepositoryUsingAttributes({
          dependencyId: dependency.id!,
          repoName: result.repo,
          projectName: result.projectName,
          updates: {
            createPullRequestsStatus: result.status,
            createPullRequestsMessage: result.message,
            prLink: result.result?.links?.self?.[0]?.href,
            prId: result.result?.id,
          },
        })
      );
    });

    toast.success(
      `Pull requests creation success successful. Pull requests created successfully in ${successCount} repo(s).`
    );
  } catch (error: any) {
    console.error("Error creating pull requests:", error);
    toast.error(
      `Pull requests creation success failed. ${error.response.data}`
    );
  }
};
