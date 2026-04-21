import { EventStreamEncoderStream } from '../../../../../../src/llm/infrastructure/streaming/transforms/event-stream-encoder-transform.js';

describe('LLM | Unit | Infrastructure | Streaming | Transforms | EventStreamEncoderStream', function () {
  context('when a chunk contains "message"', function () {
    it('should encode the message into event-stream format', async function () {
      // given
      const input = [
        { message: 'Coucou les amis comment ça va ?' },
        { pasMessage: 'Ca va super' },
        { message: 'Et toi ?' },
      ];
      const readable = ReadableStream.from(input);
      const transform = new EventStreamEncoderStream();
      let result = '';
      const writable = new WritableStream({
        write(chunk) {
          result += chunk;
        },
      });

      // when
      await readable.pipeThrough(transform).pipeTo(writable);

      // then
      expect(result).to.equal('data: Coucou les amis comment ça va ?\n\ndata: Et toi ?\n\n');
    });

    context('when the message is multiline', function () {
      it('should replace "\n" with "\ndata: " to comply with event-stream format', async function () {
        // given
        const input = [
          { message: 'Coucou les amis !\n comment ça va ?' },
          { message: 'Moi ?\nÇa va... \n\n Super !!!' },
        ];
        const readable = ReadableStream.from(input);
        const transform = new EventStreamEncoderStream();
        let result = '';
        const writable = new WritableStream({
          write(chunk) {
            result += chunk;
          },
        });

        // when
        await readable.pipeThrough(transform).pipeTo(writable);

        // then
        expect(result).to.equal(
          'data: Coucou les amis !\ndata:  comment ça va ?\n\ndata: Moi ?\ndata: Ça va... \ndata: \ndata:  Super !!!\n\n',
        );
      });
    });
  });

  context('when a chunk contains "ping"', function () {
    it('should encode the ping into event-stream format', async function () {
      // given
      const input = [{ message: 'before' }, { ping: true }, { message: 'after' }];
      const readable = ReadableStream.from(input);
      const transform = new EventStreamEncoderStream();
      let result = '';
      const writable = new WritableStream({
        write(chunk) {
          result += chunk;
        },
      });

      // when
      await readable.pipeThrough(transform).pipeTo(writable);

      // then
      expect(result).to.equal('data: before\n\nevent: ping\ndata: \n\ndata: after\n\n');
    });
  });
});
