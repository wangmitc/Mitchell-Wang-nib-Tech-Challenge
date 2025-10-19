"use client";

import React from "react";
import { createPortal } from "react-dom";
import { styled } from "@mui/system";

const Overlay = styled("div")({
  position: "fixed",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(0,0,0,0.7)",
  zIndex: 9999,
});

const Inner = styled("div")({
  maxWidth: "90%",
  maxHeight: "90%",
  position: "relative",
});

const Img = styled("img")({
  maxWidth: "100%",
  maxHeight: "100%",
  display: "block",
  borderRadius: 8,
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

type Props = {
  src: string | null;
  alt?: string;
  onClose: () => void;
};

export default function Lightbox({ src, alt = "Image", onClose }: Props) {
  const closeRef = React.useRef<HTMLButtonElement | null>(null);
  const lastActiveRef = React.useRef<HTMLElement | null>(null);
  const portalRoot = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (typeof window !== "undefined" && !portalRoot.current) portalRoot.current = document.body;
  }, []);

  React.useEffect(() => {
    if (!src) return;
    lastActiveRef.current = document.activeElement as HTMLElement | null;
    // focus close button after mount
    setTimeout(() => closeRef.current?.focus(), 0);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
      if (e.key === "Tab") {
        // simple trap: keep focus on close button
        e.preventDefault();
        closeRef.current?.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lastActiveRef.current?.focus();
    };
  }, [src, onClose]);

  if (!src || !portalRoot.current) return null;

  const onOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return createPortal(
    <Overlay role="dialog" aria-modal="true" onClick={onOverlayClick} tabIndex={-1}>
      <Inner>
        <CloseButton ref={closeRef} aria-label="Close" onClick={onClose}>
          ×
        </CloseButton>
        <Img src={src} alt={alt} />
      </Inner>
    </Overlay>,
    portalRoot.current
  );
}
