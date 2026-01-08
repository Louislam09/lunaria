export type CycleDayTip = {
    title: string;
    text: string;
    icon: string;
    iconBg: string;
    iconColor: string;
};

export type CycleDayTipsMap = {
    [day: number]: CycleDayTip[];
};

// Tips organizados por día del ciclo
export const CYCLE_DAY_TIPS: CycleDayTipsMap = {
    // Días 1-5: Menstruación
    1: [
        {
            title: 'Día 1 del ciclo',
            text: 'Es el primer día de tu periodo. Es normal sentir cólicos y cambios de humor. Descansa y mantente hidratada.',
            icon: 'Droplet',
            iconBg: 'bg-rose-100',
            iconColor: 'text-rose-600',
        },
        {
            title: 'Cuidado personal',
            text: 'Usa productos de higiene adecuados y cambia con frecuencia. Escucha a tu cuerpo y descansa si lo necesitas.',
            icon: 'Heart',
            iconBg: 'bg-rose-100',
            iconColor: 'text-rose-600',
        },
    ],
    2: [
        {
            title: 'Flujo más intenso',
            text: 'El segundo día suele ser el más intenso. Es normal tener más flujo y cólicos. Considera usar analgésicos si es necesario.',
            icon: 'Activity',
            iconBg: 'bg-rose-100',
            iconColor: 'text-rose-600',
        },
    ],
    3: [
        {
            title: 'Mitad del periodo',
            text: 'El flujo puede comenzar a disminuir. Sigue cuidándote y mantén una buena hidratación.',
            icon: 'Moon',
            iconBg: 'bg-rose-100',
            iconColor: 'text-rose-600',
        },
    ],
    4: [
        {
            title: 'Finalizando',
            text: 'El periodo está llegando a su fin. El flujo debería ser más leve. Pronto recuperarás tu energía.',
            icon: 'Sun',
            iconBg: 'bg-rose-100',
            iconColor: 'text-rose-600',
        },
    ],
    5: [
        {
            title: 'Último día',
            text: 'Último día típico del periodo. El flujo debería ser muy leve o manchas. Tu energía comenzará a aumentar.',
            icon: 'Sparkles',
            iconBg: 'bg-rose-100',
            iconColor: 'text-rose-600',
        },
    ],

    // Días 6-13: Fase Folicular
    6: [
        {
            title: 'Fase folicular',
            text: 'Tu energía está aumentando. Es un buen momento para retomar actividades físicas y proyectos.',
            icon: 'Sun',
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
        },
    ],
    7: [
        {
            title: 'Semana post-periodo',
            text: 'Tu cuerpo se está recuperando. Aprovecha esta fase para actividades que requieren concentración.',
            icon: 'Brain',
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
        },
    ],
    8: [
        {
            title: 'Energía creciente',
            text: 'Tu energía y estado de ánimo mejoran. Ideal para ejercicio moderado y actividades sociales.',
            icon: 'Activity',
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
        },
    ],
    9: [
        {
            title: 'Preparación para ovulación',
            text: 'Tu cuerpo se prepara para la ovulación. Puedes notar cambios en el flujo cervical.',
            icon: 'Leaf',
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
        },
    ],
    10: [
        {
            title: 'Aproximándose a ovulación',
            text: 'Estás cerca de tu ventana fértil. El flujo cervical puede volverse más elástico y claro.',
            icon: 'Droplet',
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
        },
    ],
    11: [
        {
            title: 'Ventana fértil próxima',
            text: 'Tu ventana fértil está cerca. Si buscas embarazo, estos son días importantes para tener relaciones.',
            icon: 'Heart',
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-600',
        },
    ],
    12: [
        {
            title: 'Inicio ventana fértil',
            text: 'Comienza tu ventana fértil. Los días más fértiles son hoy y los próximos 2-3 días.',
            icon: 'Star',
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-600',
        },
    ],
    13: [
        {
            title: 'Día de ovulación',
            text: 'Probable día de ovulación. Es el día más fértil del ciclo. Tu energía puede estar en su punto máximo.',
            icon: 'Sparkles',
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-600',
        },
    ],

    // Días 14-21: Post-ovulación / Fase Lútea temprana
    14: [
        {
            title: 'Post-ovulación',
            text: 'Has ovulado. La temperatura basal puede aumentar ligeramente. Tu energía sigue alta.',
            icon: 'Sun',
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
        },
    ],
    15: [
        {
            title: 'Fase lútea temprana',
            text: 'Comienza la fase lútea. Tu cuerpo produce progesterona. Puedes sentirte más estable emocionalmente.',
            icon: 'Moon',
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
        },
    ],
    16: [
        {
            title: 'Energía estable',
            text: 'Tu energía se mantiene estable. Buen momento para actividades que requieren enfoque y paciencia.',
            icon: 'Brain',
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
        },
    ],
    17: [
        {
            title: 'Mitad fase lútea',
            text: 'Estás a mitad de la fase lútea. Tu cuerpo se prepara para el próximo periodo o embarazo.',
            icon: 'Leaf',
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
        },
    ],
    18: [
        {
            title: 'Preparación pre-menstrual',
            text: 'Tu cuerpo comienza a prepararse para el próximo periodo. Puedes notar cambios sutiles en tu estado de ánimo.',
            icon: 'Droplet',
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
        },
    ],
    19: [
        {
            title: 'Síntomas pre-menstruales',
            text: 'Pueden aparecer síntomas pre-menstruales como sensibilidad, hinchazón o cambios de humor. Es normal.',
            icon: 'Heart',
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
        },
    ],
    20: [
        {
            title: 'Acercándose al periodo',
            text: 'Tu próximo periodo está cerca. Puedes sentir más fatiga o sensibilidad. Escucha a tu cuerpo.',
            icon: 'Moon',
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
        },
    ],
    21: [
        {
            title: 'Semana pre-menstrual',
            text: 'Estás en la semana pre-menstrual. Es normal sentir más cansancio, cambios de humor o antojos.',
            icon: 'Activity',
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
        },
    ],

    // Días 22-28: Fase Lútea tardía / Pre-periodo
    22: [
        {
            title: 'Síntomas pre-menstruales',
            text: 'Los síntomas pre-menstruales pueden intensificarse. Descansa y realiza actividades relajantes.',
            icon: 'Heart',
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
        },
    ],
    23: [
        {
            title: 'Preparación para periodo',
            text: 'Tu cuerpo se prepara para el periodo. Puedes notar manchas o cambios en el flujo cervical.',
            icon: 'Droplet',
            iconBg: 'bg-rose-100',
            iconColor: 'text-rose-600',
        },
    ],
    24: [
        {
            title: 'Inminente periodo',
            text: 'Tu periodo está muy cerca. Puedes sentir cólicos leves o cambios de humor. Prepárate con productos de higiene.',
            icon: 'CircleAlert',
            iconBg: 'bg-rose-100',
            iconColor: 'text-rose-600',
        },
    ],
    25: [
        {
            title: 'Días antes del periodo',
            text: 'Estás a pocos días de tu periodo. Es normal sentir más sensibilidad emocional y física.',
            icon: 'Moon',
            iconBg: 'bg-rose-100',
            iconColor: 'text-rose-600',
        },
    ],
    26: [
        {
            title: 'Casi llegando',
            text: 'Tu periodo puede llegar en cualquier momento. Ten productos de higiene a mano y escucha a tu cuerpo.',
            icon: 'Droplet',
            iconBg: 'bg-rose-100',
            iconColor: 'text-rose-600',
        },
    ],
    27: [
        {
            title: 'Inicio esperado',
            text: 'Según tu ciclo, tu periodo debería comenzar pronto. Si se retrasa, es normal tener variaciones.',
            icon: 'Clock',
            iconBg: 'bg-rose-100',
            iconColor: 'text-rose-600',
        },
    ],
    28: [
        {
            title: 'Día esperado',
            text: 'Hoy es el día esperado para el inicio de tu periodo. Si no ha llegado, puede retrasarse 1-2 días y es normal.',
            icon: 'Calendar',
            iconBg: 'bg-rose-100',
            iconColor: 'text-rose-600',
        },
    ],
};

/**
 * Obtiene un tip para un día específico del ciclo
 * Si hay múltiples tips, rota basándose en el día del mes para variar
 */
export function getCycleDayTip(cycleDay: number, date?: Date): CycleDayTip | null {
    const tips = CYCLE_DAY_TIPS[cycleDay];

    if (!tips || tips.length === 0) {
        // Si no hay tip específico, buscar por rango de días
        return getTipByRange(cycleDay);
    }

    // Si hay múltiples tips, rotar basándose en la fecha
    if (tips.length > 1 && date) {
        const dayOfMonth = date.getDate();
        const tipIndex = dayOfMonth % tips.length;
        return tips[tipIndex];
    }

    return tips[0];
}

/**
 * Obtiene un tip basado en el rango de días si no hay uno específico
 */
function getTipByRange(cycleDay: number): CycleDayTip | null {
    // Menstruación (1-5)
    if (cycleDay >= 1 && cycleDay <= 5) {
        return {
            title: 'Fase menstrual',
            text: 'Estás en tu periodo. Descansa, mantente hidratada y escucha a tu cuerpo.',
            icon: 'Droplet',
            iconBg: 'bg-rose-100',
            iconColor: 'text-rose-600',
        };
    }

    // Fase folicular (6-13)
    if (cycleDay >= 6 && cycleDay <= 13) {
        return {
            title: 'Fase folicular',
            text: 'Tu energía está aumentando. Es un buen momento para actividades activas y proyectos.',
            icon: 'Sun',
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
        };
    }

    // Fase lútea temprana (14-21)
    if (cycleDay >= 14 && cycleDay <= 21) {
        return {
            title: 'Fase lútea',
            text: 'Tu energía se mantiene estable. Ideal para actividades que requieren enfoque.',
            icon: 'Moon',
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
        };
    }

    // Fase lútea tardía / Pre-periodo (22+)
    if (cycleDay >= 22) {
        return {
            title: 'Pre-periodo',
            text: 'Tu periodo está cerca. Puedes sentir síntomas pre-menstruales. Escucha a tu cuerpo.',
            icon: 'CircleAlert',
            iconBg: 'bg-rose-100',
            iconColor: 'text-rose-600',
        };
    }

    return null;
}

