import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';
import { createAndUpload } from '../../../../../../lib/infrastructure/jobs/cpf-export/handlers/create-and-upload.js';
import * as cpfCertificationXmlExportService from '../../../../../../lib/domain/services/cpf-certification-xml-export-service.js';
import { createUnzip } from 'node:zlib';

import fs from 'fs';
import lodash from 'lodash';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import stream from 'stream';
import * as url from 'url';

const { noop } = lodash;

dayjs.extend(utc);
dayjs.extend(timezone);

const { PassThrough } = stream;

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

describe('Integration | Infrastructure | jobs | cpf-export | create-and-upload', function () {
  let cpfCertificationResultRepository;
  let uploadCpfFiles;
  let clock;
  const expectedFileName = 'pix-cpf-export-20220102-114327.xml.gz';
  let logger;
  let uuidService;

  beforeEach(function () {
    const now = dayjs('2022-01-02T10:43:27Z').tz('Europe/Paris').toDate();
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    logger = { error: noop, info: noop, trace: noop };
    uuidService = { randomUUID: sinon.stub() };
  });

  afterEach(function () {
    clock.restore();
  });

  it('should build an xml export file and upload it to an external storage', async function () {
    // given
    const batchId = '555-444#01';

    const cpfCertificationResults = [
      domainBuilder.buildCpfCertificationResult({ id: 12 }),
      domainBuilder.buildCpfCertificationResult({ id: 20 }),
    ];

    cpfCertificationResultRepository = {
      findByBatchId: sinon.stub(),
      markCertificationCoursesAsExported: sinon.stub(),
    };

    uploadCpfFiles = sinon.stub();

    cpfCertificationResultRepository.findByBatchId.withArgs(batchId).resolves(cpfCertificationResults);

    uuidService.randomUUID.returns('xxx-yyy-zzz');

    uploadCpfFiles
      .withArgs({
        filename: expectedFileName,
        readableStream: sinon.match(PassThrough),
        logger,
      })
      .callsFake(async function ({ readableStream }) {
        const unzipedStream = readableStream.pipe(createUnzip());
        const streamedXML = await _streamToString(unzipedStream);
        const expectedXML = await fs.promises.readFile(`${__dirname}/export.xml`, { encoding: 'utf-8' });
        expect(streamedXML).to.equals(expectedXML.replace(/\n| {2}/g, ''));
      });

    // when
    await createAndUpload({
      data: { batchId },
      cpfCertificationResultRepository,
      cpfCertificationXmlExportService,
      uploadCpfFiles,
      logger,
      uuidService,
    });

    // then
    expect(cpfCertificationResultRepository.markCertificationCoursesAsExported).to.have.been.calledWithExactly({
      certificationCourseIds: [12, 20],
      filename: expectedFileName,
    });
  });
});

function _streamToString(stream) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => {
      resolve(Buffer.concat(chunks).toString('utf8'));
    });
  });
}
