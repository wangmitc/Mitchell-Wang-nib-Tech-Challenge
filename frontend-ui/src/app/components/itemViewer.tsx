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
});

const State = styled("div")({
  marginTop: "1rem",
});

const Viewport = styled("div")({
  overflow: "hidden",
  width: "100%",
  maxWidth: "60rem",
  borderRadius: 12,
  background: "#f3f3f3",
  maxHeight: "35rem",
});

const Track = styled("div")({
  display: "flex",
  height: "100%",
});

const Slide = styled("div")({
  minWidth: "100%",
  flex: "0 0 100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
});

export default function ItemViewer() {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [emblaRef] = useEmblaCarousel();

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
    </Container>
  );
}

