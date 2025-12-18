import Step1 from '@/components/onboarding/steps/step-1';
import Step2 from '@/components/onboarding/steps/step-2';
import Step3 from '@/components/onboarding/steps/step-3';
import Step4 from '@/components/onboarding/steps/step-4';

interface Step {
    title: string;
    subSteps: {
        wizard: {
            title: string;
            subtitle: string;
            button: string;
            skipTo?: string;
            skippable?: boolean;
        };
        key: string;
        component: React.ComponentType<any>;
    }[];
}

export const STEPS: Step[] = [
    {
        title: "Información Personal",
        subSteps: [
            {
                wizard: {
                    title: "Hablemos de ti",
                    subtitle: "Personalicemos tu experiencia. Tus datos se guardan de forma segura solo en este dispositivo.",
                    button: "Síntomas",
                },
                key: "info",
                component: Step1,
            },
        ],
    },
    {
        title: "Síntomas",
        subSteps: [
            {
                wizard: {
                    title: "¿Cuáles son tus síntomas más comunes?",
                    subtitle: "Selecciona todo lo que aplique para mejorar tus predicciones mensuales. Este paso es opcional.",
                    button: "Objetivo",
                    skipTo: "Objetivo",
                    skippable: true,
                },
                key: "symptoms",
                component: Step2,
            },
        ],
    },
    {
        title: "Objetivo",
        subSteps: [
            {
                wizard: {
                    title: "¿Buscas un embarazo?",
                    subtitle: "Personalizaremos tu calendario y predicciones según tu objetivo actual. Este paso es opcional.",
                    button: "Método",
                    skipTo: "Método",
                    skippable: true,
                },
                key: "pregnancy",
                component: Step3,
            },
        ],
    },
    {
        title: "Método Anticonceptivo",
        subSteps: [
            {
                wizard: {
                    title: "¿Usas algún método anticonceptivo?",
                    subtitle: "Esto nos ayuda a mejorar tus predicciones y personalizar tu experiencia. Este paso es opcional.",
                    button: "Finalizar",
                    skipTo: "Finalizar",
                    skippable: true,
                },
                key: "contraceptive",
                component: Step4,
            },
        ],
    },
];

// Flatten all steps for easier access
export const ALL_STEPS = STEPS.flatMap(step => step.subSteps || []);

// Step keys enum for easy reference
export const STEP_KEYS = {
    INFO: 'info',
    SYMPTOMS: 'symptoms',
    PREGNANCY: 'pregnancy',
    CONTRACEPTIVE: 'contraceptive',
} as const;

