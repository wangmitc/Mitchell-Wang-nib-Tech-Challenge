"use client";

import React from "react";
import { styled } from "@mui/system";
import useEmblaCarousel from "embla-carousel-react";

const Container = styled("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
});

const Title = styled("h1")({
  color: "white",
  fontSize: "2rem",
  fontWeight: 700,
  textDecoration: "underline",
  marginBottom: "1rem",
});

const Image = styled("img")({
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
  cursor: "pointer",
  borderRadius: 12,
});

const State = styled("div")({
  marginTop: "1rem",
});

const Viewport = styled("div")({
  overflow: "hidden",
  width: "100%",
  maxWidth: "70rem",
  borderRadius: 12,
  maxHeight: "35rem",
});

const Track = styled("div")({
  display: "flex",
  height: "100%",
});

const Slide = styled("div")({
  flex: "0 0 80%",
  marginRight: "1rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
});

const ButtonContainer = styled("div")({
  marginTop: "1rem",
  display: "flex",
  gap: 8,
});

const Button = styled("button")({
  padding: "0.5rem 1rem",
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
  backgroundColor: "white",
  color: "black",
  fontWeight: 600,
  transition: "background-color 0.3s",
  "&:hover": {
    backgroundColor: "#f0f0f0",
  },
});

const ProgressContainer = styled("div")({
  width: "100%",
  maxWidth: "25%",
  marginTop: "1rem",
});

const ProgressBar = styled("div")({
  width: "100%",
  height: "0.5rem",
  background: "white",
  borderRadius: 999,
  overflow: "hidden",
  cursor: "pointer",
});

const ProgressFill = styled("div")<{ width?: number }>(({ width = 0 }) => ({
  width: `${width}%`,
  height: "100%",
  background: "#82e578",
  transition: "width 240ms ease",
}));

const Count = styled("div")({
  marginTop: "1rem",
  color: "var(--foreground)",
  fontWeight: 600,
});

const LightboxOverlay = styled("div")({
  position: "fixed",
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(0,0,0,0.7)",
  zIndex: 9999,
});

const LightboxInner = styled("div")({
  maxWidth: "90%",
  maxHeight: "90%",
  position: "relative",
});

const LightboxImage = styled("img")({
  maxWidth: "100%",
  maxHeight: "100%",
});

const CloseButton = styled("button")({
  position: "absolute",
  top: "-1rem",
  right: "-1rem",
  width: "2.5rem",
  height: "2.5rem",
  borderRadius: 999,
  border: "none",
  background: "white",
  color: "black",
  cursor: "pointer",
  fontSize: "1.25rem",
  boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
  transition: "background-color 0.3s",
  "&:hover": {
    background: "#f0f0f0",
  },
});

export default function ItemViewer() {
  const [images, setImages] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragPercentage, setDragPercentage] = React.useState(0);
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'center', containScroll: 'keepSnaps', dragFree: true, loop: true  });
  const progressRef = React.useRef<HTMLDivElement | null>(null);
  const [lightboxSrc, setLightboxSrc] = React.useState<string | null>(null);


  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  React.useEffect(() => {
    async function fetchImages() {
      setLoading(true);
      setError(false);
      try {
        const result = await fetch("https://dog.ceo/api/breed/whippet/images");
        if (!result.ok) throw new Error(`HTTP ${result.status}`);
        const body = await result.json();
        const arr = Array.isArray(body?.message) ? body.message : [];
        setImages(arr);
      } catch (err: unknown) {
        console.error(err);
        setError(true);
        setImages([]);
      } finally {
        setLoading(false);
      }
    }

    fetchImages();
  }, []);

  // update selected index when embla changes
  React.useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const getClickPercentage = (e: React.MouseEvent | React.PointerEvent | PointerEvent) => {
    if (!progressRef.current) return 0;
    const barRect = progressRef.current.getBoundingClientRect();
    if (!barRect.width) return 0;
    const clickPercentage = (e.clientX - barRect.left) / barRect.width;
    return Math.max(0, Math.min(1, clickPercentage));
  }

  const getIndexFromPercentage = (percentage: number) => {
    if (!emblaApi) return 0;
    const snapList = emblaApi.scrollSnapList?.() ?? [];
    if (!snapList.length) {
      if (!images.length) return 0;
      return Math.round(percentage * (images.length - 1));
    }

    // Find the snap whose progress value is closest to the percentage
    let nearestIndex = 0;
    let nearestDiff = Infinity;
    for (let i = 0; i < snapList.length; i++) {
      const diff = Math.abs(snapList[i] - percentage);
      if (diff < nearestDiff) {
        nearestDiff = diff;
        nearestIndex = i;
      }
    }
    return nearestIndex;
  };

  const onProgressClick = (e: React.MouseEvent) => {
    if (!progressRef.current || !emblaApi || images.length === 0) return;
    const clickPercentage = getClickPercentage(e);
    const targetIndex = getIndexFromPercentage(clickPercentage);
    emblaApi.scrollTo(targetIndex);
  };

  // pointer-based dragging (desktop & touch)
  const startPointerDrag = (e: React.PointerEvent) => {
    if (!progressRef.current || images.length === 0) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setIsDragging(true);
    const clickPercentage = getClickPercentage(e);
    setDragPercentage(clickPercentage);
    setDragIndex(getIndexFromPercentage(clickPercentage));

    const onPointerMove = (e: PointerEvent) => {
      if (!progressRef.current) return;
      const clickPercentage = getClickPercentage(e);
      setDragPercentage(clickPercentage);
      setDragIndex(getIndexFromPercentage(clickPercentage));
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!progressRef.current || !emblaApi) return cleanup();
      const clickPercentage = getClickPercentage(e);
      emblaApi.scrollTo(getIndexFromPercentage(clickPercentage));
      cleanup();
    };

    function cleanup() {
      setIsDragging(false);
      setDragIndex(null);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    }

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  return (
    <Container>
      <Title>Very Cool Dog Images 🐕</Title>
      {loading && <State>Loading images…</State>}
      {error && <State>Error: Something went wrong</State>}
      {!loading && !error && images.length === 0 && <State>No images available</State>}
      {!loading && !error && images.length > 0 && (
        <>
          <Viewport ref={emblaRef}>
            <Track>
              {images.map((src, i) => (
                <Slide key={src + i} aria-hidden={false}>
                  <Image
                    src={src}
                    alt={`Dog Image ${i + 1}/${images.length}`}
                    onClick={() => setLightboxSrc(src)}
                  />
                </Slide>
              ))}
            </Track>
          </Viewport>

          <ButtonContainer>
            <Button onClick={scrollPrev}>Previous</Button>
            <Button onClick={scrollNext}>Next</Button>
          </ButtonContainer>

          <ProgressContainer>
            <ProgressBar ref={progressRef} onClick={onProgressClick} onPointerDown={startPointerDrag}>
              <ProgressFill
                width={
                  images.length
                    ? isDragging
                      ? Math.round(dragPercentage * 100)
                      : Math.round(((selectedIndex + 1) / images.length) * 100)
                    : 0
                }
              />
            </ProgressBar>
            <Count>
              {images.length
                ? `${(isDragging && dragIndex !== null ? dragIndex + 1 : selectedIndex + 1)} / ${images.length}`
                : "0 / 0"}
            </Count>
          </ProgressContainer>
          {lightboxSrc && (
            <LightboxOverlay
              role="dialog"
              aria-modal="true"
              onClick={(e) => {
                if (e.target === e.currentTarget) setLightboxSrc(null);
              }}
            >
              <LightboxInner>
                <CloseButton
                  aria-label="Close image"
                  onClick={() => setLightboxSrc(null)}
                >
                  ×
                </CloseButton>
                <LightboxImage src={lightboxSrc} alt="Enlarged Dog Image" />
              </LightboxInner>
            </LightboxOverlay>
          )}
        </>
      )}
    </Container>
  );
}

