import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background:
            "radial-gradient(circle at top, rgba(58,167,255,0.28), transparent 42%), linear-gradient(145deg, #07070A 0%, #0D1220 100%)",
          color: "white",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          position: "relative",
          width: "100%",
        }}
      >
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 110,
            boxShadow: "0 0 80px rgba(58,167,255,0.22)",
            display: "flex",
            height: 320,
            justifyContent: "center",
            overflow: "hidden",
            position: "relative",
            width: 320,
          }}
        >
          <div
            style={{
              background:
                "linear-gradient(145deg, rgba(215,255,87,0.24), rgba(58,167,255,0.28))",
              height: "100%",
              position: "absolute",
              width: "100%",
            }}
          />
          <div
            style={{
              alignItems: "center",
              display: "flex",
              fontSize: 174,
              fontWeight: 700,
              letterSpacing: -8,
              position: "relative",
            }}
          >
            V
          </div>
        </div>
      </div>
    ),
    size,
  );
}
