// types/container.ts
import type { RefObject } from "react";

export type ContainerPublicAPI = {
  id: string;
  getSnapshot: () => Record<string, unknown>;
};

export type ContainerInternalAPI = {
  id: string;
  getSnapshot: () => Record<string, unknown>;
  getOtherSnapshots: () => { id: string; snapshot: Record<string, unknown> }[];
};

export type ContainerInfo<T = unknown> = {
  id: string;
  apiRef: RefObject<ContainerPublicAPI | null>;
  domRef: RefObject<HTMLElement | null>;

  data?: T;
};

export type ElementSummary = {
  tag: string;
  classList: string[];
  boundingRect: DOMRect;
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
  containerRect: DOMRect;
  childrenSummary: ElementSummary[];
};
