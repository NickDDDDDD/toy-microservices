// components/AIContainer.tsx
import {
  useEffect,
  useRef,
  createContext,
  useContext,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import { useContainerContext } from "../context/ContainerContext";
import type {
  ContainerPublicAPI,
  ContainerInternalAPI,
  ContainerSnapshot,
} from "../types/container";

const InternalContainerContext = createContext<ContainerInternalAPI | null>(
  null,
);

export const useMyContainer = () => {
  const ctx = useContext(InternalContainerContext);
  if (!ctx) throw new Error("Must be used inside <AIContainer>");
  return ctx;
};

export const AIContainer = ({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const apiRef = useRef<ContainerPublicAPI | null>(null);
  const { register, unregister, getOtherContainers } = useContainerContext();

  const getSnapshot = useCallback((): ContainerSnapshot => {
    const wrapper = wrapperRef.current;
    if (!wrapper) {
      return {
        id,
        metadata: {
          tagCount: {},
          textContent: "",
          childCount: 0,
        },
      };
    }
    const tagCount: Record<string, number> = {};
    wrapper.querySelectorAll("*").forEach((el) => {
      const tag = el.tagName.toLowerCase();
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    });

    return {
      id,
      metadata: {
        tagCount,
        textContent: wrapper.textContent || "",
        childCount: wrapper.children.length,
      },
    };
  }, [id]);

  useEffect(() => {
    apiRef.current = { id, getSnapshot };
  }, [id, getSnapshot]);

  useEffect(() => {
    register({ id, apiRef, domRef: wrapperRef });
    return () => unregister(id);
  }, [id, register, unregister]);

  const getOtherSnapshots = () =>
    getOtherContainers(id).map((c) => ({
      id: c.id,
      snapshot: c.apiRef.current?.getSnapshot?.() ?? {},
    }));

  return (
    <InternalContainerContext.Provider
      value={{ id, getSnapshot, getOtherSnapshots }}
    >
      <div className="relative h-fit w-fit" ref={wrapperRef}>
        {children}
      </div>
    </InternalContainerContext.Provider>
  );
};
