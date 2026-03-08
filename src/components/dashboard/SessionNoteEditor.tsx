import { Button, Group, Paper, Text } from '@mantine/core';
import { IconSparkles } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useState } from 'react';
import classes from './SessionNoteEditor.module.css';

const TABS = ['Subjective', 'Objective', 'Assessment', 'Plan'] as const;
type TabName = (typeof TABS)[number];

const PLACEHOLDER_CONTENT: Record<TabName, string> = {
  Subjective: 'Begin typing the subjective portion of your note…',
  Objective: 'Document objective findings here…',
  Assessment: 'Record your clinical assessment…',
  Plan: 'Outline the treatment plan…',
};

interface SessionNoteEditorProps {
  patientName?: string;
}

export function SessionNoteEditor({ patientName }: SessionNoteEditorProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<TabName>('Subjective');
  const [notes, setNotes] = useState<Record<TabName, string>>({
    Subjective: '',
    Objective: '',
    Assessment: '',
    Plan: '',
  });

  const title = patientName ? `Session Note — ${patientName}` : 'Session Note';

  return (
    <Paper withBorder radius="md" style={{ background: 'var(--oly-warm-white)', overflow: 'hidden' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 20px 14px',
        borderBottom: '1px solid var(--oly-stone)',
      }}>
        <Text ff="'Lora', serif" fz={15} fw={500} c="var(--oly-charcoal)">
          {title}
        </Text>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: 'var(--oly-ai-glow)',
            animation: 'oly-pulse 2s infinite',
          }} />
          <Text size="xs" c="var(--oly-forest-muted)" fw={500}>AI Ready</Text>
        </div>
      </div>

      <div className={classes.noteArea}>
        <div className={classes.tabs}>
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`${classes.tab} ${activeTab === tab ? classes.tabActive : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className={classes.editor}>
          <div className={classes.editorLabel}>{activeTab}</div>
          <textarea
            className={classes.textarea}
            placeholder={PLACEHOLDER_CONTENT[activeTab]}
            value={notes[activeTab]}
            onChange={(e) =>
              setNotes((prev) => ({ ...prev, [activeTab]: e.target.value }))
            }
          />
          <div className={classes.aiSuggestion}>
            <IconSparkles size={14} color="var(--oly-ai-glow)" style={{ flexShrink: 0, marginTop: 2 }} />
            <span className={classes.aiSuggestionText}>
              AI suggestions will appear here based on patient history and session context.
            </span>
            <button className={classes.aiAcceptBtn}>Accept &rarr;</button>
          </div>
        </div>

        <div className={classes.footer}>
          <span className={classes.meta}>Auto-save enabled</span>
          <Group gap={8}>
            <Button variant="default" size="compact-sm" radius="sm">
              AI Full Draft
            </Button>
            <Button color="forest" size="compact-sm" radius="sm">
              Sign &amp; Save
            </Button>
          </Group>
        </div>
      </div>
    </Paper>
  );
}
