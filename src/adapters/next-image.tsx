import type { ImgHTMLAttributes } from "react";
type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src: string | { src: string };
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  placeholder?: string;
  blurDataURL?: string;
  unoptimized?: boolean;
  loader?: unknown;
  onLoadingComplete?: unknown;
};
export default function Image({
  src,
  fill,
  priority,
  quality,
  placeholder,
  blurDataURL,
  unoptimized,
  loader,
  onLoadingComplete,
  style,
  ...props
}: Props) {
  return (
    <img
      {...props}
      src={typeof src === "string" ? src : src.src}
      loading={priority ? "eager" : props.loading || "lazy"}
      style={{
        ...(fill
          ? ({
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
            } as const)
          : {}),
        ...style,
      }}
    />
  );
}
