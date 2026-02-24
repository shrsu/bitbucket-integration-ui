import { createPRsAPI } from "@/apis/api";
import { updateRepository } from "@/redux/slices/createBranchesAndPrsSlices/branchActionsDataSlice";

import type { BranchActionsData } from "@/redux/slices/createBranchesAndPrsSlices/branchActionsDataSlice";
import { type AppDispatch } from "@/redux/store";
import { toast } from "sonner";

export const createPullRequests = async (
  dispatch: AppDispatch,
  showLoader: (msg: string) => void,
  branchActionsData: BranchActionsData
): Promise<void> => {
  showLoader("Creating branches...");

  const { prFromBranch, prToBranch, prTitle, prDescription, projects } =
    branchActionsData;

  const selectedRepos = projects.flatMap((project) =>
    project.selectedRepositories.map((repo) => ({
      ...repo,
      projectName: project.name,
    }))
  );

  const uniqueRepoNames = selectedRepos.map((repo) => ({
    projectName: repo.projectName,
    repoSlug: repo.name,
  }));

  const requestBody = {
    prInfoList: [
      {
        repoInfoList: uniqueRepoNames,
        fromBranch: prFromBranch!,
        toBranch: prToBranch!,
        title: prTitle!,
        description: prDescription!,
      },
    ],
  };

  try {
    showLoader("Creating pull requests...");
    const res = await createPRsAPI(requestBody);

    let successCount = 0;

    res.data.createPullRequestResults.forEach((result: any) => {
      const { repo, projectName, status, message } = result;

      if (status === "success") successCount++;

      dispatch(
        updateRepository({
          projectName,
          repositoryName: repo,
          updates: {
            createPullRequestStatus: status,
            createPullRequestMessage: message,
            pullRequestLink: result.result?.links?.self?.[0]?.href,
            prId: result.result?.id,
          },
        })
      );
    });

    toast.success(
      `Pull requests created successfully in ${successCount} repo(s).`
    );
  } catch (error: any) {
    console.error("Error creating pull requests:", error);
    toast.error(
      `Pull requests creation failed. ${
        error.response?.data || error.message || "Unknown error"
      }`
    );
  }
};
