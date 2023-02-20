import { expect, catchErr, sinon } from '../../../../test-helper';
import SiecleFileStreamer from '../../../../../lib/infrastructure/utils/xml/siecle-file-streamer';
import { FileValidationError, SiecleXmlImportError } from '../../../../../lib/domain/errors';

describe('SiecleFileStreamer', function () {
  describe('perform', function () {
    context('when the file is not zipped', function () {
      it('parse the file', async function () {
        const path = `${__dirname}/files/xml/valid.xml`;

        const streamer = await SiecleFileStreamer.create(path);

        const text = await read(streamer);

        expect(text).to.equal('<hello></hello>\n');
      });

      context('when the xml is not correctly formed', function () {
        it('throws an error', async function () {
          const path = `${__dirname}/files/xml/bad.xml`;

          const streamer = await SiecleFileStreamer.create(path);

          const error = await catchErr(
            streamer.perform,
            streamer
          )((saxStream, resolve) => {
            saxStream.on('data', () => {
              return;
            });
            saxStream.on('end', resolve);
          });

          expect(error).to.be.an.instanceof(FileValidationError);
          expect(error.code).to.equal('INVALID_FILE');
        });

        it('log only the first sax error', async function () {
          const path = `${__dirname}/files/xml/garbage.xml`;
          const logError = sinon.stub();

          const streamer = await SiecleFileStreamer.create(path, logError);

          await catchErr(
            streamer.perform,
            streamer
          )((saxStream, resolve) => {
            saxStream.on('data', () => {
              return;
            });
            saxStream.on('end', resolve);
          });

          expect(logError).to.have.been.calledOnce;
        });
      });

      context('when the file contain the BOM character', function () {
        it('streams the file', async function () {
          const path = `${__dirname}/files/xml/bom.xml`;

          const streamer = await SiecleFileStreamer.create(path);

          const text = await read(streamer);

          expect(text).to.equal('<?xml version="1.0" encoding="UTF-8"?>\n');
        });
      });

      context('when the encoding is not supported', function () {
        it('it throws an error', async function () {
          const path = `${__dirname}/files/xml/unknown-encoding.xml`;
          const streamer = await SiecleFileStreamer.create(path);

          const error = await catchErr(
            streamer.perform,
            streamer
          )((saxStream, resolve) => {
            saxStream.on('data', () => {
              return;
            });
            saxStream.on('end', resolve);
          });

          expect(error).to.be.an.instanceof(SiecleXmlImportError);
          expect(error.code).to.equal('ENCODING_NOT_SUPPORTED');
        });
      });
    });

    context('when the file is zipped', function () {
      it('unzip the file', async function () {
        // given
        const path = `${__dirname}/files/zip/valid.zip`;

        // when
        const streamer = await SiecleFileStreamer.create(path);

        const text = await read(streamer);

        expect(text).to.equal('<hello></hello>\n');
      });

      context('when there are files with a corrupted entry within zip', function () {
        it('throws an error', async function () {
          // given
          const path = `${__dirname}/files/zip/corrupted-entry.zip`;

          const error = await catchErr(SiecleFileStreamer.create)(path);

          expect(error).to.be.an.instanceof(FileValidationError);
          expect(error.code).to.equal('INVALID_FILE');
        });
      });

      context('when there are several files in the zip', function () {
        it('throws an error', async function () {
          const path = `${__dirname}/files/zip/several-files.zip`;

          const error = await catchErr(SiecleFileStreamer.create)(path);

          expect(error).to.be.an.instanceof(FileValidationError);
          expect(error.code).to.equal('INVALID_FILE');
        });
      });

      context('when there is a file name starting with a dot', function () {
        it('ignores the folder', async function () {
          const path = `${__dirname}/files/zip/hidden-file.zip`;

          const streamer = await SiecleFileStreamer.create(path);

          const text = await read(streamer);

          expect(text).to.equal('<hello></hello>\n');
        });
      });

      context('when there is en empty folder', function () {
        it('ignores the folder', async function () {
          const path = `${__dirname}/files/zip/empty-folder.zip`;

          const streamer = await SiecleFileStreamer.create(path);

          const text = await read(streamer);

          expect(text).to.equal('<hello></hello>\n');
        });
      });

      context('when the stream is closed perform method is called', function () {
        it('throws an error', async function () {
          const path = `${__dirname}/files/zip/valid.zip`;

          const streamer = await SiecleFileStreamer.create(path);

          await read(streamer);
          await streamer.close();

          const error = await catchErr(
            streamer.perform,
            streamer
          )((saxStream, resolve) => {
            saxStream.on('data', () => {
              return;
            });
            saxStream.on('end', resolve);
          });

          expect(error).to.be.an.instanceof(FileValidationError);
          expect(error.code).to.equal('INVALID_FILE');
        });
      });
    });
  });
});

async function read(streamer) {
  let accumulator = '';
  await streamer.perform((saxStream, resolve) => {
    saxStream.on('data', (data) => {
      accumulator += data;
    });
    saxStream.on('end', () => {
      resolve();
    });
  });

  return accumulator;
}
