import { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  count?: number;
  onClick?: () => void;
  color: "blue" | "green" | "orange" | "red";
}

const colorClasses = {
  blue: "bg-[#E6F1FD] border-[#0073EA]/20",
  green: "bg-[#E8F5E9] border-[#258750]/20",
  orange: "bg-[#FFF3E0] border-[#FF9800]/20",
  red: "bg-[#FFEBEE] border-[#D83A52]/20",
};

export function DashboardCard({
  title,
  description,
  icon,
  count,
  onClick,
  color,
}: DashboardCardProps) {
  return (
    <div
      onClick={onClick}
      className={`flex flex-col p-6 gap-4 rounded-lg border ${colorClasses[color]} cursor-pointer transition-all hover:shadow-md ${
        onClick ? "hover:scale-[1.02]" : ""
      }`}
    >
      {/* Icon and Count */}
      <div className="flex items-start justify-between">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-white/60">
          {icon}
        </div>
        {count !== undefined && (
          <div className="flex items-center justify-center px-3 py-1 rounded-full bg-white/60">
            <p className="text-text-primary font-roboto text-sm font-bold">
              {count}
            </p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1">
        <h3 className="text-text-primary font-roboto text-base font-bold leading-normal">
          {title}
        </h3>
        <p className="text-text-muted font-roboto text-sm font-normal leading-normal">
          {description}
        </p>
      </div>
    </div>
  );
}
