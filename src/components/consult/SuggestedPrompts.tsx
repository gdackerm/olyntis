import {
  IconActivity,
  IconBrain,
  IconChartLine,
  IconHeart,
  IconMedicineSyrup,
  IconNotes,
  IconShieldCheck,
  IconUsers,
} from '@tabler/icons-react';
import type { JSX } from 'react';
import classes from './SuggestedPrompts.module.css';

const PROMPTS = [
  {
    icon: <IconNotes size={18} />,
    title: 'Treatment Summary',
    description: 'Current treatment status and progress',
    prompt: 'Please provide a comprehensive treatment summary for this patient, including current interventions, progress, and any areas of concern.',
  },
  {
    icon: <IconMedicineSyrup size={18} />,
    title: 'Medication Review',
    description: 'Interactions, contraindications, optimization',
    prompt: 'Review this patient\'s current medications for potential interactions, contraindications, and optimization opportunities. Consider their diagnoses and screening scores.',
  },
  {
    icon: <IconShieldCheck size={18} />,
    title: 'Risk Assessment',
    description: 'Safety concerns from clinical data',
    prompt: 'Based on the available clinical data, provide a risk assessment for this patient. Flag any safety concerns including suicidal ideation indicators, substance use risk, and high screening scores.',
  },
  {
    icon: <IconChartLine size={18} />,
    title: 'Screening Analysis',
    description: 'PHQ-9, GAD-7, AUDIT-C trends',
    prompt: 'Analyze this patient\'s screening score trends (PHQ-9, GAD-7, AUDIT-C). Identify any concerning patterns and suggest clinical actions based on the scores.',
  },
  {
    icon: <IconActivity size={18} />,
    title: 'Treatment Suggestions',
    description: 'Evidence-based treatment adjustments',
    prompt: 'Based on this patient\'s clinical profile, suggest evidence-based treatment plan adjustments. Reference APA or SAMHSA guidelines where applicable.',
  },
  {
    icon: <IconBrain size={18} />,
    title: 'Session Preparation',
    description: 'Key topics for next visit',
    prompt: 'Help me prepare for the next session with this patient. What key topics should I address based on their recent encounters, screening scores, and clinical trajectory?',
  },
  {
    icon: <IconHeart size={18} />,
    title: 'Diagnostic Considerations',
    description: 'Differential and comorbidities',
    prompt: 'What diagnostic considerations should I keep in mind for this patient? Consider differential diagnoses and potential comorbidities based on their clinical data.',
  },
  {
    icon: <IconUsers size={18} />,
    title: 'Family & Social Context',
    description: 'Psychosocial factors',
    prompt: 'Analyze the family history and social context for this patient. What psychosocial factors might be relevant to their treatment plan?',
  },
];

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
}

export function SuggestedPrompts({ onSelect }: SuggestedPromptsProps): JSX.Element {
  return (
    <div className={classes.container}>
      <div className={classes.heading}>What would you like to know?</div>
      <div className={classes.grid}>
        {PROMPTS.map((p) => (
          <button key={p.title} className={classes.card} onClick={() => onSelect(p.prompt)}>
            <div className={classes.cardIcon}>{p.icon}</div>
            <div>
              <div className={classes.cardTitle}>{p.title}</div>
              <div className={classes.cardDesc}>{p.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
