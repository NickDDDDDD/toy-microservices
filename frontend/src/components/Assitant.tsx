import { useMousePosition } from "../hooks/useMousePosition";
import { useContainerContext } from "../context/ContainerContext";
import { useEffect, useState } from "react";
import type { ContainerSnapshot } from "../types/container";
type Edge = "left" | "right" | "top" | "bottom";

type ClosestResult = {
  edge: Edge;
  distance: number;
  point: { x: number; y: number };
  containerId?: string;
};

function computeClosestInfo(
  mouseX: number,
  mouseY: number,
  rect: DOMRect,
): ClosestResult {
  const isLeft = mouseX < rect.left;
  const isRight = mouseX > rect.right;
  const isAbove = mouseY < rect.top;
  const isBelow = mouseY > rect.bottom;

  let edge: Edge;

  if ((isLeft || isRight) && (isAbove || isBelow)) {
    // diagonal case
    const dx = isLeft ? rect.left - mouseX : mouseX - rect.right;
    const dy = isAbove ? rect.top - mouseY : mouseY - rect.bottom;
    edge = dx > dy ? (isLeft ? "left" : "right") : isAbove ? "top" : "bottom";
  } else if (isLeft) {
    edge = "left";
  } else if (isRight) {
    edge = "right";
  } else if (isAbove) {
    edge = "top";
  } else {
    edge = "bottom";
  }

  // 🎯 Step 2: 计算 attach 点 + 距离
  let point: { x: number; y: number };
  let distance: number;

  switch (edge) {
    case "left":
      point = { x: rect.left, y: clamp(mouseY, rect.top, rect.bottom) };
      distance = Math.abs(mouseX - rect.left);
      break;
    case "right":
      point = { x: rect.right, y: clamp(mouseY, rect.top, rect.bottom) };
      distance = Math.abs(mouseX - rect.right);
      break;
    case "top":
      point = { x: clamp(mouseX, rect.left, rect.right), y: rect.top };
      distance = Math.abs(mouseY - rect.top);
      break;
    case "bottom":
      point = { x: clamp(mouseX, rect.left, rect.right), y: rect.bottom };
      distance = Math.abs(mouseY - rect.bottom);
      break;
  }

  return { edge, point, distance };
}

function computeClosestInfoToScreenEdge(x: number, y: number): ClosestResult {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const distances = {
    left: x,
    right: vw - x,
    top: y,
    bottom: vh - y,
  };

  const edge = Object.entries(distances).reduce(
    (minEdge, [key, val]) =>
      val < distances[minEdge as Edge] ? (key as Edge) : (minEdge as Edge),
    "left" as Edge,
  );

  let point: { x: number; y: number };

  switch (edge) {
    case "left":
      point = { x: 0, y };
      break;
    case "right":
      point = { x: vw, y };
      break;
    case "top":
      point = { x, y: 0 };
      break;
    case "bottom":
      point = { x, y: vh };
      break;
  }

  return { edge, point, distance: distances[edge] };
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(val, max));
}

const ATTACH_DISTANCE_THRESHOLD = 50;

const Assistant = () => {
  const { x, y } = useMousePosition();
  const { getContainerIds, getContainerById } = useContainerContext();
  const [attachedId, setAttachedId] = useState<string | null>(null);
  const [closestInfo, setClosestInfo] = useState<ClosestResult | null>(null);
  const [closestSnapshot, setClosestSnapshot] =
    useState<ContainerSnapshot | null>(null);

  // attach to closest container if within threshold
  useEffect(() => {
    if (
      closestInfo?.containerId &&
      closestInfo.distance < ATTACH_DISTANCE_THRESHOLD
    ) {
      if (attachedId !== closestInfo.containerId) {
        setAttachedId(closestInfo.containerId);
      }
    } else if (attachedId) {
      setAttachedId(null); // 👈 de-attach
    }
  }, [closestInfo, attachedId]);

  // compute closest container on mouse move
  useEffect(() => {
    if (attachedId) {
      const container = getContainerById(attachedId);
      const rect = container?.domRef.current?.getBoundingClientRect();

      if (rect) {
        const { distance } = computeClosestInfo(x, y, rect);
        const inside =
          x >= rect.left &&
          x <= rect.right &&
          y >= rect.top &&
          y <= rect.bottom;

        const stillValid = inside || distance < ATTACH_DISTANCE_THRESHOLD;
        if (stillValid) return;
      }
    }
    let closest: ClosestResult | null = null;
    let closestId: string | null = null;
    let closestDistance = Infinity;

    for (const id of getContainerIds()) {
      const container = getContainerById(id);
      const rect = container?.domRef.current?.getBoundingClientRect();
      if (!rect) continue;

      const info = computeClosestInfo(x, y, rect);
      if (info.distance < closestDistance) {
        closestDistance = info.distance;
        closestId = id;
        closest = { ...info, containerId: id };
      }
    }
    if (closestId) {
      const cloestContainer = getContainerById(closestId);
      const snapshot = cloestContainer?.apiRef.current?.getSnapshot?.();
      console.log("📸 Closest container snapshot:", snapshot);
    }

    if (!closestId) {
      closest = computeClosestInfoToScreenEdge(x, y);
    }

    setClosestInfo(closest);
  }, [x, y, attachedId, getContainerIds, getContainerById]);

  let style: React.CSSProperties;

  if (attachedId && closestInfo) {
    style = {
      position: "fixed",
      left: closestInfo.point.x,
      top: closestInfo.point.y,
      transform:
        closestInfo.edge === "left"
          ? "translateX(-100%) translateY(-50%)"
          : closestInfo.edge === "right"
            ? "translateX(0) translateY(-50%)"
            : closestInfo.edge === "top"
              ? "translateX(-50%) translateY(-100%) "
              : "translateX(-50%) translateY(0)",
    };
  } else if (!attachedId && closestInfo) {
    style = {
      position: "fixed",
      left: x,
      top: y,
      transform:
        closestInfo.edge === "left"
          ? "translateX(-150%) translateY(-50%)"
          : closestInfo.edge === "right"
            ? "translateX(50%) translateY(-50%)"
            : closestInfo.edge === "top"
              ? "translateY(-150%) translateX(-50%)"
              : "translateY(50%) translateX(-50%)",
    };
  } else {
    style = {
      position: "fixed",
      left: x,
      top: y,
      transform: "translate(50%, 50%)",
    };
  }

  return (
    <div
      className="pointer-events-none z-[9999] rounded-lg bg-neutral-800 px-3 py-2 text-sm text-white"
      style={style}
    >
      Assistant
    </div>
  );
};

export default Assistant;
