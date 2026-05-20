import type { SVGProps } from "react";

export default function Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <rect width="64" height="64" rx="18" fill="#07111f" />
      <path
        d="M18 38.5C18 30.5517 24.4396 24 32.25 24C40.0604 24 46.5 30.5517 46.5 38.5C46.5 40.985 46.0459 43.3638 45.2147 45.55H19.2853C18.4541 43.3638 18 40.985 18 38.5Z"
        fill="#34D399"
      />
      <path
        d="M27 18.5C27 17.1193 28.1193 16 29.5 16H35C36.3807 16 37.5 17.1193 37.5 18.5V23H27V18.5Z"
        fill="#FFFFFF"
        fillOpacity="0.92"
      />
      <path
        d="M23 43H41"
        stroke="#0F172A"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="24" cy="29" r="2.2" fill="#0F172A" />
      <circle cx="32" cy="29" r="2.2" fill="#0F172A" />
      <circle cx="40" cy="29" r="2.2" fill="#0F172A" />
    </svg>
  );
}
