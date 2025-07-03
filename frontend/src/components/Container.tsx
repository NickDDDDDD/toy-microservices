// components/Container.tsx
import React, { useEffect, useRef, useCallback } from "react";
import type { ReactNode } from "react";
import { useContainerContext } from "../context/ContainerContext";
import { useAIWebSocket } from "../context/AIWebsocketContext";
import Whisper from "../components/Whisper";

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

export const Container = ({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const { lastMessage } = useAIWebSocket();

  const apiRef = useRef<ContainerPublicAPI | null>(null);
  const { register, unregister, attachedId, setIsHovered } =
    useContainerContext();

  const [insight, setInsight] = React.useState<string | null>(null);

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
    register({ id, apiRef, domRef: wrapperRef, isHovered: false });
    return () => unregister(id);
  }, [id, register, unregister]);

  function hasElementMatching(
    snapshot: ContainerSnapshot | undefined,
    predicate: (el: ElementSummary) => boolean,
  ): boolean {
    if (!snapshot) return false;
    return snapshot.childrenSummary.some(predicate);
  }

  function renderWhisperIfInputExists(): React.ReactElement | null {
    const snapshot = apiRef.current?.getSnapshot();

    const hasTextInput = hasElementMatching(
      snapshot,
      (el) => el.tag === "input",
    );

    if (!hasTextInput) return null;

    return (
      <div className="mt-2 space-y-1">
        <p className="text-xs text-gray-500">
          Input field detected — ready for speech-to-text.
        </p>
        <Whisper />
      </div>
    );
  }

  function isTranscriptMessage(msg: unknown): msg is {
    type: "transcribe_audio_result";
    content: { transcript: string };
  } {
    if (
      typeof msg === "object" &&
      msg !== null &&
      "type" in msg &&
      "content" in msg
    ) {
      const m = msg as { type: unknown; content: unknown };

      return (
        m.type === "transcribe_audio_result" &&
        typeof (m.content as { transcript?: unknown }).transcript === "string"
      );
    }

    return false;
  }

  useEffect(() => {
    if (isTranscriptMessage(lastMessage)) {
      const input = wrapperRef.current?.querySelector("input");
      const transcript = lastMessage.content.transcript;

      if (input instanceof HTMLInputElement) {
        input.focus(); // 聚焦以模拟真实用户操作

        input.value = "";

        for (const char of transcript) {
          input.value += char;
          input.dispatchEvent(
            new InputEvent("input", {
              data: char,
              inputType: "insertText",
              bubbles: true,
            }),
          );
        }

        // 添加视觉反馈样式
        input.classList.add("ring-2", "ring-purple-500");

        setTimeout(() => {
          input.classList.remove("ring-2", "ring-purple-500", "rounded-md");
        }, 2000);
      }
    } else if (
      lastMessage?.type === "response" &&
      typeof lastMessage.content === "string"
    ) {
      setInsight(lastMessage.content);
    }
  }, [lastMessage]);

  return (
    <div
      className={twMerge(
        attachedId === id ? "ring-4 ring-purple-500/80" : "",
        "relative h-fit w-fit rounded-4xl transition-all duration-800",
      )}
      onMouseEnter={() => setIsHovered(id, true)}
      onMouseLeave={() => setIsHovered(id, false)}
      ref={wrapperRef}
    >
      {children}
      {attachedId === id && lastMessage && (
        <div className="absolute top-0 left-full z-[9998] ml-2 w-96 rounded-lg bg-white p-4 text-black shadow-lg">
          <h3 className="mb-2 text-sm font-semibold text-purple-600">
            AI Insight
          </h3>
          <p className="text-sm whitespace-pre-line">{insight}</p>
          {renderWhisperIfInputExists()}
        </div>
      )}
    </div>
  );
};
