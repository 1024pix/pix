import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import Showdown from 'showdown';
import {
  AssistantRuntimeProvider,
  ThreadPrimitive,
  MessagePrimitive,
  ComposerPrimitive,
  AuiIf,
  useAuiState,
  // eslint-disable-next-line no-restricted-imports
  useAssistantToolUI,
} from '@assistant-ui/react';

const mdConverter = new Showdown.Converter({
  simpleLineBreaks: true,
  openLinksInNewWindow: true,
  tables: true,
  literalMidWordUnderscores: true,
});
import { useChatRuntime, AssistantChatTransport } from '@assistant-ui/react-ai-sdk';
import CreateOrganizationToolUI from './CreateOrganizationToolUI.jsx';
import AutoExecToolUI from './ListReferenceValuesToolUI.jsx';

export const AssistantToolContext = createContext({ toolAnnotations: null, getAccessToken: null });

export function DynamicToolFallback({ toolName, args, addResult, status }) {
  const { toolAnnotations, getAccessToken } = useContext(AssistantToolContext);
  if (!toolAnnotations) return null;
  const annotation = toolAnnotations[toolName];
  if (!annotation?.readOnlyHint) return null;
  return <AutoExecToolUI toolName={toolName} args={args} addResult={addResult} status={status} getAccessToken={getAccessToken} />;
}

function TextPart() {
  const part = useAuiState((s) => {
    if (s.part.type !== 'text' && s.part.type !== 'reasoning') return null;
    return s.part;
  });
  if (!part?.text) return null;
  return (
    <div
      className="message__text"
      // Content comes from a self-hosted LLM; risk is acceptable for this internal admin tool
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: mdConverter.makeHtml(part.text) }}
    />
  );
}

function UserMessage() {
  return (
    <div className="message message--user">
      <div className="message__bubble">
        <MessagePrimitive.Parts components={{ Text: TextPart }} />
      </div>
    </div>
  );
}

function AssistantMessage() {
  return (
    <div className="message message--assistant">
      <div className="message__avatar">✦</div>
      <div className="message__bubble">
        <AuiIf condition={(s) => s.message.parts.length === 0}>
          <div className="thinking-dots">
            <span />
            <span />
            <span />
          </div>
        </AuiIf>
        <MessagePrimitive.Parts components={{ Text: TextPart, tools: { Fallback: DynamicToolFallback } }} />
      </div>
    </div>
  );
}

function Message() {
  return (
    <MessagePrimitive.Root>
      <AuiIf condition={(s) => s.message.role === 'user'}>
        <UserMessage />
      </AuiIf>
      <AuiIf condition={(s) => s.message.role === 'assistant'}>
        <AssistantMessage />
      </AuiIf>
    </MessagePrimitive.Root>
  );
}

function ToolRegistrar({ getAccessToken, onNavigateToOrganization }) {
  useAssistantToolUI({
    toolName: 'create_organization',
    display: 'standalone',
    render: (props) => (
      <CreateOrganizationToolUI
        {...props}
        toolName="create_organization"
        getAccessToken={getAccessToken}
        onNavigateToOrganization={onNavigateToOrganization}
      />
    ),
  });
  return null;
}

export default function AssistantApp({ getAccessToken, onNavigateToOrganization }) {
  const getAccessTokenRef = useRef(getAccessToken);
  getAccessTokenRef.current = getAccessToken;

  const [toolAnnotations, setToolAnnotations] = useState(null);

  useEffect(() => {
    async function fetchTools() {
      try {
        const token = await getAccessTokenRef.current();
        const res = await fetch('/api/admin/llm-assistant/tools', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const tools = await res.json();
        const annotations = {};
        for (const tool of tools) {
          annotations[tool.name] = { readOnlyHint: tool.readOnlyHint };
        }
        setToolAnnotations(annotations);
      } catch {
        setToolAnnotations({});
      }
    }
    fetchTools();
  }, []);

  const transport = useMemo(
    () =>
      new AssistantChatTransport({
        api: '/api/admin/llm-assistant/conversations/messages',
        headers: async () => ({
          Authorization: `Bearer ${await getAccessTokenRef.current()}`,
        }),
      }),
    [],
  );

  const runtime = useChatRuntime({
    transport,
    // Re-submit automatically after all tool calls in the last step have an output,
    // so the LLM can see error results and self-correct.
    sendAutomaticallyWhen: ({ messages }) => {
      const last = messages.at(-1);
      if (last?.role !== 'assistant') return false;
      const lastStepStart = last.parts.reduce((idx, part, i) => (part.type === 'step-start' ? i : idx), -1);
      const toolParts = last.parts
        .slice(lastStepStart + 1)
        .filter((p) => (p.type === 'dynamic-tool' || p.type?.startsWith('tool-')) && !p.providerExecuted);
      return toolParts.length > 0 && toolParts.every((p) => p.state === 'output-available' || p.state === 'output-error');
    },
  });

  return (
    <AssistantToolContext.Provider value={{ toolAnnotations, getAccessToken }}>
      <div className="assistant-popover">
        <AssistantRuntimeProvider runtime={runtime}>
          <ToolRegistrar getAccessToken={getAccessToken} onNavigateToOrganization={onNavigateToOrganization} />
          <div className="assistant-header">
            <span className="assistant-header__icon">✦</span>
            <span className="assistant-header__title">Assistant Pix</span>
          </div>
          <ThreadPrimitive.Root className="assistant-thread">
            <ThreadPrimitive.Viewport className="assistant-viewport">
              <ThreadPrimitive.Empty>
                <div className="assistant-empty">
                  <p className="assistant-empty__title">Comment puis-je vous aider ?</p>
                  <p className="assistant-empty__hint">Essayez : « Crée une organisation lycée à Paris »</p>
                </div>
              </ThreadPrimitive.Empty>
              <ThreadPrimitive.Messages components={{ Message }} />
            </ThreadPrimitive.Viewport>
            <div className="assistant-composer">
              <ComposerPrimitive.Root>
                <ComposerPrimitive.Input
                  className="composer__input"
                  placeholder="Envoyer un message…"
                  autoFocus
                />
                <ComposerPrimitive.Send className="composer__send" aria-label="Envoyer">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
                  </svg>
                </ComposerPrimitive.Send>
              </ComposerPrimitive.Root>
            </div>
          </ThreadPrimitive.Root>
        </AssistantRuntimeProvider>
      </div>
    </AssistantToolContext.Provider>
  );
}
