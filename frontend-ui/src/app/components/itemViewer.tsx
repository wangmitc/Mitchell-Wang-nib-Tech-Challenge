"use client";

import React, { useEffect, useState } from "react";
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

export default function ItemViewer() {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel();

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  useEffect(() => {
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

  return (
    <Container>
      <Title>Very Cool Dog Images 🐕</Title>
      {loading && <State>Loading images…</State>}
      {error && <State>Error: Something went wrong</State>}
      {!loading && !error && images.length === 0 && <State>No images available</State>}
      <Viewport ref={emblaRef}>
        <Track>
          {images.map((src, i) => (
            <Slide key={src + i} aria-hidden={false}>
              <Image src={src} alt={`Dog Image ${i + 1}/${images.length}`}/>
            </Slide>
          ))}
        </Track>
      </Viewport>
      <ButtonContainer>
        <Button onClick={scrollPrev}>
          Previous
        </Button>
        <Button onClick={scrollNext}>
          Next
        </Button>
      </ButtonContainer>
    </Container>
  );
}

