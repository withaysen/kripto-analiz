import { Badge } from "@/components/ui/badge";

interface TrafficLightProps {
  score: number; // 0-100
}

export function TrafficLight({ score }: TrafficLightProps) {
  // Skor aralıklarına göre trafik ışığı belirle
  const getTrafficLight = () => {
    if (score >= 70) return { emoji: "🟢", label: "Düşük Risk", color: "text-green-500" };
    if (score >= 40) return { emoji: "🟠", label: "Orta Risk", color: "text-orange-500" };
    return { emoji: "🔴", label: "Yüksek Risk", color: "text-red-500" };
  };

  const { emoji, label, color } = getTrafficLight();

  return (
    <div className="flex items-center gap-3">
      <span className={`text-3xl ${color}`}>{emoji}</span>
      <Badge variant="outline" className="text-sm font-medium">
        {label}
      </Badge>
    </div>
  );
}

