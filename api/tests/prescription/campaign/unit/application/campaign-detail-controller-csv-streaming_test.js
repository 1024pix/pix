import http from 'node:http';

import Hapi from '@hapi/hapi';
import { expect } from 'chai';
import sinon from 'sinon';

import { campaignDetailController } from '../../../../../src/prescription/campaign/application/campaign-detail-controller.js';
import { usecases } from '../../../../../src/prescription/campaign/domain/usecases/index.js';

const HEADER_CHUNK = 'header\n';
const LINE_CHUNK = 'line\n';
const ERROR_MESSAGE = 'boom: secret internal detail';

// Reads a response over a real socket and reports what the client actually saw.
function get(url) {
  return new Promise((resolve) => {
    const result = { statusCode: null, headers: null, body: '', complete: null, error: null };
    const request = http.get(url, (response) => {
      result.statusCode = response.statusCode;
      result.headers = response.headers;
      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        result.body += chunk;
      });
      response.on('error', (error) => {
        result.error = error;
      });
      response.on('close', () => {
        result.complete = response.complete;
        resolve(result);
      });
    });
    request.on('error', (error) => {
      result.error = error;
      resolve(result);
    });
  });
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe('Unit | Application | Controller | Campaign detail | CSV streaming over a real socket', function () {
  const exports = [
    {
      name: 'profiles collection',
      path: '/profiles/1',
      handler: 'getCsvProfilesCollectionResults',
      usecase: 'exportCampaignProfilesCollectionResults',
    },
    {
      name: 'assessment',
      path: '/assessments/1',
      handler: 'getCsvAssessmentResults',
      usecase: 'exportCampaignAssessmentResults',
    },
  ];

  let server, requestEvents, uncaughtException;

  beforeEach(async function () {
    server = Hapi.server({ host: '127.0.0.1', port: 0 });
    requestEvents = [];
    server.events.on('request', (_request, event) => requestEvents.push(event));
    uncaughtException = sinon.stub();
    process.on('uncaughtException', uncaughtException);

    for (const { path, handler } of exports) {
      server.route({
        method: 'GET',
        path: `${path.replace('/1', '')}/{campaignId}`,
        handler: (request, h) => campaignDetailController[handler](request, h),
      });
    }
    await server.start();
  });

  afterEach(async function () {
    process.removeListener('uncaughtException', uncaughtException);
    await server.stop({ timeout: 100 });
    sinon.restore();
  });

  exports.forEach(({ name, path, usecase }) => {
    context(`${name} export`, function () {
      const stubCsvChunks = (generator) =>
        sinon.stub(usecases, usecase).callsFake(async () => ({ fileName: 'file.csv', csvChunks: generator() }));

      it('should send the whole csv to the client when the export succeeds', async function () {
        // given
        stubCsvChunks(async function* () {
          yield HEADER_CHUNK;
          yield LINE_CHUNK;
        });

        // when
        const result = await get(`${server.info.uri}${path}`);

        // then
        expect(result.statusCode).to.equal(200);
        expect(result.headers['content-type']).to.equal('text/csv;charset=utf-8');
        expect(result.complete).to.be.true;
        expect(result.body).to.equal(HEADER_CHUNK + LINE_CHUNK);
      });

      context('when the export fails after the first chunk was sent', function () {
        beforeEach(function () {
          stubCsvChunks(async function* () {
            yield HEADER_CHUNK;
            await wait(50); // lets the first chunk reach the client before failing
            throw new Error(ERROR_MESSAGE);
          });
        });

        it('should cut the connection: the client never gets a complete response', async function () {
          // when
          const result = await get(`${server.info.uri}${path}`);

          // then
          expect(result.statusCode).to.equal(200); // headers were already sent
          expect(result.body).to.equal(HEADER_CHUNK); // truncated csv
          expect(result.complete).to.be.false;
        });

        it('should never send the error details to the client', async function () {
          // when
          const result = await get(`${server.info.uri}${path}`);

          // then
          expect(result.body).not.to.include('boom');
          expect(result.body).not.to.include('secret');
          expect(String(result.error?.message ?? '')).not.to.include('secret');
        });

        it('should keep the server and the process alive', async function () {
          // given
          await get(`${server.info.uri}${path}`);
          usecases[usecase].restore();
          stubCsvChunks(async function* () {
            yield HEADER_CHUNK;
          });

          // when
          const next = await get(`${server.info.uri}${path}`);

          // then
          expect(uncaughtException).not.to.have.been.called;
          expect(next.statusCode).to.equal(200);
          expect(next.complete).to.be.true;
        });

        it('should be logged by Hapi on the internal channel only, which the pino plugin ignores', async function () {
          // when
          await get(`${server.info.uri}${path}`);
          await wait(50);

          // then
          const responseErrors = requestEvents.filter(
            ({ tags }) => tags.includes('response') && tags.includes('error'),
          );
          expect(responseErrors).to.have.lengthOf.at.least(1);
          expect(responseErrors.every(({ channel }) => channel === 'internal')).to.be.true;
          expect(requestEvents.filter(({ channel }) => channel === 'error')).to.be.empty;
        });
      });

      context('when the export fails before the first chunk', function () {
        beforeEach(function () {
          // eslint-disable-next-line require-yield
          stubCsvChunks(async function* () {
            throw new Error(ERROR_MESSAGE);
          });
        });

        it('should never give the client a complete successful response nor the error details', async function () {
          // when
          const result = await get(`${server.info.uri}${path}`);

          // then
          expect(result.statusCode === 200 && result.complete).to.be.false;
          expect(result.body).not.to.include('boom');
          expect(String(result.error?.message ?? '')).not.to.include('secret');
          expect(uncaughtException).not.to.have.been.called;
        });
      });
    });
  });
});
