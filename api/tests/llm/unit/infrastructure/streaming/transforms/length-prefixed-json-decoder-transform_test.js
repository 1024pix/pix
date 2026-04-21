import { LengthPrefixedJsonDecoderStream } from '../../../../../../src/llm/infrastructure/streaming/transforms/length-prefixed-json-decoder-transform.js';

describe('LLM | Unit | Infrastructure | Streaming | Transforms | LengthPrefixedJsonDecoderStream', function () {
  it('should create a TransformStream that is capable of extracting objects contained in streamed data formatted as "length prefixed json"', async function () {
    // given
    const incomingChunks = [
      '14:{"message":""}',
      '25:{"truc":{"machin":"oui"}}23:{"sur":"la même ligne"}',
      '83:{"quelquechose":"de different {\\"message\\":\\"feinte !\\"","message":"aeza\\"\\"{}()\'"}',
      '57:{"message":"\\"\\"{}()Izhoidze156:{\\"message\\":\\"troll\\"\'"}',
      '25:{"truc":{"machin":"oui"}}',
    ];
    const readable = ReadableStream.from(incomingChunks);
    const transform = new LengthPrefixedJsonDecoderStream();
    const result = [];
    const writable = new WritableStream({
      write(chunk) {
        result.push(chunk);
      },
    });

    // when
    await readable.pipeThrough(transform).pipeTo(writable);

    // then
    expect(result).to.deep.equal([
      { message: '' },
      { truc: { machin: 'oui' } },
      { sur: 'la même ligne' },
      { quelquechose: 'de different {"message":"feinte !"', message: 'aeza""{}()\'' },
      { message: '""{}()Izhoidze156:{"message":"troll"\'' },
      { truc: { machin: 'oui' } },
    ]);
  });
});
