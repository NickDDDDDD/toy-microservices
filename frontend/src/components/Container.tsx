// components/AIContainer.tsx
import { useEffect, useRef, useCallback } from "react";
import type { ReactNode } from "react";
import { useContainerContext } from "../context/ContainerContext";
import { useAIWebSocket } from "../context/AIWebsocketContext";
import type {
  ContainerPublicAPI,
  ContainerSnapshot,
  ElementSummary,
} from "../types/container";
import { twMerge } from "tailwind-merge";

function serializeDOMRect(rect: DOMRect) {
  return {
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
  };
}

export const AIContainer = ({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const { lastMessage } = useAIWebSocket();

  const apiRef = useRef<ContainerPublicAPI | null>(null);
  const { register, unregister, attachedId } = useContainerContext();

  const getSnapshot = useCallback((): ContainerSnapshot => {
    const wrapper = wrapperRef.current;

    if (!wrapper) {
      return {
        id,
        innerHTML: "<!-- container not mounted -->",
        containerRect: { x: 0, y: 0, width: 0, height: 0 },
        childrenSummary: [],
      };
    }

    const innerHTML = wrapper.innerHTML;
    const containerRect = serializeDOMRect(wrapper.getBoundingClientRect());

    const elements = Array.from(wrapper.querySelectorAll("*"));

    const childrenSummary: ElementSummary[] = elements.map((el) => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);

      return {
        tag: el.tagName.toLowerCase(),
        classList: Array.from(el.classList),
        boundingRect: serializeDOMRect(rect),
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
    <div className="relative h-fit w-fit">
      <div
        className={twMerge(
          attachedId === id ? "ring-4 ring-purple-500/80" : "",
          "relative h-fit w-fit overflow-hidden rounded-4xl transition-all duration-800",
        )}
        ref={wrapperRef}
      >
        {children}
      </div>
      {attachedId === id && lastMessage && (
        <div className="absolute top-0 left-full z-[9998] ml-2 w-96 rounded-lg bg-white p-4 text-black shadow-lg">
          <h3 className="mb-2 text-sm font-semibold text-purple-600">
            AI Insight
          </h3>
          <p className="text-sm whitespace-pre-line">
            {JSON.stringify(lastMessage.content, null, 2)}
          </p>
        </div>
      )}
    </div>
  );
};
