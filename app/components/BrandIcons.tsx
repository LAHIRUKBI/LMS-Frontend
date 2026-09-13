import { siFacebook, siInstagram } from "simple-icons";

interface IconProps {
  size?: number;
  className?: string;
  color?: string;
}

export function FacebookIcon({ size = 24, className, color = "currentColor" }: IconProps) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={siFacebook.path} />
    </svg>
  );
}

export function InstagramIcon({ size = 24, className, color = "currentColor" }: IconProps) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={siInstagram.path} />
    </svg>
  );
}