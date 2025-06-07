import type { BoundingBox } from "@/types/position";
import React, { createContext, useContext, useState } from "react";

const PositionContext = createContext<{
  position: BoundingBox;
  setPosition: React.Dispatch<React.SetStateAction<BoundingBox>>;
} | null>(null);

export const initialPosition = {
  l: 0,
  t: 0,
  r: 0,
  b: 0,
  coord_origin: "",
};

export const PositionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [position, setPosition] = useState<BoundingBox>(initialPosition);

  return (
    <PositionContext.Provider value={{ position, setPosition }}>
      {children}
    </PositionContext.Provider>
  );
};

export const usePosition = () => {
  const context = useContext(PositionContext);
  if (context === null) {
    throw new Error("usePosition should be used within BookParamProvider");
  }
  return context;
};
