// context/ContainerContext.tsx
import { createContext, useContext, useState, useCallback } from "react";
import type { ContainerInfo } from "../types/container"; // Adjust the import path as needed
import type { ReactNode } from "react";

type ContainerContextType<T = unknown> = {
  register: (info: ContainerInfo<T>) => void;
  unregister: (id: string) => void;
  getContainerIds: () => string[];
  getOtherContainers: (selfId: string) => ContainerInfo<T>[];
  getContainerById: (id: string) => ContainerInfo<T> | undefined;
};

const ContainerContext = createContext<ContainerContextType | null>(null);

export const ContainerContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [containers, setContainers] = useState<ContainerInfo[]>([]);

  const register = useCallback((info: ContainerInfo) => {
    setContainers((prev) => [...prev, info]);
  }, []);

  const unregister = useCallback((id: string) => {
    setContainers((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const getContainerIds = useCallback(
    () => containers.map((c) => c.id),
    [containers],
  );

  const getOtherContainers = useCallback(
    (selfId: string) => containers.filter((c) => c.id !== selfId),
    [containers],
  );

  const getContainerById = useCallback(
    (id: string) => containers.find((c) => c.id === id),
    [containers],
  );

  return (
    <ContainerContext.Provider
      value={{
        register,
        unregister,
        getContainerIds,
        getOtherContainers,
        getContainerById,
      }}
    >
      {children}
    </ContainerContext.Provider>
  );
};

export const useContainerContext = () => {
  const ctx = useContext(ContainerContext);
  if (!ctx) throw new Error("Must use inside <ContainerContextProvider>");
  return ctx;
};
