import { useMousePosition } from "../hooks/useMousePosition";
import { useContainerContext } from "../context/ContainerContext";
import { useEffect, useState } from "react";
import type { ContainerSnapshot } from "../types/container";
import { twMerge } from "tailwind-merge";
import { motion } from "motion/react";

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

const ATTACH_DISTANCE_THRESHOLD = 30;

const Assistant = () => {
  const { x, y } = useMousePosition();
  const {
    getContainerIds,
    getContainerById,
    getAllSnapshots,
    attachedId,
    setAttachedId,
  } = useContainerContext();
  const [closestInfo, setClosestInfo] = useState<ClosestResult | null>(null);
  const [allSnapshots, setAllSnapshots] = useState<ContainerSnapshot[]>([]);
  const [isHoveringAssistant, setIsHoveringAssistant] = useState(false);

  // attach to closest container if within threshold
  useEffect(() => {
    if (
      closestInfo?.containerId &&
      closestInfo.distance < ATTACH_DISTANCE_THRESHOLD
    ) {
      if (attachedId !== closestInfo.containerId) {
        setAttachedId(closestInfo.containerId);
      }
    } else if (attachedId && !isHoveringAssistant) {
      setAttachedId(null); // 👈 de-attach
    }
  }, [closestInfo, attachedId, setAttachedId, isHoveringAssistant]);

  // update all snapshots on mouse move
  useEffect(() => {
    const snapshots = getAllSnapshots();

    setAllSnapshots((prev) => {
      const unchanged =
        prev.length === snapshots.length &&
        prev.every(
          (s, i) =>
            s.id === snapshots[i].id && s.innerHTML === snapshots[i].innerHTML,
        );
      return unchanged ? prev : snapshots;
    });
  }, [x, y, getAllSnapshots]);

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

        const stillValid =
          inside || distance < ATTACH_DISTANCE_THRESHOLD || isHoveringAssistant;
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

    if (!closestId) {
      closest = computeClosestInfoToScreenEdge(x, y);
    }

    setClosestInfo(closest);
  }, [x, y, attachedId, getContainerIds, getContainerById]);

  const analyse = () => {
    if (!attachedId && !closestInfo?.containerId) return;

    const containerId = closestInfo?.containerId || attachedId;
    if (!containerId) return;

    const snapshot = allSnapshots.find((s) => s.id === containerId);
    if (!snapshot) return;

    console.log("Analyzing snapshot:", snapshot);
  };

  function getTransform(edge: Edge, isAttached: boolean): string {
    if (isAttached) {
      return {
        left: "translateX(-100%) translateY(-50%)",
        right: "translateX(0) translateY(-50%)",
        top: "translateX(-50%) translateY(-100%)",
        bottom: "translateX(-50%) translateY(0)",
      }[edge];
    } else {
      return {
        left: "translateX(-150%) translateY(-50%)",
        right: "translateX(50%) translateY(-50%)",
        top: "translateY(-150%) translateX(-50%)",
        bottom: "translateY(50%) translateX(-50%)",
      }[edge];
    }
  }

  return (
    <motion.button
      animate={{
        left: attachedId && closestInfo ? closestInfo.point.x : x,
        top: attachedId && closestInfo ? closestInfo.point.y : y,
        transform:
          attachedId && closestInfo
            ? getTransform(closestInfo.edge, true)
            : closestInfo
              ? getTransform(closestInfo.edge, false)
              : "translate(50%, 50%)",
      }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={twMerge(
        attachedId
          ? `pointer-events-auto cursor-pointer bg-purple-500 transition-[border-radius] duration-800 ${
              closestInfo?.edge === "left"
                ? "rounded-l-full"
                : closestInfo?.edge === "right"
                  ? "rounded-r-full"
                  : closestInfo?.edge === "top"
                    ? "rounded-t-full"
                    : "rounded-b-full"
            }`
          : "pointer-events-none rounded-full bg-neutral-800 transition-[border-radius] duration-800",
        "z-[9999] p-3 text-sm font-bold text-white",
      )}
      style={{ position: "fixed" }}
      onClick={analyse}
      onMouseEnter={() => setIsHoveringAssistant(true)}
      onMouseLeave={() => {
        setTimeout(() => setIsHoveringAssistant(false), 100);
      }}
    >
      Assistant
    </motion.button>
  );
};

export default Assistant;
