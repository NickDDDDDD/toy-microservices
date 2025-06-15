// components/AIContainer.tsx
import { useEffect, useRef, useCallback } from "react";
import type { ReactNode } from "react";
import { useContainerContext } from "../context/ContainerContext";
import type {
  ContainerPublicAPI,
  ContainerSnapshot,
  ElementSummary,
} from "../types/container";
import { twMerge } from "tailwind-merge";

export const AIContainer = ({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const apiRef = useRef<ContainerPublicAPI | null>(null);
  const { register, unregister, attachedId } = useContainerContext();

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

  return (
    <div
      className={twMerge(
        attachedId === id ? "ring-4 ring-purple-500/80" : "",
        "relative h-fit w-fit overflow-hidden rounded-4xl transition-all duration-800",
      )}
      ref={wrapperRef}
    >
      {children}
    </div>
  );
};
