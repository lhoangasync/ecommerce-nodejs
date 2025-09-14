import React from "react";
import { BeatLoader } from "react-spinners";
function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-screen">
      <BeatLoader color="#f08787"></BeatLoader>
    </div>
  );
}

export default LoadingSpinner;
