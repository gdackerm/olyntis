import { supabase } from '../lib/supabase/client';
import type { PatientAIContext } from './ai-context.service';

export interface ConsultMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function streamConsult(
  patientId: string,
  messages: ConsultMessage[],
  patientContext: PatientAIContext,
  onChunk: (text: string) => void,
  onComplete: (fullText: string) => void,
  onError: (error: string) => void,
): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    onError('Not authenticated. Please sign in.');
    return;
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const url = `${supabaseUrl}/functions/v1/ai-consult`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        patientId,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        patientContext,
      }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({ error: 'AI service unavailable' }));
      onError(errBody.error || `Error: ${response.status}`);
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onError('No response stream');
      return;
    }

    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6);
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);

          if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
            fullText += parsed.delta.text;
            onChunk(parsed.delta.text);
          }

          if (parsed.type === 'error') {
            onError(parsed.error?.message || 'Stream error');
            return;
          }
        } catch {
          // Skip non-JSON SSE lines
        }
      }
    }

    onComplete(fullText);
  } catch (err) {
    onError(err instanceof Error ? err.message : 'Network error');
  }
}
