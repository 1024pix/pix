const { domainBuilder, expect, sinon } = require('../../../../../test-helper');
const createAndUpload = require('../../../../../../lib/infrastructure/jobs/cpf-export/handlers/create-and-upload');
const { createUnzip } = require('node:zlib');
const fs = require('fs');
const noop = require('lodash/noop');
const proxyquire = require('proxyquire');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

const { PassThrough } = require('stream');

describe('Integration | Infrastructure | jobs | cpf-export | create-and-upload', function () {
  let cpfCertificationResultRepository;
  let cpfExternalStorage;
  let clock;
  const expectedFileName = 'pix-cpf-export-20220102-114327.xml.gz';
  let logger;

  beforeEach(function () {
    const now = dayjs('2022-01-02T10:43:27Z').tz('Europe/Paris').toDate();
    clock = sinon.useFakeTimers(now);
    logger = { error: noop, info: noop };
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

    cpfExternalStorage = {
      upload: sinon.stub(),
    };

    cpfCertificationResultRepository.findByBatchId.withArgs(batchId).resolves(cpfCertificationResults);

    const cpfCertificationXmlExportService = proxyquire(
      '../../../../../../lib/domain/services/cpf-certification-xml-export-service',
      {
        uuid: {
          v4: () => 'xxx-yyy-zzz',
        },
      }
    );

    cpfExternalStorage.upload
      .withArgs({
        filename: expectedFileName,
        readableStream: sinon.match(PassThrough),
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
      cpfExternalStorage,
      logger,
    });

    // then
    expect(cpfCertificationResultRepository.markCertificationCoursesAsExported).to.have.been.calledWith({
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
