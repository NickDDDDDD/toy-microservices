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

export type ContainerSnapshot = {
  id: string;
  metadata: {
    tagCount: Record<string, number>;
    textContent: string;
    childCount: number;
  };
};
