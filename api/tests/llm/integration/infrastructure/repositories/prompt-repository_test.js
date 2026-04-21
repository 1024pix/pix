import { Readable } from 'node:stream';

import nock from 'nock';

import { LLMApiError } from '../../../../../src/llm/domain/errors.js';
import { Configuration } from '../../../../../src/llm/domain/models/Configuration.js';
import { prompt } from '../../../../../src/llm/infrastructure/repositories/prompt-repository.js';

import { catchErr } from '../../../../tooling/test-utils/error.js';
import { waitForStreamFinalizationToBeDone } from '../../../../tooling/test-utils/wait.js';

describe('LLM | Integration | Infrastructure | Repositories | prompt-repository', function () {
  context('#prompt', function () {
    const configuration = new Configuration({
      challenge: {
        inputMaxPrompts: 100,
        inputMaxChars: 255,
      },
    });

    context('when messages contains a single message', function () {
      it('should send the llm api the prompt with an empty history', async function () {
        // given
        const messages = buildMessageDTOs(['salut']);
        const llmResponseChunks = [
          '60:{"ceci":"nest pas important","message":"coucou c\'est super"}',
          '40:{"message":"\\nle couscous c plutot bon"}47:{"message":" mais la paella c pas mal aussi\\n"}',
          '29:{"jecrois":{"que":"jaifini"}}',
        ];
        const llmPostPromptScope = nock('https://llm-test.pix.fr/api')
          .post('/chat', {
            configuration: {
              challenge: {
                inputMaxPrompts: 100,
                inputMaxChars: 255,
              },
            },
            history: [],
            prompt: 'salut',
          })
          .reply(201, Readable.from(llmResponseChunks));

        // when
        const response = await prompt({ messages, configuration });

        // then
        const parts = [];
        const decoder = new TextDecoder();
        for await (const chunk of response) {
          parts.push(decoder.decode(chunk));
        }
        await waitForStreamFinalizationToBeDone();
        const llmResponse = parts.join('');
        expect(llmResponse).to.deep.equal(llmResponseChunks.join(''));
        expect(llmPostPromptScope.isDone()).to.be.true;
      });

      context('when the llm api responds with an error', function () {
        context('when the error is a "502 gateway timeout"', function () {
          it('should retry the request 2 more times before throwing', async function () {
            // given
            const messages = buildMessageDTOs(['salut']);
            const body = {
              configuration: {
                challenge: {
                  inputMaxPrompts: 100,
                  inputMaxChars: 255,
                },
              },
              history: [],
              prompt: 'salut',
            };
            const llmPostPromptScope = nock('https://llm-test.pix.fr/api')
              .post('/chat', body)
              .reply(502, 'Gateway Timeout')
              .post('/chat?retry_count=1', body)
              .reply(502, 'Gateway Timeout')
              .post('/chat?retry_count=2', body)
              .reply(502, 'Gateway Timeout');

            // when
            const error = await catchErr(prompt)({ messages, configuration });

            // then
            expect(error).to.deepEqualInstance(new LLMApiError('Gateway Timeout'));
            expect(llmPostPromptScope.isDone()).to.be.true;
          });

          context('when the llm api responds normally after retrying', function () {
            it('should return the response', async function () {
              // given
              const messages = buildMessageDTOs(['salut']);
              const llmResponseChunks = ['23:{"message":"Bonjour !"}'];
              const body = {
                configuration: {
                  challenge: {
                    inputMaxPrompts: 100,
                    inputMaxChars: 255,
                  },
                },
                history: [],
                prompt: 'salut',
              };
              const llmPostPromptScope = nock('https://llm-test.pix.fr/api')
                .post('/chat', body)
                .reply(502, 'Gateway Timeout')
                .post('/chat?retry_count=1', body)
                .reply(502, 'Gateway Timeout')
                .post('/chat?retry_count=2', body)
                .reply(201, Readable.from(llmResponseChunks));

              // when
              const response = await prompt({ messages, configuration });

              // then
              const parts = [];
              const decoder = new TextDecoder();
              for await (const chunk of response) {
                parts.push(decoder.decode(chunk));
              }
              await waitForStreamFinalizationToBeDone();
              const llmResponse = parts.join('');
              expect(llmResponse).to.deep.equal(llmResponseChunks.join(''));
              expect(llmPostPromptScope.isDone()).to.be.true;
            });
          });
        });

        context('when the error is not a 502', function () {
          it('should throw the error', async function () {
            // given
            const messages = buildMessageDTOs(['salut']);
            const llmPostPromptScope = nock('https://llm-test.pix.fr/api')
              .post('/chat', {
                configuration: {
                  challenge: {
                    inputMaxPrompts: 100,
                    inputMaxChars: 255,
                  },
                },
                history: [],
                prompt: 'salut',
              })
              .reply(500, 'Internal Server Error');

            // when
            const error = await catchErr(prompt)({ messages, configuration });

            // then
            expect(error).to.deepEqualInstance(new LLMApiError('Internal Server Error'));
            expect(llmPostPromptScope.isDone()).to.be.true;
          });
        });
      });
    });

    context('when messages contains a several messages', function () {
      it('should send the llm api the prompt with an history excluding it', async function () {
        // given
        const messages = buildMessageDTOs(['salut', 'bonjour', 'ça va ?', 'oui et vous ?', 'oui très bien merci']);
        const llmResponseChunks = [
          '60:{"ceci":"nest pas important","message":"c\'est super"}',
          '40:{"message":"\\nle couscous c plutot bon"}47:{"message":" mais la paella c pas mal aussi\\n"}',
          '29:{"jecrois":{"que":"jaifini"}}',
        ];
        const llmPostPromptScope = nock('https://llm-test.pix.fr/api')
          .post('/chat', {
            configuration: {
              challenge: {
                inputMaxPrompts: 100,
                inputMaxChars: 255,
              },
            },
            history: [
              {
                content: 'salut',
                role: 'user',
              },
              {
                content: 'bonjour',
                role: 'assistant',
              },
              {
                content: 'ça va ?',
                role: 'user',
              },
              {
                content: 'oui et vous ?',
                role: 'assistant',
              },
            ],
            prompt: 'oui très bien merci',
          })
          .reply(201, Readable.from(llmResponseChunks));

        // when
        const response = await prompt({ messages, configuration });

        // then
        const parts = [];
        const decoder = new TextDecoder();
        for await (const chunk of response) {
          parts.push(decoder.decode(chunk));
        }
        await waitForStreamFinalizationToBeDone();
        const llmResponse = parts.join('');
        expect(llmResponse).to.deep.equal(llmResponseChunks.join(''));
        expect(llmPostPromptScope.isDone()).to.be.true;
      });
    });
  });
});

/**
 * @typedef MessageDTO
 * @property {string=} content
 * @property {"user"|"assistant"} role
 */

/**
 * @param {string[]} messages
 * @returns {MessageDTO[]}
 */
function buildMessageDTOs(messages) {
  const messageDTOs = [];
  for (let i = 0; i < messages.length; i++) {
    messageDTOs.push({
      content: messages[i],
      role: i % 2 === 0 ? 'user' : 'assistant',
    });
  }
  return messageDTOs;
}
