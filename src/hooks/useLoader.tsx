import { createContext, useContext, useState, type FC, type ReactNode } from "react";

interface LoaderContextType {
  isVisible: boolean;
  message: string;
  showLoader: (msg?: string) => void;
  hideLoader: () => void;
}

const LoaderContext = createContext<LoaderContextType | null>(null);

interface LoaderProviderProps {
  children: ReactNode;
}

export const LoaderProvider: FC<LoaderProviderProps> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState("Loading...");

  const showLoader = (msg = "Loading...") => {
    setMessage(msg);
    setIsVisible(true);
  };

  const hideLoader = () => {
    setIsVisible(false);
  };

  return (
    <LoaderContext.Provider
      value={{ showLoader, hideLoader, isVisible, message }}
    >
      {children}
    </LoaderContext.Provider>
  );
};

export function useLoader(): LoaderContextType {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error("useLoader must be used within a LoaderProvider");
  }
  return context;
}
