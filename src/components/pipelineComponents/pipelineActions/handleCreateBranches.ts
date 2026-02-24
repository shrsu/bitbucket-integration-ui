import { createBranchesAPI, getBranchesAPI } from "@/apis/api";
import { updateDependentRepositoryUsingAttributes } from "@/redux/slices/pipelineSlices/dependentRepositoriesSlice";
import { createIdFromParts } from "@/redux/utils/utilityFunctions";
updateDependentRepositoryUsingAttributes;

import {
  updateDependentRepository,
  type DependentRepository,
} from "@/redux/slices/pipelineSlices/dependentRepositoriesSlice";
import { type AppDispatch } from "@/redux/store";

import { type BranchesData } from "@/apis/api";
import { type AddedDependency } from "@/redux/slices/pipelineSlices/dependenciesSlice";

import { toast } from "sonner";

export const handleCreateBranches = async (
  depId: string,
  dispatch: AppDispatch,
  showLoader: (msg: string) => void,
  dependency: AddedDependency,
  dependentRepositories: DependentRepository[]
): Promise<void> => {
  showLoader("Creating branches...");

  const { fromBranch: branchFrom, newBranch } = dependency;

  const eligibleRepos = dependentRepositories.filter(
    (repo) => repo.createBranches
  );

  const uniqueRepoNames = eligibleRepos.map((repo) => ({
    projectName: repo.projectName,
    repoSlug: repo.repoName,
  }));

  const requestBody = {
    repoList: uniqueRepoNames,
    branchName: newBranch!,
    startPoint: branchFrom!,
  };

  try {
    const res = await createBranchesAPI(requestBody);
    const successfulRepos = new Set<string>();

    res.data.branchResults.forEach((result: any) => {
      const { repo, projectName, status, message } = result;

      if (status === "success") successfulRepos.add(repo);

      const repoId = createIdFromParts(projectName, repo, dependency.name);
      dispatch(
        updateDependentRepository({
          id: repoId,
          updates: {
            createBranchesStatus: status,
            createBranchesMessage: message,
          },
        })
      );
    });

    const successfulRepoList = Array.from(successfulRepos)
      .map((repoSlug) => {
        const match = dependentRepositories.find(
          (r) => r.repoName === repoSlug && r.dependencyId === depId
        );
        return match
          ? {
              projectName: match.projectName,
              repoSlug: match.repoName,
            }
          : null;
      })
      .filter(Boolean) as { projectName: string; repoSlug: string }[];

    if (successfulRepoList.length > 0) {
      const branchesResponse = await getBranchesAPI(
        {
          repoList: successfulRepoList,
        }
      );

      branchesResponse.data.branchesData.forEach((result: BranchesData) => {
        const repoId = createIdFromParts(
          result.projectName,
          result.repository,
          dependency.name
        );

        dispatch(
          updateDependentRepository({
            id: repoId,
            updates: { branches: result.branches },
          })
        );
      });
    }

    toast.success("Create branches request successful.");
  } catch (error: any) {
    toast.error(`Create branches request failed. ${error.response.data}`);
  }
};
