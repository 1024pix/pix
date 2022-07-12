const { PassThrough } = require('stream');

module.exports = async function createAndUpload({
  data,
  cpfCertificationResultRepository,
  cpfCertificationXmlExportService,
  cpfExternalStorage,
}) {
  const { startId, endId } = data;
  const cpfCertificationResults = await cpfCertificationResultRepository.findByIdRange({
    startId,
    endId,
  });

  const writableStream = new PassThrough();
  cpfCertificationXmlExportService.buildXmlExport({ cpfCertificationResults, writableStream });

  const filename = `pix-cpf-export-from-${startId}-to-${endId}.xml`;
  await cpfExternalStorage.upload({ filename, writableStream });
};
