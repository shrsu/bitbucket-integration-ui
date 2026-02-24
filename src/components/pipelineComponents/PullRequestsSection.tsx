import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  CircleEllipsis,
  SquircleDashed,
  XCircle,
} from "lucide-react";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

import { useEffect } from "react";
import { FaCopy } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Separator } from "../ui/separator";

import { type AddedDependency } from "@/redux/slices/pipelineSlices/dependenciesSlice";
import { type DependentRepository } from "@/redux/slices/pipelineSlices/dependentRepositoriesSlice";
import store, { type AppDispatch, type RootState } from "@/redux/store";
import { handleFetchPullRequestBuilds } from "./pipelineActions/fetchBuilds";

interface PRLinksViewerProps {
  dependency: AddedDependency;
}

const POLL_INTERVAL_MS = 10000;

const PullRequestsSection: React.FC<PRLinksViewerProps> = ({ dependency }) => {
  const dispatch = useDispatch<AppDispatch>();

  const dependentRepositories: DependentRepository[] = useSelector(
    (state: RootState) =>
      state.dependentRepositories.filter(
        (repo) => repo.dependencyId === dependency.id && !!repo.prId
      )
  );

  const copyAllPRs = () => {
    const textToCopy = dependentRepositories
      .filter((repo) => !!repo.prLink)
      .map((repo) => `${repo.repoName}: ${repo.prLink}`)
      .join("\n");

    navigator.clipboard.writeText(textToCopy).then(() => {
      toast("Copied pull requests links to clipboard.");
    });
  };

  const fetchBuilds = () => {
    const currentRepos: DependentRepository[] = store
      .getState()
      .dependentRepositories.filter(
        (repo: any) => repo.dependencyId === dependency.id && !!repo.prId
      );

    void handleFetchPullRequestBuilds(dependency, currentRepos, dispatch);
  };

  useEffect(() => {
    fetchBuilds();

    const intervalId = setInterval(() => {
      fetchBuilds();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="border rounded-lg mt-2">
      <AccordionItem
        value="Pull Request Links"
        className="px-6 bg-card rounded-lg"
      >
        <AccordionTrigger className="cursor-pointer font-bold">
          Pull Request Links
        </AccordionTrigger>
        <AccordionContent className="flex flex-col w-full gap-4 text-sm">
          <Separator className="my-2" />

          <Button
            size="sm"
            className="self-end text-xs"
            variant="outline"
            onClick={copyAllPRs}
          >
            <FaCopy className="mr-2" /> Copy All
          </Button>

          <div className="grid grid-cols-[repeat(auto-fit,_minmax(500px,_1fr))] gap-3 pb-4">
            {dependentRepositories.map((repo) => (
              <div
                key={repo.id}
                className="flex relative flex-col gap-1 p-4 border rounded-md"
              >
                <div className="flex flex-col gap-2">
                  <span className="font-medium">{repo.repoName}:</span>
                  {repo.prLink && (
                    <a
                      href={repo.prLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary block max-w-[95%] truncate whitespace-nowrap overflow-hidden"
                      title={repo.prLink}
                    >
                      {repo.prLink}
                    </a>
                  )}

                  <div className="absolute top-4 right-4">
                    <HoverCard>
                      <HoverCardTrigger
                        asChild
                        className="text-xs cursor-pointer"
                      >
                        <div className="inline-flex items-center space-x-2">
                          {repo.build && (
                            <>
                              {repo.build.successful ? (
                                <div className="inline-flex items-center space-x-1 text-[#4BC78E]">
                                  <CheckCircle className="h-4 w-4" />
                                  <span>{repo.build.successful}</span>
                                </div>
                              ) : (
                                ""
                              )}

                              {repo.build.inProgress ? (
                                <div className="inline-flex items-center space-x-1 text-yellow-500 dark:text-yellow-400">
                                  <SquircleDashed className="h-4 w-4 animate-spin" />
                                  <span>{repo.build.inProgress}</span>
                                </div>
                              ) : (
                                ""
                              )}

                              {repo.build.failed ? (
                                <div className="inline-flex items-center space-x-1 text-destructive">
                                  <XCircle className="h-4 w-4" />
                                  <span>{repo.build.failed}</span>
                                </div>
                              ) : (
                                ""
                              )}
                            </>
                          )}

                          <span className="ml-2 text-xs">
                            <CircleEllipsis className="h-4 w-4" />
                          </span>
                        </div>
                      </HoverCardTrigger>

                      <HoverCardContent className="text-xs space-y-1 w-fit">
                        {!repo.build ? (
                          <div>Build data not available yet.</div>
                        ) : (
                          <>
                            <div>
                              <span className="inline-block w-2 h-2 rounded-full bg-[#4BC78E] mr-2"></span>
                              Successful:
                              <span className="ml-2 font-semibold">
                                {repo.build.successful}
                              </span>
                            </div>
                            <div>
                              <span className="inline-block w-2 h-2 rounded-full bg-destructive mr-2"></span>
                              Failed:
                              <span className="ml-2 font-semibold">
                                {repo.build.failed}
                              </span>
                            </div>
                            <div>
                              <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 dark:bg-yellow-400 mr-2"></span>
                              In Progress:
                              <span className="ml-2 font-semibold">
                                {repo.build.inProgress}
                              </span>
                            </div>
                            <div>
                              <span className="inline-block w-2 h-2 rounded-full bg-gray-500 mr-2"></span>
                              Cancelled:
                              <span className="ml-2 font-semibold">
                                {repo.build.cancelled}
                              </span>
                            </div>
                            <div>
                              <span className="inline-block w-2 h-2 rounded-full bg-primary mr-2"></span>
                              Unknown:
                              <span className="ml-2 font-semibold">
                                {repo.build.unknown}
                              </span>
                            </div>
                          </>
                        )}
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </div>
  );
};

export default PullRequestsSection;
