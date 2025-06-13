import { cn } from "~/lib/utils";

export interface ISVGProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

export const Spinner = ({
  className,
  size = 24,
  ...props
}: ISVGProps) => {
  return (
    <svg
      aria-label="Loading indicator" height={size}
      role="status"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      className={cn("animate-spin", className)}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
};