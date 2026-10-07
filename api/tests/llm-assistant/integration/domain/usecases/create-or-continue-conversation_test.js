import { Readable } from 'node:stream';

import { expect } from 'chai';
import nock from 'nock';

import { InferenceProviderError } from '../../../../../src/llm-assistant/domain/errors.ts';
import { Conversation } from '../../../../../src/llm-assistant/domain/models/Conversation.ts';
import { Message } from '../../../../../src/llm-assistant/domain/models/Message.ts';
import { usecases } from '../../../../../src/llm-assistant/domain/usecases/index.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

const PROVIDER_ORIGIN = 'https://llm-assistant-test.pix.fr';
const COMPLETIONS_PATH = '/v1/chat/completions';

function buildConversation() {
  return new Conversation({
    id: 'a-conversation-id',
    messages: [new Message({ id: 'a-message-id', role: 'user', content: 'Bonjour' })],
    today: '2026-10-06',
  });
}

function replyWithOneToken() {
  return [
    'data: {"id":"1","choices":[{"index":0,"delta":{"role":"assistant","content":"Bonjour"}}]}\n\n',
    'data: {"id":"1","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}\n\n',
    'data: [DONE]\n\n',
  ].join('');
}

describe('Llm-Assistant | Integration | Domain | UseCases | create-or-continue-conversation', function () {
  it('reaches the repository and hands back the stream it opened', async function () {
    // given
    const scope = nock(PROVIDER_ORIGIN)
      .post(COMPLETIONS_PATH)
      .reply(200, replyWithOneToken(), { 'content-type': 'text/event-stream' });

    // when
    const opened = await usecases.createOrContinueConversation({ conversation: buildConversation() });

    // then
    expect(opened).to.be.an.instanceOf(Readable);
    expect(scope.isDone()).to.be.true;
  });

  it('lets a refusal from the provider surface as an InferenceProviderError', async function () {
    // given
    nock(PROVIDER_ORIGIN)
      .post(COMPLETIONS_PATH)
      .reply(401, { error: { message: 'invalid api key' } });

    // when
    const error = await catchErr(usecases.createOrContinueConversation)({ conversation: buildConversation() });

    // then
    expect(error).to.be.an.instanceOf(InferenceProviderError);
  });
});
