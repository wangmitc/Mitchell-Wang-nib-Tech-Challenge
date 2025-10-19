"use client";

import React from "react";
import { styled } from "@mui/system";
import type { EmblaCarouselType } from "embla-carousel";

const Container = styled("div")({
  width: "100%",
  maxWidth: "25%",
  marginTop: "1rem",
});

const Bar = styled("div")({
  width: "100%",
  height: "0.5rem",
  background: "white",
  borderRadius: 999,
  overflow: "hidden",
  cursor: "pointer",
  outline: "none",
  '&:focus': {
    boxShadow: '0 0 0 3px rgba(130,229,120,0.32)',
  },
});

const Fill = styled("div")<{ width?: number }>(({ width = 0 }) => ({
  width: `${width}%`,
  height: "100%",
  background: "#82e578",
  transition: "width 160ms linear",
}));

const Count = styled("div")({
  marginTop: "1rem",
  color: "var(--foreground)",
  fontWeight: 600,
});

type Props = {
  emblaApi: EmblaCarouselType | undefined; // embla API instance (may be undefined before init)
  imagesLength: number;
  selectedIndex: number;
};

export default function ProgressSlider({ emblaApi, imagesLength, selectedIndex }: Props) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragPercentage, setDragPercentage] = React.useState(0);
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);

  const computePosition = (clientX: number) => {
    if (!ref.current) return 0;
    const barRect = ref.current.getBoundingClientRect();
    if (!barRect.width) return 0;
    return Math.max(0, Math.min(1, (clientX - barRect.left) / barRect.width));
  };

  const mapToIndex = (percentage: number) => {
    if (emblaApi) {
      const snaps = emblaApi.scrollSnapList?.() ?? [];
      if (snaps.length) {
        let nearestIndex = 0;
        let nearestDiff = Infinity;
        for (let i = 0; i < snaps.length; i++) {
          const diff = Math.abs(snaps[i] - percentage);
          if (diff < nearestDiff) {
            nearestDiff = diff;
            nearestIndex = i;
          }
        }
        return nearestIndex;
      }
    }
    if (!imagesLength) return 0;
    return Math.round(percentage * (Math.max(1, imagesLength) - 1));
  };

  const commitToIndex = (index: number) => {
    if (emblaApi && typeof emblaApi.scrollTo === "function") {
      emblaApi.scrollTo(index);
    }
  };

  const onClick = (e: React.MouseEvent) => {
    const percentage = computePosition((e as any).clientX);
    commitToIndex(mapToIndex(percentage));
  };

  const startPointer = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setIsDragging(true);
    const percentage = computePosition(e.clientX);
    setDragPercentage(percentage);
    setDragIndex(mapToIndex(percentage));

    const onPointerMove = (ev: PointerEvent) => {
      const percentage = computePosition(ev.clientX);
      setDragPercentage(percentage);
      setDragIndex(mapToIndex(percentage));
    };

    const onPointerUp = (ev: PointerEvent) => {
      const percentage = computePosition(ev.clientX);
      commitToIndex(mapToIndex(percentage));
      cleanup();
    };

    const onPointerCancel = () => cleanup();

    function cleanup() {
      setIsDragging(false);
      setDragIndex(null);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerCancel);
      window.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
    }

    const onVisibility = () => {
      if (document.visibilityState === "hidden") cleanup();
    };

    const onBlur = () => cleanup();

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerCancel);
    window.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
  };

  React.useEffect(() => {
    return () => {
      // ensure any listeners removed on unmount
      window.removeEventListener("pointermove", null as any);
      window.removeEventListener("pointerup", null as any);
      window.removeEventListener("pointercancel", null as any);
      window.removeEventListener("visibilitychange", null as any);
      window.removeEventListener("blur", null as any);
    };
  }, []);

  const percent = isDragging ? Math.round(dragPercentage * 100) : Math.round(((selectedIndex + 1) / Math.max(1, imagesLength)) * 100);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!imagesLength) return;
    const key = e.key;
    if (["ArrowLeft", "ArrowRight", "Home", "End", " "].includes(key)) e.preventDefault();
    let target: number | null = null;
    const idx = selectedIndex ?? 0;
    if (key === "ArrowLeft") target = Math.max(0, idx - 1);
    else if (key === "ArrowRight") target = Math.min(imagesLength - 1, idx + 1);
    else if (key === "Home") target = 0;
    else if (key === "End") target = Math.max(0, imagesLength - 1);
    else if (key === " ") target = Math.min(imagesLength - 1, idx + 1);
    if (target !== null) commitToIndex(target);
  };

  return (
    <Container>
      <Bar
        ref={ref}
        onClick={onClick}
        onPointerDown={startPointer}
        tabIndex={0}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label={`Image progress: ${selectedIndex + 1} of ${imagesLength}`}
        onKeyDown={onKeyDown}
      >
        <Fill width={percent} />
      </Bar>
      <Count>{imagesLength ? `${(isDragging && dragIndex !== null ? dragIndex + 1 : selectedIndex + 1)} / ${imagesLength}` : '0 / 0'}</Count>
    </Container>
  );
}
