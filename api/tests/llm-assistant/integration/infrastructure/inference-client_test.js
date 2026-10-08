import { createServer } from 'node:http';
import { Readable } from 'node:stream';

import { expect } from 'chai';
import nock from 'nock';

import { config } from '../../../../config/config.js';
import {
  InferenceProviderError,
  InferenceProviderNotConfiguredError,
} from '../../../../src/llm-assistant/domain/errors.ts';
import { ask } from '../../../../src/llm-assistant/infrastructure/inference-client.ts';
import { catchErr } from '../../../tooling/test-utils/error.js';

const PROVIDER_ORIGIN = 'https://llm-assistant-test.pix.fr';
const COMPLETIONS_PATH = '/v1/chat/completions';

const aRequest = { system: 'Tu es Pixelle.', messages: [{ role: 'user', content: 'Bonjour' }] };

function replyWithTokens(tokens) {
  const chunks = tokens.map((content, index) => ({
    id: 'a-completion-id',
    choices: [{ index: 0, delta: index === 0 ? { role: 'assistant', content } : { content } }],
  }));

  chunks.push({ id: 'a-completion-id', choices: [{ index: 0, delta: {}, finish_reason: 'stop' }] });

  return chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`).join('') + 'data: [DONE]\n\n';
}

async function drain(parts, seen = []) {
  const reader = parts.getReader();

  while (true) {
    const { done, value } = await reader.read();

    if (done) return seen;

    seen.push(value);
  }
}

describe('Llm-Assistant | Integration | Infrastructure | inference-client', function () {
  describe('#ask', function () {
    it('asks the provider named by the configuration, with its key', async function () {
      // given
      let sentModel, sentAuthorization;
      const scope = nock(PROVIDER_ORIGIN)
        .post(COMPLETIONS_PATH, ({ model }) => {
          sentModel = model;
          return true;
        })
        .reply(function () {
          sentAuthorization = this.req.headers.authorization;
          return [200, replyWithTokens(['ok']), { 'content-type': 'text/event-stream' }];
        });

      // when
      await drain(await ask(aRequest));

      // then
      expect(sentModel).to.equal('a-test-model');
      expect(sentAuthorization).to.equal('Bearer La clé dans les tests');
      expect(scope.isDone()).to.be.true;
    });

    it('sends the instructions and the messages it was handed', async function () {
      // given
      let sentMessages;
      nock(PROVIDER_ORIGIN)
        .post(COMPLETIONS_PATH, ({ messages }) => {
          sentMessages = messages;
          return true;
        })
        .reply(200, replyWithTokens(['ok']), { 'content-type': 'text/event-stream' });

      // when
      await drain(await ask(aRequest));

      // then
      expect(sentMessages).to.deep.equal([
        { role: 'system', content: 'Tu es Pixelle.' },
        { role: 'user', content: 'Bonjour' },
      ]);
    });

    it('opens a stream of parts carrying what the provider answers', async function () {
      // given
      nock(PROVIDER_ORIGIN)
        .post(COMPLETIONS_PATH)
        .reply(200, replyWithTokens(['Bon', 'jour']), { 'content-type': 'text/event-stream' });

      // when
      const parts = await drain(await ask(aRequest));

      // then
      const text = parts
        .filter(({ type }) => type === 'text-delta')
        .map(({ text }) => text)
        .join('');
      expect(text).to.equal('Bonjour');
    });

    context('when the model is missing from the configuration', function () {
      let model;

      beforeEach(function () {
        model = config.llmAssistant.model;
        config.llmAssistant.model = undefined;
      });

      afterEach(function () {
        config.llmAssistant.model = model;
      });

      it('names the missing variable instead of calling the provider', async function () {
        // when
        const error = await catchErr(ask)(aRequest);

        // then
        expect(error).to.be.an.instanceOf(InferenceProviderNotConfiguredError);
        expect(error.message).to.contain('LLM_ASSISTANT_MODEL');
      });
    });

    context('when the provider refuses before answering', function () {
      it('throws an InferenceProviderError when the key is refused', async function () {
        // given
        nock(PROVIDER_ORIGIN)
          .post(COMPLETIONS_PATH)
          .reply(401, { error: { message: 'invalid api key' } });

        // when
        const error = await catchErr(ask)(aRequest);

        // then
        expect(error).to.be.an.instanceOf(InferenceProviderError);
      });

      it('throws an InferenceProviderError when the provider breaks down', async function () {
        // given
        const scope = nock(PROVIDER_ORIGIN).post(COMPLETIONS_PATH).reply(500, 'boom');

        // when
        const error = await catchErr(ask)(aRequest);

        // then
        expect(error).to.be.an.instanceOf(InferenceProviderError);
        expect(scope.isDone()).to.be.true;
      });

      it('tries only as many times as the configuration allows', async function () {
        // given
        let attempts = 0;
        nock(PROVIDER_ORIGIN)
          .post(COMPLETIONS_PATH)
          .times(5)
          .reply(() => {
            attempts += 1;
            return [500, 'boom'];
          });

        // when
        await catchErr(ask)(aRequest);

        // then
        expect(attempts).to.equal(config.llmAssistant.maxRetries + 1);
      });
    });

    context('when the caller stops reading early', function () {
      let server, baseUrl, closedByClient;

      beforeEach(async function () {
        closedByClient = false;
        server = createServer((request, response) => {
          response.writeHead(200, { 'content-type': 'text/event-stream' });
          response.write('data: {"id":"1","choices":[{"index":0,"delta":{"role":"assistant","content":"Bon"}}]}\n\n');
          request.on('close', () => {
            closedByClient = true;
          });
        });
        await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

        baseUrl = config.llmAssistant.baseUrl;
        config.llmAssistant.baseUrl = `http://127.0.0.1:${server.address().port}/v1`;
        nock.enableNetConnect('127.0.0.1');
      });

      afterEach(async function () {
        config.llmAssistant.baseUrl = baseUrl;
        nock.disableNetConnect();
        nock.enableNetConnect('localhost:9090');
        server.closeAllConnections();
        await new Promise((resolve) => server.close(resolve));
      });

      it('closes the connection to the provider instead of leaving it open', async function () {
        // when
        const parts = await ask(aRequest);
        const reader = parts.getReader();
        await reader.read();
        await reader.cancel();
        await new Promise((resolve) => setTimeout(resolve, 200));

        // then
        expect(closedByClient, 'le robinet est ferme chez le fournisseur').to.be.true;
      });
    });

    context('when the provider breaks down after the first token', function () {
      it('passes the failure on to the caller instead of truncating in silence', async function () {
        // given
        const started = 'data: {"id":"1","choices":[{"index":0,"delta":{"role":"assistant","content":"Bon"}}]}\n\n';
        nock(PROVIDER_ORIGIN)
          .post(COMPLETIONS_PATH)
          .reply(
            200,
            () => {
              const broken = new Readable({ read: () => undefined });
              broken.push(started);
              setTimeout(() => broken.destroy(new Error('the provider hung up')), 10);
              return broken;
            },
            { 'content-type': 'text/event-stream' },
          );

        // when
        const parts = await ask(aRequest);
        const seen = [];
        let failure = null;
        try {
          await drain(parts, seen);
        } catch (error) {
          failure = error;
        }

        // then
        expect(failure, 'la rupture est signalee au lieu de passer pour une fin normale').to.be.an('Error');
        expect(seen.map(({ type }) => type)).to.include('text-delta');
      });
    });
  });
});
