import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useLoader } from "@/hooks/useLoader";
import {
  deselectRepository,
  removeProject,
} from "@/redux/slices/createBranchesAndPrsSlices/branchActionsDataSlice";
import type { AppDispatch, RootState } from "@/redux/store";
import { FaLink } from "react-icons/fa6";
import { IoGitBranchSharp } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import { TbRefresh } from "react-icons/tb";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Separator } from "../ui/separator";
import SelectRepositoriesPopOver from "./SelectRepositoriesPopOver";
import { getRepositories } from "./branchActions/getRepositories";
import { type Repository } from "@/redux/slices/createBranchesAndPrsSlices/branchActionsDataSlice";
interface ProjectCardProps {
  projectName: string;
}

import { IoGitPullRequest } from "react-icons/io5";
import BranchActionPullRequestsSection from "./BranchActionPullRequestsSection";

function ProjectCard({ projectName }: ProjectCardProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { showLoader, hideLoader } = useLoader();

  const project = useSelector((state: RootState) =>
    state.branchActionsData.projects.find((p) => p.name === projectName)
  );

  if (!project) return null;

  const allRepositories: Repository[] = [
    ...project.selectedRepositories,
    ...project.repositories,
  ];

  const repositoriesWithPRLinks = allRepositories.filter(
    (repo) => !!repo.pullRequestLink
  );

  const handleRefresh = async () => {
    try {
      showLoader("Refreshing the repositories list...");

      const requestBody = {
        projectName,
      };

      await getRepositories(dispatch, projectName, requestBody);
    } catch (error) {
      console.error("Error refreshing repositories list:", error);
    } finally {
      hideLoader();
    }
  };

  const handleRemove = () => {
    dispatch(removeProject(projectName));
  };

  return (
    <Card>
      <CardHeader className="w-full flex justify-between">
        <h2 className="font-bold">{project.name}</h2>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="text-xs h-7 w-7"
          >
            <TbRefresh />
          </Button>

          <Button
            onClick={handleRemove}
            variant="destructive"
            size="sm"
            className="text-xs h-7 w-7"
          >
            <RxCross2 size={12} />
          </Button>
        </div>
      </CardHeader>

      <Separator />

      <CardContent>
        <div className="flex justify-end">
          <HoverCard openDelay={150}>
            <HoverCardTrigger asChild>
              <Button variant="outline">Select Repositories</Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-84 p-3 -translate-x-12 shadow-lg border">
              <SelectRepositoriesPopOver projectName={projectName} />
            </HoverCardContent>
          </HoverCard>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,_minmax(500px,1fr))] gap-3 mt-4 max-h-[60vh] overflow-y-auto pr-3">
          {project.selectedRepositories.map((repo) => (
            <div
              key={repo.name}
              className="p-2 pl-4 border rounded-md flex items-center justify-between group overflow-hidden"
            >
              <div className="flex items-center">
                <button
                  className="opacity-0 p-[1px] bg-destructive border border-destructive rounded group-hover:opacity-100 transition-opacity text-white"
                  onClick={() =>
                    dispatch(
                      deselectRepository({
                        projectName,
                        repositoryName: repo.name,
                      })
                    )
                  }
                >
                  <RxCross2 size={12} />
                </button>
                <span className="transition-transform text-sm p-1 duration-200 transform group-hover:translate-x-2 truncate">
                  {repo.name}
                </span>
              </div>

              <div className="flex items-center gap-2 pr-4">
                {repo.createPullRequestStatus && (
                  <HoverCard>
                    <HoverCardTrigger asChild className="text-xs">
                      <span className="cursor-pointer">
                        {repo.createPullRequestStatus?.toLowerCase() ===
                        "success" ? (
                          <IoGitPullRequest className="h-4 w-4 text-[#4BC78E]" />
                        ) : (
                          <IoGitPullRequest className="h-4 w-4 text-destructive" />
                        )}
                      </span>
                    </HoverCardTrigger>
                    <HoverCardContent className="text-xs space-y-1">
                      <div
                        className={`${
                          repo.createPullRequestStatus?.toLowerCase() ===
                          "success"
                            ? "text-[#4BC78E]"
                            : "text-destructive"
                        }`}
                      >
                        <strong>
                          {" "}
                          Create Pull Request Status:{" "}
                          {repo.createPullRequestStatus}
                        </strong>
                      </div>
                      <div>{repo.createPullRequestMessage || "N/A"}</div>
                    </HoverCardContent>
                  </HoverCard>
                )}
                {repo.pullRequestLink?.trim() && (
                  <a
                    href={repo.pullRequestLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open Pull Request"
                    className="text-primary"
                  >
                    <Button variant={"ghost"}>
                      <FaLink size={18} />
                    </Button>
                  </a>
                )}
                {repo.createBranchesStatus && (
                  <HoverCard>
                    <HoverCardTrigger asChild className="text-xs">
                      <span className="cursor-pointer">
                        {repo.createBranchesStatus?.toLowerCase() ===
                        "success" ? (
                          <IoGitBranchSharp className="h-4 w-4 text-[#4BC78E]" />
                        ) : (
                          <IoGitBranchSharp className="h-4 w-4 text-destructive" />
                        )}
                      </span>
                    </HoverCardTrigger>
                    <HoverCardContent className="text-xs space-y-1">
                      <div
                        className={`${
                          repo.createBranchesStatus?.toLowerCase() === "success"
                            ? "text-[#4BC78E]"
                            : "text-destructive"
                        }`}
                      >
                        <strong>
                          {" "}
                          Create Branch Status: {repo.createBranchesStatus}
                        </strong>
                      </div>
                      <div>{repo.createBranchesMessage || "N/A"}</div>
                    </HoverCardContent>
                  </HoverCard>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      {repositoriesWithPRLinks?.length > 0 && (
        <CardFooter>
          <BranchActionPullRequestsSection
            projectName={project.name}
            repositoriesWithPRLinks={repositoriesWithPRLinks}
          />
        </CardFooter>
      )}
    </Card>
  );
}

export default ProjectCard;
