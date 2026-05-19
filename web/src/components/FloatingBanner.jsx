import { useState } from "react";

function FloatingBanner({ imageUrl, link, side = "right" }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        [side]: "20px",
        zIndex: 9999,
        width: "120px",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
        transition: "transform 0.3s ease",
      }}
    >
      <button
        onClick={() => setIsVisible(false)}
        style={{
          position: "absolute",
          top: "5px",
          right: "5px",
          background: "rgba(0,0,0,0.6)",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "24px",
          height: "24px",
          fontSize: "12px",
          cursor: "pointer",
          zIndex: 10,
        }}
      >
        ✕
      </button>

      <a href={link} target="_blank" rel="noreferrer">
        <img
          src={imageUrl}
          alt="Banner"
          style={{
            width: "100%",
            height: "240px",
            objectFit: "cover",
            display: "block",
          }}
        />
      </a>
    </div>
  );
}

export default FloatingBanner;
