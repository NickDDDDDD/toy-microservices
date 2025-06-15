// context/ContainerContext.tsx
import { createContext, useContext, useState, useCallback } from "react";
import type { ContainerInfo, ContainerSnapshot } from "../types/container"; // Adjust the import path as needed
import type { ReactNode } from "react";

type ContainerContextType<T = unknown> = {
  register: (info: ContainerInfo<T>) => void;
  unregister: (id: string) => void;
  getContainerIds: () => string[];
  getAllContainers: () => ContainerInfo<T>[];
  getContainerById: (id: string) => ContainerInfo<T> | undefined;
  getAllSnapshots: () => ContainerSnapshot[];
  attachedId: string | null;
  setAttachedId: (id: string | null) => void;
};

const ContainerContext = createContext<ContainerContextType | null>(null);

export const ContainerContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [containers, setContainers] = useState<ContainerInfo[]>([]);
  const [attachedId, setAttachedId] = useState<string | null>(null);

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

  const getAllContainers = useCallback(() => containers, [containers]);

  const getContainerById = useCallback(
    (id: string) => containers.find((c) => c.id === id),
    [containers],
  );

  const getAllSnapshots = useCallback((): ContainerSnapshot[] => {
    return containers
      .map((c) => c.apiRef.current?.getSnapshot?.() ?? null)
      .filter((s): s is ContainerSnapshot => s !== null);
  }, [containers]);

  return (
    <ContainerContext.Provider
      value={{
        register,
        unregister,
        getContainerIds,
        getAllContainers,
        getContainerById,
        getAllSnapshots,
        attachedId,
        setAttachedId,
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
