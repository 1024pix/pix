import { finished } from 'node:stream/promises';
import { setImmediate } from 'node:timers/promises';

import { expect } from 'chai';
import sinon from 'sinon';

import { COPY_FRAME_BYTES, copyToStdout } from '../../../../../src/maddo/infrastructure/utils/copy-to-stdout.ts';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Maddo | Infrastructure | Utils | Unit | copy-to-stdout', function () {
  const columns = ['id', 'payload'];
  let connection;
  let pgClient;
  let submitted;

  const wire = () => {
    connection = {
      query: sinon.stub(),
      stream: { pause: sinon.stub(), resume: sinon.stub() },
    };
    pgClient = { connection, query: sinon.stub().callsFake((query) => (submitted = query)) };
    return copyToStdout({ pgClient, table: 't', columns });
  };

  const serverSends = (lines) => {
    for (const line of lines) submitted.handleCopyData({ chunk: Buffer.from(line) });
  };
  const serverCompletes = () => {
    submitted.handleCommandComplete({ text: 'COPY 0' });
    submitted.handleReadyForQuery();
  };
  // Frames as pushed: pipe() and 'data' hand them over one by one, whereas read() would concatenate them.
  const readAll = (copy) =>
    new Promise((resolve, reject) => {
      const frames = [];
      copy.on('data', (frame) => frames.push(frame));
      copy.once('end', () => resolve(frames));
      copy.once('error', reject);
    });

  it('should submit a COPY TO STDOUT statement with quoted identifiers to the pg client', function () {
    // given
    const pgClient = { query: sinon.stub(), connection: { stream: {} } };

    // when
    const copy = copyToStdout({ pgClient, table: 'data_export', columns: ['last_name', 'weird"col'] });

    // then
    const expectedText = 'COPY "data_export" ("last_name", "weird""col") TO STDOUT WITH (FORMAT csv)';
    expect(copy.text).to.equal(expectedText);
    expect(pgClient.query).to.have.been.calledOnce;
    expect(pgClient.query.firstCall.args[0].text).to.equal(expectedText);
    expect(pgClient.query.firstCall.args[0].submit).to.be.a('function');
  });

  it('should refuse an empty column list', function () {
    const pgClient = { query: sinon.stub(), connection: { stream: {} } };

    expect(() => copyToStdout({ pgClient, table: 't', columns: [] })).to.throw('at least one column');
    expect(pgClient.query).to.not.have.been.called;
  });

  it('should coalesce the per-row CopyData messages into frames of at most 512 KiB', async function () {
    // given
    const copy = wire();
    const line = '"1","' + 'x'.repeat(1000) + '"\n'; // a bit more than 1 KB

    // when
    serverSends(Array.from({ length: 1500 }, () => line)); // ~1500 KB -> 2 full frames + the remainder
    serverCompletes();
    const frames = await readAll(copy);

    // then
    expect(frames).to.have.lengthOf(3);
    expect(frames[0].length).to.be.within(COPY_FRAME_BYTES - line.length, COPY_FRAME_BYTES);
    expect(frames[1].length).to.be.within(COPY_FRAME_BYTES - line.length, COPY_FRAME_BYTES);
    expect(Buffer.concat(frames).toString()).to.equal(line.repeat(1500));
  });

  it('should copy each chunk, since pg reuses its read buffer', async function () {
    // given
    const copy = wire();
    const chunk = Buffer.from('"1","original"\n');

    // when
    submitted.handleCopyData({ chunk });
    chunk.fill('#');
    serverCompletes();
    const frames = await readAll(copy);

    // then
    expect(Buffer.concat(frames).toString()).to.equal('"1","original"\n');
  });

  it('should push a row larger than a frame on its own, after the frame under construction', async function () {
    // given
    const copy = wire();
    const small = '"1","small"\n';
    const huge = '"2","' + 'x'.repeat(COPY_FRAME_BYTES) + '"\n';

    // when
    serverSends([small, huge, small]);
    serverCompletes();
    const frames = await readAll(copy);

    // then
    expect(frames.map((frame) => frame.length)).to.deep.equal([small.length, huge.length, small.length]);
  });

  it('should pause the socket when the consumer lags and resume it when the consumer reads', async function () {
    // given
    const copy = wire();
    const line = '"1","' + 'x'.repeat(1000) + '"\n';

    // when
    serverSends(Array.from({ length: 1500 }, () => line)); // two full frames pushed, nobody reads
    expect(connection.stream.pause).to.have.been.called;
    serverCompletes();
    await readAll(copy);

    // then
    expect(connection.stream.resume).to.have.been.called;
  });

  it('should close only once the server is ready again after the end of the data', async function () {
    // given
    const copy = wire();
    serverSends(['"1","x"\n']);
    submitted.handleCommandComplete({ text: 'COPY 1' });

    // when
    await readAll(copy);
    const closing = finished(copy);
    await setImmediate();

    // then
    expect(copy.closed).to.be.false;
    submitted.handleReadyForQuery();
    await closing;
    expect(copy.closed).to.be.true;
  });

  it('should error with the server error when the server rejects the COPY', async function () {
    // given
    const copy = wire();
    const serverError = new Error('relation "t" does not exist');

    // when
    submitted.handleError(serverError);
    const error = await catchErr(() => finished(copy))();

    // then
    expect(error).to.equal(serverError);
    expect(copy.closed).to.be.true;
  });

  describe('when destroyed', function () {
    it('should discard the rest of the data and close once the server is ready again', async function () {
      // given
      const copy = wire();
      const consumerError = new Error('consumer failed');
      serverSends(['"1","x"\n']);

      // when
      copy.destroy(consumerError);
      const closing = catchErr(() => finished(copy))();
      await setImmediate();

      // then
      expect(connection.stream.resume).to.have.been.called;
      expect(copy.closed).to.be.false;
      serverSends(['"2","y"\n']); // still streaming: ignored
      serverCompletes();
      expect(await closing).to.equal(consumerError);
      expect(copy.closed).to.be.true;
    });
  });
});
