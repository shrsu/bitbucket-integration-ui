import { createCommitAPI } from "@/apis/api";
import { updateDependentRepositoryUsingAttributes } from "@/redux/slices/pipelineSlices/dependentRepositoriesSlice";
import { updatePomFileByAttributes } from "@/redux/slices/pipelineSlices/pomFilesSlice";
updateDependentRepositoryUsingAttributes;

import { type AppDispatch } from "@/redux/store";

import { type AddedDependency } from "@/redux/slices/pipelineSlices/dependenciesSlice";
import { type PomFile } from "@/redux/slices/pipelineSlices/pomFilesSlice";
import { toast } from "sonner";

export const handleCommit = async (
  dispatch: AppDispatch,
  showLoader: (msg: string) => void,
  dependency: AddedDependency,
  pomFiles: PomFile[]
): Promise<void> => {
  const selectedPomFiles = pomFiles
    .filter((pomFile) => pomFile.selectedForCommit)
    .map((pomFile) => ({
      repositoryInfo: {
        projectName: pomFile.projectName,
        repoSlug: pomFile.repoName,
        moduleName: pomFile.moduleName,
      },
      fileName: "pom.xml",
      content: [pomFile.content],
      commitMessage:
        dependency.commitMessage ||
        `Update ${dependency.name} to ${dependency.selectedVersion}`,
    }));

  if (selectedPomFiles.length === 0) return;

  const payload = {
    commitInfoList: selectedPomFiles,
    branch: dependency.updateFileBranch,
  };

  try {
    showLoader("Committing Updates...");
    const res = await createCommitAPI(payload);

    const results = res.data.commitResults;
    results.forEach((result: any) => {
      dispatch(
        updatePomFileByAttributes({
          dependencyId: dependency.id!,
          projectName: result.projectName,
          repoName: result.repo,
          moduleName: result.module,
          updates: {
            commitStatus: result.status === "error" ? "error" : "committed",
            commitStatusMessage:
              result.status === "error"
                ? result.error
                : "Committed file successfully",
          },
        })
      );
    });
    toast.success("Commit request successful.");
  } catch (error: any) {
    console.error("Error creating commits:", error);
    toast.error(`Commit request failed. ${error.response.data}`);
  }
};
