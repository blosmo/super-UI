import { ImageGeneration } from "img-fx";
export default function LibraryImage({ dark = false }: { dark?: boolean }) {
  return (
    <ImageGeneration preset="pixels-organic" theme={dark ? "dark" : "light"}>
      <div
        style={{
          width: 220,
          height: 155,
          borderRadius: 18,
          background: "#d3d8e2",
        }}
        aria-label="Animated image generation shader"
      />
    </ImageGeneration>
  );
}
