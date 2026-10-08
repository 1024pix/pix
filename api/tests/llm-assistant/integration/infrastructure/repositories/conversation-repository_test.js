import { expect } from 'chai';
import nock from 'nock';

import { Conversation } from '../../../../../src/llm-assistant/domain/models/Conversation.ts';
import { Message } from '../../../../../src/llm-assistant/domain/models/Message.ts';
import { stream } from '../../../../../src/llm-assistant/infrastructure/repositories/conversation-repository.ts';

const PROVIDER_ORIGIN = 'https://llm-assistant-test.pix.fr';
const COMPLETIONS_PATH = '/v1/chat/completions';

function buildConversation(messages) {
  return new Conversation({
    id: 'a-conversation-id',
    messages: messages.map(({ role, content }, index) => new Message({ id: `message-${index}`, role, content })),
    today: '2026-10-06',
  });
}

function replyWithTokens(tokens) {
  const chunks = tokens.map((content, index) => ({
    id: 'a-completion-id',
    choices: [{ index: 0, delta: index === 0 ? { role: 'assistant', content } : { content } }],
  }));

  chunks.push({ id: 'a-completion-id', choices: [{ index: 0, delta: {}, finish_reason: 'stop' }] });

  return chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`).join('') + 'data: [DONE]\n\n';
}

async function readTextFrom(body) {
  const decoder = new TextDecoder();
  let buffer = '';

  for await (const chunk of body) {
    buffer += decoder.decode(chunk);
  }

  return buffer
    .split('\n')
    .filter((line) => line.startsWith('data: ') && line !== 'data: [DONE]')
    .map((line) => JSON.parse(line.slice('data: '.length)))
    .filter(({ type }) => type === 'text-delta')
    .map(({ delta }) => delta)
    .join('');
}

describe('Llm-Assistant | Integration | Infrastructure | Repositories | conversation-repository', function () {
  describe('#stream', function () {
    it('turns the conversation into instructions followed by its messages, in order', async function () {
      // given
      const conversation = buildConversation([
        { role: 'user', content: 'Bonjour' },
        { role: 'assistant', content: 'Bonjour, que puis-je faire ?' },
        { role: 'user', content: 'Rien du tout' },
      ]);
      let sentMessages;
      const scope = nock(PROVIDER_ORIGIN)
        .post(COMPLETIONS_PATH, ({ messages }) => {
          sentMessages = messages;
          return true;
        })
        .reply(200, replyWithTokens(['Entendu']), { 'content-type': 'text/event-stream' });

      // when
      await readTextFrom(await stream({ conversation }));

      // then
      expect(sentMessages).to.deep.equal([
        { role: 'system', content: conversation.systemPrompt },
        { role: 'user', content: 'Bonjour' },
        { role: 'assistant', content: 'Bonjour, que puis-je faire ?' },
        { role: 'user', content: 'Rien du tout' },
      ]);
      expect(scope.isDone()).to.be.true;
    });

    it('encodes what the provider answers into a stream the browser can read', async function () {
      // given
      const conversation = buildConversation([{ role: 'user', content: 'Bonjour' }]);
      nock(PROVIDER_ORIGIN)
        .post(COMPLETIONS_PATH)
        .reply(200, replyWithTokens(['Bon', 'jour', ' à ', 'vous']), { 'content-type': 'text/event-stream' });

      // when
      const text = await readTextFrom(await stream({ conversation }));

      // then
      expect(text).to.equal('Bonjour à vous');
    });
  });
});
