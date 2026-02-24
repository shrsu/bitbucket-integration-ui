import { type RootState } from "@/redux/store";
import React from "react";
import { useSelector } from "react-redux";
import Pipeline from "./Pipeline";

interface Dependency {
  id: string;
}

const PipeLinesList: React.FC = () => {
  const addedDependencies: Dependency[] = useSelector(
    (state: RootState) => state.dependencies.addedDependencies
  );

  return (
    <div>
      {addedDependencies.map((dep) => (
        <div className="bg-card rounded-lg border mb-4" key={dep.id}>
          <Pipeline id={dep.id} />
        </div>
      ))}
    </div>
  );
};

export default PipeLinesList;
