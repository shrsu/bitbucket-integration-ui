import { updateDependencyAPI } from "@/apis/api";
import { type AddedDependency } from "@/redux/slices/pipelineSlices/dependenciesSlice";
import {
  updateDependentApplication,
  type DependentRepository,
} from "@/redux/slices/pipelineSlices/dependentRepositoriesSlice";
import {
  addPomFile,
  removePomFile,
  type PomFile,
} from "@/redux/slices/pipelineSlices/pomFilesSlice";
import { type AppDispatch } from "@/redux/store";
import { createIdFromParts } from "@/redux/utils/utilityFunctions";
import { toast } from "sonner";

export const handleUpdateFiles = async (
  depId: string,
  dispatch: AppDispatch,
  showLoader: (msg: string) => void,
  dependency: AddedDependency,
  dependentRepositories: DependentRepository[]
): Promise<PomFile[]> => {
  showLoader("Updating Dependency...");

  const selectedApplicationsList: {
    projectName: string;
    repoSlug: string;
    moduleName: string;
  }[] = [];

  dependentRepositories.forEach((repo) => {
    repo.dependentApplications.forEach((app) => {
      if (app.updateDpendencyVersion) {
        selectedApplicationsList.push({
          projectName: app.projectName,
          repoSlug: app.repoName,
          moduleName: app.moduleName,
        });
      }
    });
  });

  if (
    !selectedApplicationsList.length ||
    !dependency.selectedVersion ||
    !dependency.updateFileBranch?.trim()
  ) {
    toast.error(
      "Missing inputs: Please select applications, version, and branch."
    );
    return [];
  }

  const requestBody = {
    repoList: selectedApplicationsList,
    branchName: dependency.updateFileBranch,
    dependency: dependency.name,
    version: dependency.selectedVersion,
  };

  const addedPomFiles: PomFile[] = [];

  try {
    const response = await updateDependencyAPI(requestBody);
    const results = response.data.updatedResults || [];

    results.forEach((result: any) => {
      const eol = result.eol === "\r\n" ? "\r\n" : "\n";
      const joinedPom = result.pomContent?.join(eol) || "";
      const fileId = createIdFromParts(
        result.projectName,
        result.repo,
        result.module,
        dependency.name,
        "pom.xml"
      );

      const appId = createIdFromParts(
        result.projectName,
        result.repo,
        result.module,
        dependency.name
      );
      const repoId = createIdFromParts(
        result.projectName,
        result.repo,
        dependency.name
      );

      if (result.status === "error") {
        dispatch(removePomFile(fileId));
      } else {
        const pomFile: PomFile = {
          id: fileId,
          dependencyId: depId,
          dependencyName: dependency.name,
          appId: appId,
          fileName: result.fileName || "pom.xml",
          projectName: result.projectName,
          repoName: result.repo,
          moduleName: result.module,
          content: joinedPom,
          selectedForCommit: true,
          commitStatus: "",
          commitStatusMessage: "",
        };

        dispatch(addPomFile(pomFile));
        addedPomFiles.push(pomFile);
      }

      dispatch(
        updateDependentApplication({
          repoId,
          appId,
          updates: {
            pomFileId: fileId,
            updateDpendencyVersionstatus: result.status,
            updateDpendencyVersionmessage:
              result.status === "error" ? result.error : result.message,
          },
        })
      );
    });

    if (results.length) {
      toast.success("Dependency versions update request successful.");
    } else {
      toast("No updates were made.");
    }

    return addedPomFiles;
  } catch (error: any) {
    console.error("Error updating dependency version:", error);
    toast.error(
      `Dependency versions update request failed. ${error.response.data}`
    );
    return [];
  }
};
