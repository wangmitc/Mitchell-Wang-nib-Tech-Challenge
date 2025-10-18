"use client"

import React, { useEffect, useState } from "react";
import { styled } from '@mui/system';

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
  fontWeight: "700",
  textDecoration: "underline",
  marginBottom: "1rem",
});

const Image = styled("img")({
  maxWidth: "100%",
  height: "auto",
});

const State = styled("div")({
  marginTop: "1rem",
});

export default function ItemViewer() {
  const [images, setImages] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchImages() {
      setLoading(true);
      setError(null);
      try {
        const result = await fetch("https://dog.ceo/api/breed/whippet/images");
        if (!result.ok) throw new Error(`HTTP ${result.status}`);
        const body = await result.json();
        const arr = Array.isArray(body?.message) ? body.message : [];
        setImages(arr);
        setIndex(0);
      } catch (err: any) {
        console.error(err);
        setError(err?.message ?? "Failed to fetch images");
        setImages([]);
      } finally {
        setLoading(false);
      }
    }

    fetchImages();
  }, []);
  const current = images[index];

  return (
    <Container>
        <Title>Dog Images</Title>
        {loading && <State>Loading...</State>}
        {error && <State>Error: Something went wrong</State>}
        {!loading && !error && images.length === 0 && <State>No images available</State>}
        {current && <Image src={current} alt="Dog" />}
    </Container>
  );
}

