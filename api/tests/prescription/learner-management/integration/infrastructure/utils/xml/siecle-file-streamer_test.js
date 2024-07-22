import fs from 'node:fs';
import * as url from 'node:url';

import { SiecleXmlImportError } from '../../../../../../../src/prescription/learner-management/domain/errors.js';
import { SiecleFileStreamer } from '../../../../../../../src/prescription/learner-management/infrastructure/utils/xml/siecle-file-streamer.js';
import { FileValidationError } from '../../../../../../../src/shared/domain/errors.js';
import { catchErr, expect, sinon } from '../../../../../../test-helper.js';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

describe('SiecleFileStreamer', function () {
  describe('perform', function () {
    context('when the file is not zipped', function () {
      it('parse the file', async function () {
        const path = `${__dirname}files/xml/valid.xml`;
        const readableStream = fs.createReadStream(path);
        const streamer = await SiecleFileStreamer.create(readableStream, 'utf-8');

        const text = await read(streamer);

        expect(text).to.equal('<hello></hello>\n');
      });

      context('when the xml is not correctly formed', function () {
        it('throws an error', async function () {
          const path = `${__dirname}/files/xml/bad.xml`;
          const readableStream = fs.createReadStream(path);

          const streamer = await SiecleFileStreamer.create(readableStream);

          const error = await catchErr(
            streamer.perform,
            streamer,
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
          const readableStream = fs.createReadStream(path);

          const streamer = await SiecleFileStreamer.create(readableStream, 'utf-8', logError);

          await catchErr(
            streamer.perform,
            streamer,
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
          const readableStream = fs.createReadStream(path);

          const streamer = await SiecleFileStreamer.create(readableStream);

          const text = await read(streamer);

          expect(text).to.equal('<?xml version="1.0" encoding="UTF-8"?>\n');
        });
      });

      context('when the encoding is not supported', function () {
        it('it throws an error', async function () {
          const path = `${__dirname}/files/xml/unknown-encoding.xml`;
          const readableStream = fs.createReadStream(path);

          const streamer = await SiecleFileStreamer.create(readableStream, 'x-macthai');

          const error = await catchErr(
            streamer.perform,
            streamer,
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

      context('when the stream is closed perform method is called', function () {
        it('throws an error', async function () {
          const path = `${__dirname}/files/xml/valid.xml`;
          const readableStream = fs.createReadStream(path);

          const streamer = await SiecleFileStreamer.create(readableStream, 'utf-8');

          await read(streamer);
          streamer.close();

          const error = await catchErr(
            streamer.perform,
            streamer,
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
