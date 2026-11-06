import { expect } from 'chai';
import JSZip from 'jszip';
import sinon from 'sinon';

import { createZipStream } from '../../../../../../src/shared/infrastructure/utils/zip/create-zip-stream.ts';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | Utils | Zip | getMultipleFilesAsZip', function () {
  describe('#createZipStream', function () {
    let logger, dependencies;
    beforeEach(function () {
      logger = {
        error: sinon.stub(),
      };
      dependencies = {
        logger,
      };
    });

    it('should return a streamable zip', async function () {
      // given
      let i = 0;
      const func = async ({ a, b }) => {
        const res = {
          name: `fichier-${i}`,
          content: `${a + b}`,
        };
        i++;
        return res;
      };
      const args = [
        { a: 1, b: 2 },
        { a: 2, b: 2 },
      ];

      // when
      const zipStream = createZipStream(func, args, dependencies);
      const data = await streamToPromise(zipStream);

      // then
      const expectedNames = [];
      const expectedContents = [];

      const zip = await JSZip.loadAsync(data);
      zip.forEach((_, file) => {
        expectedNames.push(file.name);
      });
      for (const fileName of expectedNames) {
        const content = await zip.file(fileName).async('string');
        expectedContents.push(content);
      }
      expect(expectedNames).to.deep.equal(['fichier-0', 'fichier-1']);
      expect(expectedContents).to.deep.equal(['3', '4']);
      expect(logger.error).not.have.been.called;
    });

    context('when a problem occurred', function () {
      context('when adding as an entry invalid data', function () {
        it('interrupts the stream and log the error', async function () {
          // given
          let i = 0;
          const func = async ({ a, b }) => {
            const res = {
              name: `fichier-${i}`,
              content: `${a + b}`,
            };
            if (i === 5) {
              res.name = undefined;
            }
            i++;
            return res;
          };
          const args = [
            { a: 1, b: 1 },
            { a: 2, b: 2 },
            { a: 3, b: 3 },
            { a: 4, b: 4 },
            { a: 5, b: 5 },
            { a: 6, b: 6 },
          ];

          // when
          const zipStream = createZipStream(func, args, dependencies);
          const err = await catchErr(streamToPromise)(zipStream);

          expect(logger.error).to.have.been.calledOnceWith(err, 'Problem occurred during archive streaming');
        });
      });
      context('when stream brutally stops', function () {
        it.only('should send error before end stream', async function () {
          // given
          let i = 0;
          const func = async ({ a, b }) => {
            const res = {
              name: `fichier-${i}`,
              content: `${a + b}`,
            };
            if (i === 5) {
              res.name = undefined;
            }
            i++;
            return res;
          };
          const args = [
            { a: 1, b: 1 },
            { a: 2, b: 2 },
            { a: 3, b: 3 },
            { a: 4, b: 4 },
            { a: 5, b: 5 },
            { a: 6, b: 6 },
          ];

          // when
          const zipStream = createZipStream(func, args, dependencies);
          await catchErr(streamToPromise)(zipStream, { stopAbruptely: true });

          expect(logger.error).to.have.been.calledOnceWith('Streaming has been unexpetidly closed');
        });
      });
    });
  });
});

async function streamToPromise(stream, options = {}) {
  return streamToPromiseArray(stream, options).then((array) => {
    return array.join('');
  });
}

function streamToPromiseArray(stream, options = {}) {
  return new Promise((resolve, reject) => {
    const result = [];
    stream.on('data', (data) => {
      result.push(data);
      if (options.stopAbruptely) {
        stream.destroy();
      }
    });
    stream.once('close', resolve)
    stream.on('end', () => {
      resolve(result);
    });

    stream.on('error', reject);
  });
}
