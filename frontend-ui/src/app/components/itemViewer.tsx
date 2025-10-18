"use client"

import React, { useEffect, useState } from "react";

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
    <div>
    </div>
  );
}

