// types/container.ts
import type { RefObject } from "react";

export type ContainerPublicAPI = {
  id: string;
  getSnapshot: () => ContainerSnapshot;
};

export type ContainerInfo<T = unknown> = {
  id: string;
  apiRef: RefObject<ContainerPublicAPI | null>;
  domRef: RefObject<HTMLElement | null>;

  data?: T;
};

export type SerializableRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ElementSummary = {
  tag: string;
  classList: string[];
  boundingRect: SerializableRect;
  computedStyle: {
    color: string;
    backgroundColor: string;
    fontSize: string;
    fontWeight: string;
  };
  textContent?: string;
};

export type ContainerSnapshot = {
  id: string;
  innerHTML: string;
  containerRect: SerializableRect;
  childrenSummary: ElementSummary[];
};
