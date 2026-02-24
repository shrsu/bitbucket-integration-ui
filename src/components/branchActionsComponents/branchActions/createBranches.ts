import { createBranchesAPI } from "@/apis/api";
import type { BranchActionsData } from "@/redux/slices/createBranchesAndPrsSlices/branchActionsDataSlice";
import { updateRepository } from "@/redux/slices/createBranchesAndPrsSlices/branchActionsDataSlice";
import { type AppDispatch } from "@/redux/store";
import { toast } from "sonner";

export const createBranches = async (
  dispatch: AppDispatch,
  showLoader: (msg: string) => void,
  branchActionsData: BranchActionsData
): Promise<void> => {
  const { fromBranch, newBranch, projects } = branchActionsData;

  const selectedRepos = projects.flatMap((project) =>
    project.selectedRepositories.map((repo) => ({
      ...repo,
      projectName: project.name,
    }))
  );

  if (!(selectedRepos.length > 0)) {
    return;
  }
  showLoader("Creating branches...");

  const uniqueRepoNames = selectedRepos.map((repo) => ({
    projectName: repo.projectName,
    repoSlug: repo.name,
  }));

  const requestBody = {
    repoList: uniqueRepoNames,
    branchName: newBranch,
    startPoint: fromBranch,
  };

  try {
    const res = await createBranchesAPI(requestBody);

    res.data.branchResults.forEach((result: any) => {
      const { repo: repositoryName, projectName, status, message } = result;

      dispatch(
        updateRepository({
          projectName,
          repositoryName,
          updates: {
            createBranchesStatus: status,
            createBranchesMessage: message,
          },
        })
      );
    });

    toast.success("Create branches request successful.");
  } catch (error: any) {
    toast.error(
      `Create branches request failed. ${error.response?.data ?? error.message}`
    );
  }
};
