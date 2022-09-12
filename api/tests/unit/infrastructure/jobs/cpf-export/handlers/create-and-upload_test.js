const { domainBuilder, expect, sinon } = require('../../../../../test-helper');
const createAndUpload = require('../../../../../../lib/infrastructure/jobs/cpf-export/handlers/create-and-upload');
const { PassThrough } = require('stream');

describe('Unit | Infrastructure | jobs | cpf-export | create-and-upload', function () {
  let cpfCertificationResultRepository;
  let cpfCertificationXmlExportService;
  let cpfExternalStorage;
  let clock;

  beforeEach(function () {
    clock = sinon.useFakeTimers(new Date('2022-01-01T10:43:27Z'));

    cpfCertificationResultRepository = {
      findByCertificationCourseIds: sinon.stub(),
      markCertificationCoursesAsExported: sinon.stub(),
    };
    cpfCertificationXmlExportService = {
      buildXmlExport: sinon.stub(),
    };
    cpfExternalStorage = {
      upload: sinon.stub(),
    };
  });

  afterEach(function () {
    clock.restore();
  });

  it('should build an xml export file and upload it to an external storage', async function () {
    // given
    const certificationCourseIds = [12, 20, 33, 98, 114];

    const cpfCertificationResults = [
      domainBuilder.buildCpfCertificationResult({ id: 12 }),
      domainBuilder.buildCpfCertificationResult({ id: 20 }),
      domainBuilder.buildCpfCertificationResult({ id: 33 }),
      domainBuilder.buildCpfCertificationResult({ id: 98 }),
      domainBuilder.buildCpfCertificationResult({ id: 114 }),
    ];

    cpfCertificationResultRepository.findByCertificationCourseIds.resolves(cpfCertificationResults);

    // when
    await createAndUpload({
      data: { certificationCourseIds },
      cpfCertificationResultRepository,
      cpfCertificationXmlExportService,
      cpfExternalStorage,
    });

    // then
    expect(cpfCertificationResultRepository.findByCertificationCourseIds).to.have.been.calledWith({
      certificationCourseIds,
    });
    expect(cpfCertificationXmlExportService.buildXmlExport).to.have.been.calledWith({
      cpfCertificationResults,
      writableStream: sinon.match(PassThrough),
    });
    expect(cpfExternalStorage.upload).to.have.been.calledWith({
      filename: 'pix-cpf-export-20220101-114327000.xml',
      writableStream: sinon.match(PassThrough),
    });
    expect(cpfCertificationResultRepository.markCertificationCoursesAsExported).to.have.been.calledWith({
      certificationCourseIds,
      filename: 'pix-cpf-export-20220101-114327000.xml',
    });
  });
});
