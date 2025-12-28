export enum CyclePhases {
  MENSTRUAL = 'menstrual',
  FOLICULAR = 'follicular',
  OVULATORY = 'ovulatory',
  LUTEAL = 'luteal',
}

export type InsightItem = {
  icon: string;
  title: string;
  text: string;
  iconBg: string;
  iconColor: string;
};

export const PHASE_INSIGHTS: Record<string, InsightItem[]> = {
  menstrual: [
    {
      icon: "Heart",
      title: "Estado de ánimo",
      text: "Es normal sentirse más sensible o cansada. Escucha a tu cuerpo.",
      iconBg: "bg-rose-100",
      iconColor: "text-rose-600"
    },
    {
      icon: "Moon",
      title: "Recomendación",
      text: "Descansa, mantente hidratada y realiza actividades suaves.",
      iconBg: "bg-rose-100",
      iconColor: "text-rose-600"
    }
  ],
  follicular: [
    {
      icon: "Sun",
      title: "Estado de ánimo",
      text: "Tu energía está aumentando. Es un buen momento para actividades activas.",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      icon: "Activity",
      title: "Recomendación",
      text: "Ideal para ejercicio intenso y proyectos que requieren energía.",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600"
    }
  ],
  ovulatory: [
    {
      icon: "Star",
      title: "Estado de ánimo",
      text: "Tu energía está en su punto más alto. Días de máxima fertilidad.",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600"
    },
    {
      icon: "Heart",
      title: "Recomendación",
      text: "Perfecto para actividades sociales y ejercicio vigoroso.",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600"
    }
  ],
  luteal: [
    {
      icon: "Moon",
      title: "Estado de ánimo",
      text: "Es normal sentirse más introspectiva. Tu energía puede disminuir.",
      iconBg: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      icon: "Leaf",
      title: "Recomendación",
      text: "Ideal para yoga suave, meditación y actividades relajantes.",
      iconBg: "bg-green-100",
      iconColor: "text-green-600"
    }
  ]
};

