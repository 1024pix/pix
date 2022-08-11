const { domainBuilder, expect, sinon } = require('../../../../../test-helper');
const createAndUpload = require('../../../../../../lib/infrastructure/jobs/cpf-export/handlers/create-and-upload');
const { PassThrough } = require('node:stream');

describe('Unit | Infrastructure | jobs | cpf-export | create-and-upload', function () {
  let cpfCertificationResultRepository;
  let cpfCertificationXmlExportService;
  let cpfExternalStorage;

  beforeEach(function () {
    cpfCertificationResultRepository = {
      findByIdRange: sinon.stub(),
    };
    cpfCertificationXmlExportService = {
      buildXmlExport: sinon.stub(),
    };
    cpfExternalStorage = {
      upload: sinon.stub(),
    };
  });

  it('should build an xml export file and upload it to an external storage', async function () {
    // given
    const startId = 12;
    const endId = 120;

    const cpfCertificationResults = [
      domainBuilder.buildCpfCertificationResult({ id: 12 }),
      domainBuilder.buildCpfCertificationResult({ id: 20 }),
      domainBuilder.buildCpfCertificationResult({ id: 33 }),
      domainBuilder.buildCpfCertificationResult({ id: 98 }),
      domainBuilder.buildCpfCertificationResult({ id: 114 }),
    ];

    cpfCertificationResultRepository.findByIdRange.resolves(cpfCertificationResults);

    // when
    await createAndUpload({
      data: { startId, endId },
      cpfCertificationResultRepository,
      cpfCertificationXmlExportService,
      cpfExternalStorage,
    });

    // then
    expect(cpfCertificationResultRepository.findByIdRange).to.have.been.calledWith({ startId, endId });
    expect(cpfCertificationXmlExportService.buildXmlExport).to.have.been.calledWith({
      cpfCertificationResults,
      writableStream: sinon.match(PassThrough),
    });
    expect(cpfExternalStorage.upload).to.have.been.calledWith({
      filename: 'pix-cpf-export-from-12-to-120.xml',
      writableStream: sinon.match(PassThrough),
    });
  });
});
