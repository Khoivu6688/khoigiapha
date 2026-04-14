"use client";

import { useEffect, useState } from "react";
import LandingOverlayHero from "./LandingOverlayHero";

export default function LandingOverlay() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("seenLanding");
    if (!seen) setShow(true);
  }, []);

  if (!show) return null;

  return <LandingOverlayHero />;
}
