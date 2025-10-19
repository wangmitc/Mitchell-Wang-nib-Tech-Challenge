"use client";

import React from "react";
import { styled } from "@mui/system";

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

const Image = styled("img")({
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
  cursor: "pointer",
  borderRadius: 12,
});

type Props = {
  emblaRef: any;
  images: string[];
  onImageClick: (src: string) => void;
};

export default function ViewportCarousel({ emblaRef, images, onImageClick }: Props) {
  return (
    <Viewport ref={emblaRef}>
      <Track>
        {images.map((src, i) => (
          <Slide key={src + i}>
            <Image
              src={src}
              alt={`Dog Image ${i + 1}/${images.length}`}
              tabIndex={0}
              onClick={() => onImageClick(src)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onImageClick(src);
              }}
            />
          </Slide>
        ))}
      </Track>
    </Viewport>
  );
}
