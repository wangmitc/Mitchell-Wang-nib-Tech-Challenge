"use client";

import React from "react";
import { styled } from "@mui/system";
import useEmblaCarousel from "embla-carousel-react";
import Lightbox from "./Lightbox";
import ViewportCarousel from "./ViewportCarousel";
import ProgressSlider from "./ProgressSlider";

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


const State = styled("div")({
  marginTop: "1rem",
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

export default function ItemViewer() {
  const [images, setImages] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [lightboxSrc, setLightboxSrc] = React.useState<string | null>(null);
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'center', containScroll: 'keepSnaps', dragFree: true, loop: true  });

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();
  const scrollToFirst = () => emblaApi && emblaApi.scrollTo(0);
  const scrollToLast = () => emblaApi && emblaApi.scrollTo(images.length - 1);

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

  return (
    <Container>
      <Title>Very Cool Dog Images 🐕</Title>
      {loading && <State>Loading images…</State>}
      {error && <State>Error: Something went wrong</State>}
      {!loading && !error && images.length === 0 && <State>No images available</State>}
      {!loading && !error && images.length > 0 && (
        <>
          <ViewportCarousel emblaRef={emblaRef} images={images} onImageClick={(src) => setLightboxSrc(src)} />

          <ButtonContainer>
            <Button onClick={scrollToFirst}>Start</Button>
            <Button onClick={scrollPrev}>Previous</Button>
            <Button onClick={scrollNext}>Next</Button>
            <Button onClick={scrollToLast}>Last</Button>
          </ButtonContainer>

          <ProgressSlider
            emblaApi={emblaApi}
            imagesLength={images.length}
            selectedIndex={selectedIndex}
          />
          <Lightbox src={lightboxSrc} alt="Enlarged Dog Image" onClose={() => setLightboxSrc(null)} />
        </>
      )}
    </Container>
  );
}

