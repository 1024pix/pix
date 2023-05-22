import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';
import { createAndUpload } from '../../../../../../lib/infrastructure/jobs/cpf-export/handlers/create-and-upload.js';
import stream from 'stream';

const { PassThrough, Readable } = stream;

import lodash from 'lodash';
const { noop } = lodash;
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);

describe('Unit | Infrastructure | jobs | cpf-export | create-and-upload', function () {
  let cpfCertificationResultRepository;
  let cpfCertificationXmlExportService;
  let cpfExternalStorage;
  let loggerSpy;
  let clock;
  let logger;

  beforeEach(function () {
    const now = dayjs('2022-01-01T10:43:27Z').tz('Europe/Paris').toDate();
    clock = sinon.useFakeTimers(now);

    cpfCertificationResultRepository = {
      findByBatchId: sinon.stub(),
      markCertificationCoursesAsExported: sinon.stub(),
    };
    cpfCertificationXmlExportService = {
      buildXmlExport: sinon.stub(),
    };
    cpfExternalStorage = {
      upload: sinon.stub(),
    };
    logger = { error: noop, info: noop };
    loggerSpy = sinon.spy(logger, 'error');
  });

  afterEach(function () {
    clock.restore();
  });

  describe('when there are data to export', function () {
    it('should build an xml export file and upload it to an external storage', async function () {
      // given
      const batchId = '555-444#01';

      const cpfCertificationResults = [
        domainBuilder.buildCpfCertificationResult({ id: 12 }),
        domainBuilder.buildCpfCertificationResult({ id: 20 }),
        domainBuilder.buildCpfCertificationResult({ id: 33 }),
        domainBuilder.buildCpfCertificationResult({ id: 98 }),
        domainBuilder.buildCpfCertificationResult({ id: 114 }),
      ];

      cpfCertificationResultRepository.findByBatchId.withArgs(batchId).resolves(cpfCertificationResults);

      // when
      await createAndUpload({
        data: { batchId },
        cpfCertificationResultRepository,
        cpfCertificationXmlExportService,
        cpfExternalStorage,
        logger,
      });

      // then
      expect(cpfCertificationXmlExportService.buildXmlExport).to.have.been.calledWith({
        cpfCertificationResults,
        writableStream: sinon.match(PassThrough),
      });
      expect(cpfExternalStorage.upload).to.have.been.calledWith({
        filename: 'pix-cpf-export-20220101-114327.xml.gz',
        readableStream: sinon.match(Readable),
      });
      expect(cpfCertificationResultRepository.markCertificationCoursesAsExported).to.have.been.calledWith({
        certificationCourseIds: [12, 20, 33, 98, 114],
        filename: 'pix-cpf-export-20220101-114327.xml.gz',
      });

      expect(loggerSpy).to.not.have.been.called;
    });
  });

  describe('when there are no data to export', function () {
    it('should not build export file and output an error message', async function () {
      // given
      const batchId = '555-444#01';

      cpfCertificationResultRepository.findByBatchId.withArgs(batchId).resolves([]);

      // when
      await createAndUpload({
        data: { batchId },
        cpfCertificationResultRepository,
        cpfCertificationXmlExportService,
        cpfExternalStorage,
        logger,
      });

      // then
      expect(cpfCertificationXmlExportService.buildXmlExport).to.not.have.been.called;
      expect(cpfExternalStorage.upload).to.not.have.been.called;
      expect(cpfCertificationResultRepository.markCertificationCoursesAsExported).to.not.have.been.called;

      expect(loggerSpy).to.have.been.calledOnce;
    });
  });
});
