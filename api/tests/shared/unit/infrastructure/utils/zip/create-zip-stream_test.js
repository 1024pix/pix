import { Readable } from 'node:stream';

import { expect } from 'chai';
import JSZip from 'jszip';
import sinon from 'sinon';

import { createZipStream } from '../../../../../../src/shared/infrastructure/utils/zip/create-zip-stream.ts';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Shared | Unit | Utils | Zip | create zip stream', function () {
  let logger, dependencies, callbackFnc, callbackArgs;

  beforeEach(function () {
    logger = {
      error: sinon.stub(),
    };
    dependencies = {
      logger,
    };
    callbackFnc = sinon.stub();
  });

  // given
  it('returns the streamable zip with the expected content', async function () {
    callbackArgs = [0, 1, 2];
    callbackFnc.withArgs(0).resolves({ filename: 'fichier-0', content: 'coucou ' });
    callbackFnc.withArgs(1).resolves({ filename: 'fichier-1', content: Buffer.alloc(5) });
    callbackFnc.withArgs(2).resolves({ filename: 'fichier-2', content: 'ça va ?' });

    // when
    const zipStream = createZipStream(callbackFnc, callbackArgs, dependencies);
    const { data } = await consumeStream(zipStream);

    // then
    expect(zipStream).to.be.an.instanceOf(Readable);
    const zipContent = await readZip(data);
    expect(zipContent).to.have.deep.members([
      { name: 'fichier-0', content: 'coucou ' },
      { name: 'fichier-1', content: '\x00\x00\x00\x00\x00' },
      { name: 'fichier-2', content: 'ça va ?' },
    ]);

    expect(logger.error).not.have.been.called;
    expect(callbackFnc.callCount).to.equal(3);
    expect(zipStream.destroyed).to.equal(true);
  });

  context('when a problem occurred', function () {
    context('when adding as an entry invalid data', function () {
      it('interrupts the stream and log the error', async function () {
        // given
        callbackArgs = [0, 1, 2];
        callbackFnc.withArgs(0).resolves({ filename: 'fichier-0', content: 'coucou ' });
        callbackFnc.withArgs(1).resolves({ filename: 'fichier-1', content: 123456 });
        callbackFnc.withArgs(2).resolves({ filename: 'fichier-2', content: 'ça va ?' });

        // when
        const zipStream = createZipStream(callbackFnc, callbackArgs, dependencies);
        const { error } = await consumeStream(zipStream);

        // then
        expect(error.message).to.include('input source must be valid Stream or Buffer instance');
        expect(logger.error).to.have.been.calledOnceWith(error, 'Problem occurred during archive streaming');
        expect(callbackFnc.callCount).to.equal(2);
        expect(zipStream.destroyed).to.equal(true);
      });
    });

    context('when callback function throws', function () {
      it('interrupts the stream and log the error', async function () {
        // given
        const expectedError = new Error('Error occurred in callback');

        callbackArgs = [0, 1, 2];
        callbackFnc.withArgs(0).resolves({ filename: 'fichier-0', content: 'coucou ' });
        callbackFnc.withArgs(1).rejects(expectedError);
        callbackFnc.withArgs(2).resolves({ filename: 'fichier-2', content: 'ça va ?' });

        // when
        const zipStream = createZipStream(callbackFnc, callbackArgs, dependencies);
        const { error: consumeStreamError, data } = await consumeStream(zipStream);

        // then
        const zipError = await catchErr(readZip)(data);

        expect(consumeStreamError).to.deep.equal(expectedError);
        expect(zipError.message).to.include('Corrupted zip');
        expect(logger.error).to.have.been.calledOnceWith(expectedError, 'Problem occurred during archive streaming');
        expect(callbackFnc.callCount).to.equal(2);
        expect(zipStream.destroyed).to.equal(true);
      });
    });

    context('when the consumer of the stream disconnects', function () {
      it('cancel zip stream and log an error ', async function () {
        // given
        const expectedError = new Error('bigbadaboum');

        callbackArgs = [0, 1, 2];
        callbackFnc.withArgs(0).resolves({ filename: 'fichier-0', content: 'coucou ' });
        callbackFnc.withArgs(1).callsFake(async () => {
          zipStream.destroy(expectedError);
          return { filename: 'fichier-1', content: 'comment ' };
        });
        callbackFnc.withArgs(2).resolves({ filename: 'fichier-1', content: 'ça va ?' });

        // when
        const zipStream = createZipStream(callbackFnc, callbackArgs, dependencies);
        const { error } = await consumeStream(zipStream);

        // then
        expect(error).to.equal(expectedError);
        expect(logger.error).to.have.been.calledOnceWith(error, 'Problem occurred during archive streaming');
        expect(callbackFnc.callCount).to.equal(2);
        expect(zipStream.destroyed).to.equal(true);
      });
    });
  });
});

async function consumeStream(stream) {
  const chunks = [];
  try {
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    return { data: Buffer.concat(chunks) };
  } catch (error) {
    return { error, data: Buffer.concat(chunks) };
  }
}

async function readZip(data) {
  const zip = await JSZip.loadAsync(data);

  return Promise.all(
    Object.values(zip.files).map(async (file) => {
      return { name: file.name, content: await file.async('string') };
    }),
  );
}
