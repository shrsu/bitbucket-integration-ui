import axios, { type AxiosResponse } from "axios";

type APIResponse<T = any> = Promise<AxiosResponse<T>>;
type RequestBody = Record<string, any>;

export interface Application {
  project: string;
  application: string;
  moduleName?: string;
}

export interface BranchesData {
  projectName: string;
  repository: string;
  error?: string;
  status: string;
  branches: { displayId: string }[];
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiConfig = {
  getBranches: `${BASE_URL}${import.meta.env.VITE_ENDPOINT_GET_BRANCHES}`,
  createBranches: `${BASE_URL}${import.meta.env.VITE_ENDPOINT_CREATE_BRANCHES}`,
  createPRs: `${BASE_URL}${import.meta.env.VITE_ENDPOINT_CREATE_PRS}`,
  getFileContent: `${BASE_URL}${
    import.meta.env.VITE_ENDPOINT_GET_FILE_CONTENT
  }`,
  createCommit: `${BASE_URL}${import.meta.env.VITE_ENDPOINT_CREATE_COMMIT}`,
  updateDependency: `${BASE_URL}${
    import.meta.env.VITE_ENDPOINT_UPDATE_DEPENDENCY
  }`,
  getRepositories: `${BASE_URL}${
    import.meta.env.VITE_ENDPOINT_GET_REPOSITORIES
  }`,
  getPRBuilds: `${BASE_URL}${import.meta.env.VITE_ENDPOINT_GET_PR_BUILDS}`,
  getPRBuildLists: `${BASE_URL}${
    import.meta.env.VITE_ENDPOINT_GET_PR_BUILD_LISTS
  }`,
  validateCredentials: `${BASE_URL}${
    import.meta.env.VITE_ENDPOINT_VALIDATE_CREDENTIALS
  }`,
  checkAuthToken: `${BASE_URL}${
    import.meta.env.VITE_ENDPOINT_CHECK_AUTH_TOKEN
  }`,
  logout: `${BASE_URL}${import.meta.env.VITE_ENDPOINT_LOGOUT}`,
  getSupportedDependencies: `${BASE_URL}${
    import.meta.env.VITE_ENDPOINT_GET_SUPPORTED_DEPENDENCIES
  }`,
  getDependentAppsAndVersions: (dep: string) =>
    `${BASE_URL}${import.meta.env.VITE_ENDPOINT_DEPENDENT_APPS_AND_VERSIONS.replace(
      "{depname}",
      dep
    )}`,
};

axios.defaults.withCredentials = true;

export const validateCredentialsAPI = async (authHeader: string): APIResponse =>
  axios.post(
    apiConfig.validateCredentials,
    {},
    {
      headers: {
        Authorization: authHeader,
      },
      withCredentials: true,
    }
  );

export const checkAuthTokenAPI = async (): APIResponse =>
  axios.post(apiConfig.checkAuthToken);

export const logoutAPI = async (): APIResponse => axios.post(apiConfig.logout); // ✅ new logout API

export const getBranchesAPI = async (body: RequestBody): APIResponse =>
  axios.post(apiConfig.getBranches, body);

export const createBranchesAPI = async (body: RequestBody): APIResponse =>
  axios.post(apiConfig.createBranches, body);

export const createPRsAPI = async (body: RequestBody): APIResponse =>
  axios.post(apiConfig.createPRs, body);

export const getFileContentAPI = async (body: RequestBody): APIResponse =>
  axios.post(apiConfig.getFileContent, body);

export const createCommitAPI = async (body: RequestBody): APIResponse =>
  axios.post(apiConfig.createCommit, body);

export const updateDependencyAPI = async (body: RequestBody): APIResponse =>
  axios.post(apiConfig.updateDependency, body);

export const getRepositoriesAPI = async (body: RequestBody): APIResponse =>
  axios.post(apiConfig.getRepositories, body);

export const getPullRequestBuildsAPI = async (body: RequestBody): APIResponse =>
  axios.post(apiConfig.getPRBuilds, body);

export const getPullRequestBuildListsAPI = async (
  body: RequestBody
): APIResponse => axios.post(apiConfig.getPRBuildLists, body);

export const getSupportedDependenciesAPI = async (): APIResponse =>
  axios.get(apiConfig.getSupportedDependencies);

export const getDependentAppsAndVersionsAPI = async (
  depName: string
): APIResponse => axios.get(apiConfig.getDependentAppsAndVersions(depName));
