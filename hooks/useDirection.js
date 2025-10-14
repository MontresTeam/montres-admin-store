"use client";

import { useEffect, useState } from "react";

export function useDirection() {
  const [direction, setDirection] = useState("ltr");

  useEffect(() => {
    const dir = document?.documentElement?.getAttribute("dir") ;
    setDirection(dir || "ltr");
  }, []);

  return direction;
}
