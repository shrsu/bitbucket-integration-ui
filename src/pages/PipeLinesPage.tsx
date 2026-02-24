import React from "react";
import PipeLinesList from "@/components/pipelineComponents/PipelinesList";
import SupportedDependenciesList from "@/components/pipelineComponents/SupportedDependenciesList";
import { Button } from "@/components/ui/button";
import { FileSliders } from "lucide-react";
import { Link } from "react-router-dom";

const PipeLinesPage: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <SupportedDependenciesList />
        <Link to={"/editor"}>
          <Button variant="outline">
            <FileSliders className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="mt-8">
        <PipeLinesList />
      </div>
    </div>
  );
};

export default PipeLinesPage;
