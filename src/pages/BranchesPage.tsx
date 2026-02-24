import BranchActions from "@/components/branchActionsComponents/BranchActions";
import ProjectCard from "@/components/branchActionsComponents/ProjectCard";
import SupportedProjects from "@/components/branchActionsComponents/SupportedProjects";
import type { RootState } from "@/redux/store";
import { useSelector } from "react-redux";

function BranchesPage() {
  const projects = useSelector(
    (state: RootState) => state.branchActionsData.projects
  );

  return (
    <div className="p-6 space-y-6">
      <BranchActions />

      <div className="flex w-full justify-end mt-8">
        <SupportedProjects />
      </div>
     <div className="mb-8 flex flex-col gap-4 pb-4">
        {projects.map((project) => (
          <ProjectCard key={project.name} projectName={project.name} />
        ))}
      </div>
    </div>
  );
}

export default BranchesPage;
