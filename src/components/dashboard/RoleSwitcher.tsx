import { Button, Group, Paper } from '@mantine/core';
import type { JSX } from 'react';
import { useState } from 'react';

const roles = ['Psychiatrist', 'Therapist', 'Case Manager', 'Billing'] as const;
type Role = (typeof roles)[number];

export function RoleSwitcher(): JSX.Element {
  const [active, setActive] = useState<Role>('Psychiatrist');

  return (
    <Paper
      withBorder
      radius="xl"
      p={4}
      mb="lg"
      w="fit-content"
      style={{ background: 'var(--oly-warm-white)' }}
    >
      <Group gap={6}>
        {roles.map((role) => (
          <Button
            key={role}
            size="compact-sm"
            radius="xl"
            variant={active === role ? 'filled' : 'subtle'}
            color={active === role ? 'forest' : 'gray'}
            onClick={() => setActive(role)}
            styles={{
              root: {
                fontWeight: 500,
                fontSize: 13,
                paddingInline: 16,
              },
            }}
          >
            {role === 'Psychiatrist' ? 'Psychiatrist View' : role}
          </Button>
        ))}
      </Group>
    </Paper>
  );
}
