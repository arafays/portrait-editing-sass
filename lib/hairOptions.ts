export const DENSITY_OPTIONS = ["thin", "medium", "thick"] as const;
export const LENGTH_OPTIONS = [
  "buzz cut",
  "short",
  "medium",
  "long",
  "very long",
] as const;
export const TEXTURE_OPTIONS = ["straight", "wavy", "curly", "coily"] as const;
export const COLOR_OPTIONS = [
  "black",
  "dark brown",
  "brown",
  "light brown",
  "blonde",
  "auburn",
  "red",
  "gray",
  "white",
] as const;
export const HAIRLINE_OPTIONS = [
  "straight",
  "receding",
  "widow's peak",
  "rounded",
  "M-shaped",
] as const;

export type Density = (typeof DENSITY_OPTIONS)[number];
export type Length = (typeof LENGTH_OPTIONS)[number];
export type Texture = (typeof TEXTURE_OPTIONS)[number];
export type Color = (typeof COLOR_OPTIONS)[number];
export type Hairline = (typeof HAIRLINE_OPTIONS)[number];

export interface HairParams {
  density: Density;
  length: Length;
  texture: Texture;
  color: Color;
  hairline: Hairline;
}

export const DEFAULT_HAIR_PARAMS: HairParams = {
  density: "medium",
  length: "medium",
  texture: "straight",
  color: "black",
  hairline: "straight",
};

export const HAIR_FIELDS: {
  key: keyof HairParams;
  label: string;
  options: readonly string[];
}[] = [
  { key: "density", label: "Density", options: DENSITY_OPTIONS },
  { key: "length", label: "Length", options: LENGTH_OPTIONS },
  { key: "texture", label: "Texture", options: TEXTURE_OPTIONS },
  { key: "color", label: "Color", options: COLOR_OPTIONS },
  { key: "hairline", label: "Hairline", options: HAIRLINE_OPTIONS },
];
