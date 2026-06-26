import type { WeekType } from "../types";

interface PetWidgetProps {
  message: string;
  weekType: WeekType;
}

export function PetWidget({ message, weekType }: PetWidgetProps) {
  return (
    <article className="pet-card">
      <div className="speech-bubble">{message}</div>
      <div className="pet" aria-label="一只橙色需求小兽">
        <span className="pet-ear left" />
        <span className="pet-ear right" />
        <div className="pet-face">
          <span className="eye left" />
          <span className="eye right" />
          <span className="mouth">ω</span>
        </div>
        <span className="pet-body" />
      </div>
      <p className="pet-status">
        {weekType === "demand_week" ? "需求周模式" : "推进周模式"}
      </p>
    </article>
  );
}
