import { getBranchesAPI, getDependentAppsAndVersionsAPI } from "@/apis/api";
import {
  addSelectedDependency,
  updateDependencyStatus,
} from "@/redux/slices/pipelineSlices/dependenciesSlice";
import {
  addDependentRepository,
  updateDependentRepositoryUsingAttributes,
} from "@/redux/slices/pipelineSlices/dependentRepositoriesSlice";
import { createIdFromParts } from "@/redux/utils/utilityFunctions";
updateDependentRepositoryUsingAttributes;

import { type Application, type BranchesData } from "@/apis/api";
import { type AppDispatch } from "@/redux/store";
import { nanoid } from "@reduxjs/toolkit";
import { toast } from "sonner";

export const getVersionsAndDependantApps = async (
  dep: { name: string },
  dispatch: AppDispatch,
  showLoader: (msg: string) => void
): Promise<void> => {
  showLoader("Loading selected dependencies' pipelines...");

  const dependencyName = dep.name;
  try {
    const response = await getDependentAppsAndVersionsAPI(dependencyName);
    const {
      versions: rawVersions,
      applications,
    }: {
      versions: { name?: string; version?: string }[];
      applications: Application[];
    } = response.data;

    const versions = (rawVersions ?? []).map((v) => ({
      name: v.name ?? v.version ?? String(v),
    }));

    const dependencyId = nanoid();

    const selectedVersion = versions[0]?.name ?? "";

    dispatch(
      addSelectedDependency({
        id: dependencyId,
        name: dependencyName,
        versions,
        selectedVersion,
        fromBranch: "develop",
        newBranch: "",
        prFromBranch: "",
        toBranch: "develop",
        updateFileBranch: "",
        executeAll: false,
        isOpen: false,
        isDependentApplicationsOpen: false,
        isCreateBranchesOpen: false,
        isUpdateFilesOpen: false,
        isCreatePullRequestsOpen: false,
        isPullRequestLinksOpen: false,
        commitMessage: `Update ${dependencyName} to ${selectedVersion}`,
        pullRequestTitle: `Update ${dependencyName} to ${selectedVersion}`,
        pullRequestDescription: `This pull request updates the dependency **${dependencyName}** to version **${selectedVersion}**`,
        individualModeExecuted: false,
      })
    );

    const repoList = applications.map((app) => ({
      projectName: app.project,
      repoSlug: app.application,
    }));

    const branchResponse = await getBranchesAPI({
      repoList,
    });

    const branchesData: BranchesData[] = branchResponse.data.branchesData;

    const repoMap = new Map<string, any>();

    applications.forEach((app) => {
      const repoKey = `${app.project}::${app.application}`;
      const matchedBranches = branchesData.find(
        (b) => b.projectName === app.project && b.repository === app.application
      ) as BranchesData;

      const repoId = createIdFromParts(
        app.project,
        app.application,
        dependencyName
      );

      if (!repoMap.has(repoKey)) {
        repoMap.set(repoKey, {
          id: repoId,
          projectName: app.project,
          repoName: app.application,
          dependencyName,
          dependencyId,
          error: matchedBranches?.error ? matchedBranches.error : null,
          branches: matchedBranches ? matchedBranches.branches : [],
          createBranchesStatus: "",
          createBranchesMessage: "",
          createPullRequestsStatus: "",
          createPullRequestsMessage: "",
          createBranches: true,
          createPullRequests: true,
          prLink: "",
          dependentApplications: [],
          build: {
            cancelled: 0,
            successful: 0,
            inProgress: 0,
            failed: 0,
            unknown: 0,
          },
        });
      }

      const appId = createIdFromParts(
        app.project,
        app.application,
        app.moduleName,
        dependencyName
      );

      repoMap.get(repoKey)!.dependentApplications.push({
        id: appId,
        projectName: app.project,
        repoName: app.application,
        moduleName: app.moduleName,
        updateDpendencyVersion: true,
        updateDpendencyVersionstatus: "",
        updateDpendencyVersionmessage: "",
        pomFileId: "",
      });
    });

    repoMap.forEach((repo) => {
      dispatch(addDependentRepository(repo));
    });

    dispatch(updateDependencyStatus({ name: dependencyName, status: "none" }));

    toast.success(`Dependency '${dependencyName}' loaded successfully.`);
  } catch (err: any) {
    console.error(
      `Failed to fetch metadata or branches for ${dependencyName}`,
      err
    );
    toast.error(
      `Failed to load dependency '${dependencyName}'. ${err.response.data}`
    );
  }
};
