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
  ElementSummary,
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
        innerHTML: "<!-- container not mounted -->",
        containerRect: new DOMRect(0, 0, 0, 0),
        childrenSummary: [],
      };
    }

    const innerHTML = wrapper.innerHTML;
    const containerRect = wrapper.getBoundingClientRect();

    const elements = Array.from(wrapper.querySelectorAll("*"));

    const childrenSummary: ElementSummary[] = elements.map((el) => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);

      return {
        tag: el.tagName.toLowerCase(),
        classList: Array.from(el.classList),
        boundingRect: rect,
        computedStyle: {
          color: style.color,
          backgroundColor: style.backgroundColor,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
        },
        textContent: el.textContent?.trim() || undefined,
      };
    });

    return {
      id,
      innerHTML,
      containerRect,
      childrenSummary,
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
