import { Chat } from '../../../../../src/llm/domain/models/Chat.js';
import { LLMResponseHandler } from '../../../../../src/llm/infrastructure/streaming/llm-response-handler.js';

describe('LLM | Unit | Infrastructure | Streaming | LLMResponseHandler', function () {
  describe('#processLlmResponse', function () {
    context('when llmResponseStream is not set', function () {
      it('should return an llmResponseMetadata object with default values', async function () {
        // given
        const llmResponseHandler = new LLMResponseHandler(new WritableStream());

        // when
        const llmResponseMetadata = await llmResponseHandler.processLlmResponse();

        // then
        expect(llmResponseMetadata).to.deep.equal({
          messageParts: [],
          haveVictoryConditionsBeenFulfilled: false,
          inputTokens: 0,
          outputTokens: 0,
          wasModerated: false,
          errorOccurredDuringStream: false,
        });
      });
    });

    context('when llmResponseStream is set nominally', function () {
      context('when stream contains encoded message parts', function () {
        it('should write message chunks in the response stream and return an llmResponseMetadata with message chunks in messageParts', async function () {
          // given
          const chunks = [];
          const responseStream = new WritableStream({
            write(chunk) {
              chunks.push(chunk);
            },
          });
          const llmResponseHandler = new LLMResponseHandler(responseStream);

          const llmResponseChunks = [
            {
              message: 'pa',
            },
            {
              message: 'ta',
            },
            {
              ping: true,
            },
            {
              message: 'te',
              isValid: true,
              usage: {
                input_tokens: 50,
                output_tokens: 50,
              },
            },
          ].map(toLengthPrefixedJSONChunk);
          llmResponseHandler.llmResponseStream = ReadableStream.from(llmResponseChunks);

          // when
          const metadata = await llmResponseHandler.processLlmResponse();
          const result = chunks.join('');

          // then
          expect(metadata).to.deep.equal({
            messageParts: ['pa', 'ta', 'te'],
            inputTokens: 50,
            outputTokens: 50,
            wasModerated: false,
            errorOccurredDuringStream: false,
            haveVictoryConditionsBeenFulfilled: true,
          });

          expect(result).to.equal('data: pa\n\ndata: ta\n\nevent: ping\ndata: \n\ndata: te\n\n');
        });
      });
    });
  });

  describe('#pushDebugEvents', function () {
    context('when given number of inputTokens and outputTokens', function () {
      it('should write debug-input-tokens and debug-output-tokens events', async function () {
        // given
        const chunks = [];
        const responseStream = new WritableStream({
          write(chunk) {
            chunks.push(chunk);
          },
        });
        const llmResponseHandler = new LLMResponseHandler(responseStream);
        const inputTokens = 300;
        const outputTokens = 1_000;

        // when
        await llmResponseHandler.pushDebugEvents({ inputTokens, outputTokens });
        const result = chunks.join('');

        // then
        const debugInputTokensEvent = 'event: debug-input-tokens\ndata: 300\n\n';
        const debugOutputTokensEvent = 'event: debug-output-tokens\ndata: 1000\n\n';
        expect(result).to.equal(debugInputTokensEvent + debugOutputTokensEvent);
      });
    });

    context('when given nullish inputTokens or outputTokens', function () {
      it('should write debug-input-tokens and debug-output-tokens events with 0 as default', async function () {
        // given
        const chunks = [];
        const responseStream = new WritableStream({
          write(chunk) {
            chunks.push(chunk);
          },
        });
        const llmResponseHandler = new LLMResponseHandler(responseStream);

        // when
        await llmResponseHandler.pushDebugEvents();
        const result = chunks.join('');

        // then
        const debugInputTokensEvent = 'event: debug-input-tokens\ndata: 0\n\n';
        const debugOutputTokensEvent = 'event: debug-output-tokens\ndata: 0\n\n';
        expect(result).to.equal(debugInputTokensEvent + debugOutputTokensEvent);
      });
    });
  });

  describe('#pushAttachmentEvent', function () {
    context('when attachment status is SUCCESS', function () {
      it('should write an attachment-success event in the response stream', async function () {
        // given
        const chunks = [];
        const responseStream = new WritableStream({
          write(chunk) {
            chunks.push(chunk);
          },
        });
        const llmResponseHandler = new LLMResponseHandler(responseStream);
        const attachmentStatus = Chat.ATTACHMENT_STATUS.SUCCESS;

        // when
        await llmResponseHandler.pushAttachmentEvent(attachmentStatus);
        const result = chunks.join('');

        // then
        expect(result).to.equal('event: attachment-success\ndata: \n\n');
      });
    });

    context('when attachment status is FAILURE', function () {
      it('should write an attachment-failure event in the response stream', async function () {
        // given
        const chunks = [];
        const responseStream = new WritableStream({
          write(chunk) {
            chunks.push(chunk);
          },
        });
        const llmResponseHandler = new LLMResponseHandler(responseStream);
        const attachmentStatus = Chat.ATTACHMENT_STATUS.FAILURE;

        // when
        await llmResponseHandler.pushAttachmentEvent(attachmentStatus);
        const result = chunks.join('');

        // then
        expect(result).to.equal('event: attachment-failure\ndata: \n\n');
      });
    });
  });

  describe('#pushMessageModeratedEvent', function () {
    it('should write a user-message-moderated event in the response stream', async function () {
      // given
      const chunks = [];
      const responseStream = new WritableStream({
        write(chunk) {
          chunks.push(chunk);
        },
      });
      const llmResponseHandler = new LLMResponseHandler(responseStream);

      // when
      await llmResponseHandler.pushMessageModeratedEvent();
      const result = chunks.join('');

      // then
      expect(result).to.equal('event: user-message-moderated\ndata: \n\n');
    });
  });

  describe('#pushErrorEvent', function () {
    it('should write an error event in the response stream', async function () {
      // given
      const chunks = [];
      const responseStream = new WritableStream({
        write(chunk) {
          chunks.push(chunk);
        },
      });
      const llmResponseHandler = new LLMResponseHandler(responseStream);

      // when
      await llmResponseHandler.pushErrorEvent();
      const result = chunks.join('');

      // then
      expect(result).to.equal('event: error\ndata: \n\n');
    });
  });

  describe('#pushVictoryConditionsSuccessEvent', function () {
    it('should write a victory-conditions-success event in the response stream', async function () {
      // given
      const chunks = [];
      const responseStream = new WritableStream({
        write(chunk) {
          chunks.push(chunk);
        },
      });
      const llmResponseHandler = new LLMResponseHandler(responseStream);

      // when
      await llmResponseHandler.pushVictoryConditionsSuccessEvent();
      const result = chunks.join('');

      // then
      expect(result).to.equal('event: victory-conditions-success\ndata: \n\n');
    });
  });

  describe('#finish', function () {
    it('should close the response stream', async function () {
      // given
      const chunks = [];
      const responseStream = new WritableStream({
        write(chunk) {
          chunks.push(chunk);
        },
      });
      const llmResponseHandler = new LLMResponseHandler(responseStream);

      // when
      await llmResponseHandler.finish();
      const result = chunks.join('');
      await responseStream.getWriter().closed;

      // then
      expect(result).to.equal('');
    });

    context('when there is an error in the stream', function () {
      it('should not throw again', async function () {
        // given
        const responseStream = new WritableStream({
          write() {
            throw new Error('patate');
          },
        });
        const llmResponseHandler = new LLMResponseHandler(responseStream);

        // when
        let hasThrown = false;
        await llmResponseHandler.pushDebugEvents().catch(() => {
          hasThrown = true;
        });

        // then
        expect(hasThrown, 'Writable deliberately throws').to.be.true;
        expect(await llmResponseHandler.finish()).not.to.throw;
      });
    });
  });
});

const textEncoder = new TextEncoder();

function toLengthPrefixedJSONChunk(object) {
  const stringifiedChunk = JSON.stringify(object);
  return textEncoder.encode(`${stringifiedChunk.length}:${stringifiedChunk}`);
}
