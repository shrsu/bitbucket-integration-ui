import { getRepositoriesAPI } from "@/apis/api";
import {
  addProject,
  addRepositoriesToProject,
} from "@/redux/slices/createBranchesAndPrsSlices/branchActionsDataSlice";
import { type AppDispatch } from "@/redux/store";
import { toast } from "sonner";

export const getRepositories = async (
  dispatch: AppDispatch,
  projectName: string,
  requestBody: Record<string, any>
) => {
  try {
    const response = await getRepositoriesAPI(requestBody);
    const appNames: string[] = response.data?.applications || [];

    const repositories = appNames.map((name) => ({
      name,
      selected: false,
      createBranchesStatus: undefined,
      createBranchesMessage: undefined,
      createPullRequestStatus: undefined,
      createPullRequestMessage: undefined,
      pullRequestLink: undefined,
      build: undefined,
      branches: [],
    }));

    dispatch(
      addProject({
        name: projectName,
        repositories: [],
        selectedRepositories: [],
      })
    );

    dispatch(addRepositoriesToProject({ projectName, repositories }));
    toast.success("Fetched repositories names successfully.");
  } catch (error: any) {
    console.error("Failed to fetch repositories:", error);
    toast.error(
      `Failed to fetch repositories. ${
        error.response?.data || error.message || "Unknown error"
      }`
    );
  }
};
