import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background:
            "linear-gradient(145deg, rgba(215,255,87,0.18), rgba(58,167,255,0.26), #07070A)",
          borderRadius: 40,
          color: "white",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            fontSize: 92,
            fontWeight: 700,
            letterSpacing: -6,
          }}
        >
          V
        </div>
      </div>
    ),
    size,
  );
}
