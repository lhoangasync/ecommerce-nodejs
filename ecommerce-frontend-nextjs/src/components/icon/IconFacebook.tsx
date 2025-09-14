import React, { ComponentProps } from "react";

const IconFacebook = (props: ComponentProps<"svg">) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      className="h-5 w-5 fill-blue-600"
      {...props}
    >
      <path d="M24 4C12.95 4 4 12.95 4 24c0 9.84 7.164 17.969 16.5 19.734V29.5h-5v-5.5h5v-4c0-5 3-7.75 7.5-7.75 2.18 0 4.5.375 4.5.375v5h-2.5c-2.48 0-3.25 1.54-3.25 3.125V24h5.5l-1 5.5h-4.5v14.234C36.836 41.969 44 33.84 44 24c0-11.05-8.95-20-20-20z" />
    </svg>
  );
};

export default IconFacebook;
