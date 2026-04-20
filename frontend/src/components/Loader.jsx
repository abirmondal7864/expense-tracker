import React from "react";

const Loader = () => {
  return (
    <div style={styles.container}>
      <div style={styles.spinner}></div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "200px",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "5px solid #ccc",
    borderTop: "5px solid #4CAF50",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};

export default Loader;

