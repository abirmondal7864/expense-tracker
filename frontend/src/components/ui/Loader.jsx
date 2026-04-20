import React from "react";

const Loader = ({ fullPage = false }) => {
  if (fullPage) {
    return (
      <div className="loader-shell">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div
      className="loader"
      style={{ display: "flex", justifyContent: "center" }}
    >
      <div
        className="spinner"
        style={{ width: "24px", height: "24px", borderWidth: "3px" }}
      ></div>
    </div>
  );
};

export default Loader;
