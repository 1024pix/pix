import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import Showdown from 'showdown';
import DOMPurify from 'dompurify';
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
import { useChatRuntime, AssistantChatTransport, useAISDKError, useAISDKChat } from '@assistant-ui/react-ai-sdk';
import CreateOrganizationToolUI from './CreateOrganizationToolUI.jsx';
import AutoExecToolUI from './ListReferenceValuesToolUI.jsx';
import LotToolUI, { documentRegistry, ApproveLotToolUI } from './LotToolUI.jsx';
import readFile from '../documents/lire-fichier.js';
import DocumentDepose from '../domain/document-depose.js';

// Provides Ember services (intl t(), getAccessToken) to all React components.
export const EmberContext = createContext({ t: (key) => key, getAccessToken: null });

// Legacy tool context kept for CreateOrganizationToolUI compatibility.
export const AssistantToolContext = createContext({ toolAnnotations: null });

// Maps message id → attached filename, populated in the fetch interceptor.
// Uses a subscriber set so UserMessage components can re-render when the map is updated.
const messageAttachmentMap = new Map();
const attachmentSubscribers = new Set();

function setMessageAttachment(id, filename) {
  messageAttachmentMap.set(id, filename);
  attachmentSubscribers.forEach((fn) => fn());
}

function useMessageAttachment(messageId) {
  const [, rerender] = useState(0);
  useEffect(() => {
    const trigger = () => rerender((n) => n + 1);
    attachmentSubscribers.add(trigger);
    return () => attachmentSubscribers.delete(trigger);
  }, []);
  return messageAttachmentMap.get(messageId);
}

function ErrorBanner() {
  const { t } = useContext(EmberContext);
  const error = useAISDKError();
  const chat = useAISDKChat();
  if (!error) return null;
  return (
    <div className="assistant-error-banner" role="alert">
      <span>{t('components.assistant.error-banner.message')}</span>
      <button className="btn--secondary btn--small" onClick={() => chat?.clearError()}>
        {t('components.assistant.error-banner.retry')}
      </button>
    </div>
  );
}

export function DynamicToolFallback({ toolName, args, addResult, status }) {
  const { toolAnnotations } = useContext(AssistantToolContext);
  const { getAccessToken } = useContext(EmberContext);
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
  if (part.type === 'reasoning') {
    return (
      <details className="message__reasoning">
        <summary>Réflexion</summary>
        <p className="message__reasoning-text">{part.text}</p>
      </details>
    );
  }
  return (
    <div
      className="message__text"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(mdConverter.makeHtml(part.text)) }}
    />
  );
}

function UserMessage() {
  const messageId = useAuiState((s) => s.message.id);
  const filename = useMessageAttachment(messageId);
  return (
    <div className="message message--user">
      <div className="message__bubble">
        {filename && <div className="message__attachment-ref">📎 {filename}</div>}
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
        <AuiIf
          condition={(s) =>
            !s.message.parts.some(
              (p) =>
                (p.type === 'text' && p.text) ||
                p.type?.startsWith('tool-') ||
                p.type === 'dynamic-tool' ||
                (p.type === 'reasoning' && p.text),
            )
          }
        >
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

// Client-side executor for read_document: reads from documentRegistry, no UI.
// Exported for testing.
export function ReadDocumentExecutor({ args, addResult, status }) {
  useEffect(() => {
    const isRunning = status?.type === 'running' || status === 'running';
    if (!isRunning) return;

    // Guard: args arrive incrementally during streaming — wait for complete args
    if (!args?.documentId || !args?.sheet || args?.from == null || args?.to == null) return;

    const doc = documentRegistry.get(args.documentId);
    if (!doc) {
      addResult({ error: `Document not found: ${args.documentId}` });
      return;
    }

    try {
      const result = doc.plage(args.sheet, args.from, args.to);
      addResult(result);
    } catch {
      addResult({ error: 'Max 50 rows per call' });
    }
  }, [args?.documentId, args?.sheet, args?.from, args?.to, status?.type]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

const clientToolSchemas = {
  run_script: {
    description:
      'Simulate a batch of organizations from a document. Runs a JavaScript script row by row, returns a simulation summary. The LLM must analyze the result and call approve_lot to execute.',
    parameters: {
      type: 'object',
      properties: {
        script: {
          type: 'string',
          description:
            'The JavaScript script to execute. Has access to `sheets` (array of sheets; `sheets[0]` is the first sheet as an array of row arrays). IMPORTANT: never rebind `sheets` — use `const rows = sheets[0]` instead. Also has `tools.call(name, args, { ligne })` function where `ligne` MUST be a 1-based row number (integer), never the row array itself.',
        },
        documentId: {
          type: 'string',
          description: 'The ID of the document to process.',
        },
      },
      required: ['script', 'documentId'],
    },
  },
  approve_lot: {
    description:
      'Execute the batch of organizations that was validated during the last simulation. Only call after the user has confirmed and the simulation shows no unresolved errors.',
    parameters: {
      type: 'object',
      properties: {
        documentId: {
          type: 'string',
          description: 'The documentId returned in the simulation summary.',
        },
      },
      required: ['documentId'],
    },
  },
  read_document: {
    description: 'Read a range of rows from a document sheet. Maximum 50 rows per call.',
    parameters: {
      type: 'object',
      properties: {
        documentId: { type: 'string' },
        sheet: { type: 'string', description: 'Sheet name' },
        from: { type: 'number', description: '1-based start row' },
        to: { type: 'number', description: '1-based end row (inclusive, max from+49)' },
      },
      required: ['documentId', 'sheet', 'from', 'to'],
    },
  },
};

function ToolRegistrar({ onNavigateToOrganization }) {
  const { getAccessToken } = useContext(EmberContext);

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

  useAssistantToolUI({
    toolName: 'run_script',
    render: ({ args, addResult, status }) => (
      <LotToolUI args={args} addResult={addResult} status={status} />
    ),
  });

  useAssistantToolUI({
    toolName: 'approve_lot',
    render: ({ args, addResult, status }) => (
      <ApproveLotToolUI args={args} addResult={addResult} status={status} />
    ),
  });

  useAssistantToolUI({
    toolName: 'read_document',
    render: ({ args, addResult, status }) => (
      <ReadDocumentExecutor args={args} addResult={addResult} status={status} />
    ),
  });

  return null;
}

export default function AssistantApp({ getAccessToken, onNavigateToOrganization, t }) {
  const getAccessTokenRef = useRef(getAccessToken);
  getAccessTokenRef.current = getAccessToken;

  const [toolAnnotations, setToolAnnotations] = useState(null);
  const [pendingDoc, setPendingDoc] = useState(null);
  const [fileError, setFileError] = useState(null);
  const pendingDocRef = useRef(null);
  pendingDocRef.current = pendingDoc;
  // Persists the document context for injection on every subsequent turn, even after
  // pendingDoc is cleared (which only controls the one-time attachment pill display).
  const documentContextRef = useRef(null);

  // Clean up documents registered in this session when component unmounts
  useEffect(() => {
    return () => { documentRegistry.clear(); };
  }, []);

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

  const handleFileChange = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileError(null);
    try {
      const { name, sheets } = await readFile(file);
      const doc = new DocumentDepose({ id: crypto.randomUUID(), nom: name, feuilles: sheets });
      documentRegistry.set(doc.id, doc);
      documentContextRef.current = `[Document: ${doc.nom}]\ndocumentId: ${doc.id}\n${doc.sommaire()}`;
      setPendingDoc(doc);
    } catch (err) {
      setFileError(err?.message ?? 'Cannot read this file');
    }
    // Reset input so the same file can be re-selected
    event.target.value = '';
  }, []);

  const transport = useMemo(
    () =>
      new AssistantChatTransport({
        api: '/api/admin/llm-assistant/conversations/messages',
        headers: async () => ({
          Authorization: `Bearer ${await getAccessTokenRef.current()}`,
        }),
        body: { tools: clientToolSchemas },
        fetch: async (url, options) => {
          const docCtx = documentContextRef.current;
          if (docCtx && typeof options?.body === 'string') {
            try {
              const parsed = JSON.parse(options.body);
              parsed.documentContext = docCtx;

              // Show the attachment pill only on the first user message after upload
              // (pendingDoc is cleared after that turn; documentContextRef persists).
              const doc = pendingDocRef.current;
              if (doc) {
                const msgs = parsed.messages;
                if (Array.isArray(msgs) && msgs.length > 0) {
                  const lastMsg = msgs[msgs.length - 1];
                  if (lastMsg?.role === 'user' && lastMsg.id) {
                    setMessageAttachment(lastMsg.id, doc.nom);
                  }
                }
              }

              const response = await fetch(url, { ...options, body: JSON.stringify(parsed) });
              if (response.ok) setPendingDoc(null);
              return response;
            } catch {
              // JSON parse failed — send as-is
            }
          }
          return fetch(url, options);
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const emberContextValue = useMemo(
    () => ({ t: t ?? ((key) => key), getAccessToken }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t],
  );

  return (
    <EmberContext.Provider value={emberContextValue}>
      <AssistantToolContext.Provider value={{ toolAnnotations }}>
        <div className="assistant-popover">
          <AssistantRuntimeProvider runtime={runtime}>
            <ToolRegistrar onNavigateToOrganization={onNavigateToOrganization} />
            <ErrorBanner />
            <div className="assistant-header">
              <span className="assistant-header__icon">✦</span>
              <span className="assistant-header__title">{t ? t('components.assistant.header.title') : 'Assistant Pix'}</span>
            </div>
            <ThreadPrimitive.Root className="assistant-thread">
              <ThreadPrimitive.Viewport className="assistant-viewport">
                <ThreadPrimitive.Empty>
                  <div className="assistant-empty">
                    <p className="assistant-empty__title">{t ? t('components.assistant.empty-state.title') : ''}</p>
                    <p className="assistant-empty__hint">{t ? t('components.assistant.empty-state.hint') : ''}</p>
                  </div>
                </ThreadPrimitive.Empty>
                <ThreadPrimitive.Messages components={{ Message }} />
              </ThreadPrimitive.Viewport>
              <div className="assistant-composer">
                {fileError && (
                  <div className="composer__file-error" role="alert">
                    {fileError}
                  </div>
                )}
                {pendingDoc && (
                  <div className="composer__attachment" aria-label={t ? `${t('components.assistant.composer.attach-aria-label')}: ${pendingDoc.nom}` : pendingDoc.nom}>
                    <span className="composer__attachment-name">{pendingDoc.nom}</span>
                    <button
                      className="composer__attachment-remove"
                      aria-label={t ? t('components.assistant.composer.remove-attachment-aria-label') : ''}
                      onClick={() => setPendingDoc(null)}
                    >
                      x
                    </button>
                  </div>
                )}
                <ComposerPrimitive.Root>
                  <label className="composer__attach-label" aria-label={t ? t('components.assistant.composer.attach-aria-label') : ''} title={t ? t('components.assistant.composer.attach-aria-label') : ''}>
                    <input
                      type="file"
                      accept=".xlsx,.csv"
                      className="composer__attach-input"
                      onChange={handleFileChange}
                    />
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                    </svg>
                  </label>
                  <ComposerPrimitive.Input
                    className="composer__input"
                    placeholder={t ? t('components.assistant.composer.placeholder') : ''}
                    autoFocus
                  />
                  <ComposerPrimitive.Send className="composer__send" aria-label={t ? t('components.assistant.composer.send-aria-label') : ''}>
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
    </EmberContext.Provider>
  );
}
