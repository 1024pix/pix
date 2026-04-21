import { ResponseObjectsParserStream } from '../../../../../../src/llm/infrastructure/streaming/transforms/response-objects-parser-transform.js';

describe('LLM | Unit | Infrastructure | Streaming | Transforms | ResponseObjectsParserStream', function () {
  let metadata;
  beforeEach(function () {
    metadata = {
      messageParts: [],
      haveVictoryConditionsBeenFulfilled: false,
      inputTokens: 0,
      outputTokens: 0,
      wasModerated: false,
    };
  });

  context('when a chunk contains "message"', function () {
    it('should update metadata.messageParts and forward the message in the stream', async function () {
      // given
      const input = [
        { message: 'Coucou les amis comment ça va ?' },
        { pasMessage: 'Ca va super' },
        { message: 'Et toi ?' },
      ];
      const readable = ReadableStream.from(input);
      const transform = new ResponseObjectsParserStream(metadata);
      const result = [];
      const writable = new WritableStream({
        write(chunk) {
          result.push(chunk);
        },
      });

      // when
      await readable.pipeThrough(transform).pipeTo(writable);

      // then
      expect(result).to.deep.equal([{ message: 'Coucou les amis comment ça va ?' }, { message: 'Et toi ?' }]);
      expect(metadata.messageParts).to.deep.equal(['Coucou les amis comment ça va ?', 'Et toi ?']);
    });
  });

  context('when a chunk contains "ping"', function () {
    it('should forward the ping in the stream', async function () {
      // given
      const input = [{ message: 'before' }, { ping: true }, { message: 'after' }];
      const readable = ReadableStream.from(input);
      const metadata = {
        messageParts: [],
      };
      const transform = new ResponseObjectsParserStream(metadata);
      const result = [];
      const writable = new WritableStream({
        write(chunk) {
          result.push(chunk);
        },
      });

      // when
      await readable.pipeThrough(transform).pipeTo(writable);

      // then
      expect(result).to.deep.equal([{ message: 'before' }, { ping: true }, { message: 'after' }]);
      expect(metadata.messageParts).to.deep.equal(['before', 'after']);
    });
  });

  context('when a chunk contains "usage"', function () {
    it('should update metadata with usage', async function () {
      // given
      const input = [{ usage: { input_tokens: 12, output_tokens: 34 } }];
      const readable = ReadableStream.from(input);
      const metadata = {
        messageParts: [],
      };
      const transform = new ResponseObjectsParserStream(metadata);
      const result = [];
      const writable = new WritableStream({
        write(chunk) {
          result.push(chunk);
        },
      });

      // when
      await readable.pipeThrough(transform).pipeTo(writable);

      // then
      expect(result).to.deep.equal([]);
      expect(metadata.messageParts).to.deep.equal([]);
      expect(metadata.inputTokens).to.equal(12);
      expect(metadata.outputTokens).to.equal(34);
    });
  });

  context('when a chunk contains "error"', function () {
    it('should update metadata.errorOccurredDuringStream', async function () {
      // given
      const input = [{ error: "désolé j'ai crash" }];
      const readable = ReadableStream.from(input);
      const metadata = {
        messageParts: [],
      };
      const transform = new ResponseObjectsParserStream(metadata);
      const result = [];
      const writable = new WritableStream({
        write(chunk) {
          result.push(chunk);
        },
      });

      // when
      await readable.pipeThrough(transform).pipeTo(writable);

      // then
      expect(result).to.deep.equal([]);
      expect(metadata.messageParts).to.deep.equal([]);
      expect(metadata.errorOccurredDuringStream).to.equal("désolé j'ai crash");
    });

    it('should not write in stream anymore after encoutering it', async function () {
      // given
      const input = [
        { message: 'before', usage: { input_tokens: 10, output_tokens: 10 } },
        { error: "désolé j'ai crash" },
        { wasModerated: true },
        { ping: true },
        { error: 'aïe' },
        { isValid: true },
        { message: 'after' },
        { usage: { input_tokens: 20, output_tokens: 20 } },
        { memeUnTrucImpossible: true },
      ];
      const readable = ReadableStream.from(input);
      const metadata = {
        messageParts: [],
      };
      const transform = new ResponseObjectsParserStream(metadata);
      const result = [];
      const writable = new WritableStream({
        write(chunk) {
          result.push(chunk);
        },
      });

      // when
      await readable.pipeThrough(transform).pipeTo(writable);

      // then
      expect(result).to.deep.equal([{ message: 'before' }]);
      expect(metadata).to.deep.equal({
        messageParts: ['before'],
        inputTokens: 10,
        outputTokens: 10,
        errorOccurredDuringStream: "désolé j'ai crash",
      });
    });
  });

  context('when a chunk contains "isValid"', function () {
    it('should update metadata.haveVictoryConditionsBeenFulfilled', async function () {
      // given
      const input = [{ message: 'patate', isValid: true }, { usage: { input_tokens: 1, output_tokens: 2 } }];
      const readable = ReadableStream.from(input);
      const metadata = {
        messageParts: [],
        haveVictoryConditionsBeenFulfilled: false,
      };
      const transform = new ResponseObjectsParserStream(metadata);
      const result = [];
      const writable = new WritableStream({
        write(chunk) {
          result.push(chunk);
        },
      });

      // when
      await readable.pipeThrough(transform).pipeTo(writable);

      // then
      expect(result).to.deep.equal([{ message: 'patate' }]);
      expect(metadata).to.deep.equal({
        haveVictoryConditionsBeenFulfilled: true,
        messageParts: ['patate'],
        inputTokens: 1,
        outputTokens: 2,
      });
    });
  });

  context('when a chunk contains "wasModerated"', function () {
    it('should update metadata.wasModerated', async function () {
      // given
      const input = [{ wasModerated: true }, { usage: { input_tokens: 1, output_tokens: 2 } }];
      const readable = ReadableStream.from(input);
      const metadata = {
        messageParts: [],
        wasModerated: false,
        inputTokens: 0,
        outputTokens: 0,
      };
      const transform = new ResponseObjectsParserStream(metadata);
      const result = [];
      const writable = new WritableStream({
        write(chunk) {
          result.push(chunk);
        },
      });

      // when
      await readable.pipeThrough(transform).pipeTo(writable);

      // then
      expect(result).to.deep.equal([]);
      expect(metadata).to.deep.equal({
        wasModerated: true,
        messageParts: [],
        inputTokens: 1,
        outputTokens: 2,
      });
    });
  });
});
