const { PassThrough } = require('stream');
const moment = require('moment-timezone');

module.exports = async function createAndUpload({
  data,
  cpfCertificationResultRepository,
  cpfCertificationXmlExportService,
  cpfExternalStorage,
}) {
  const { startDate, endDate, limit, offset } = data;
  const cpfCertificationResults = await cpfCertificationResultRepository.findByTimeRange({
    startDate,
    endDate,
    limit,
    offset,
  });

  const writableStream = new PassThrough();
  cpfCertificationXmlExportService.buildXmlExport({ cpfCertificationResults, writableStream });

  const now = moment().tz('Europe/Paris').format('YYYYMMDD-HHmmssSSS');
  const filename = `pix-cpf-export-${now}.xml`;
  await cpfExternalStorage.upload({ filename, writableStream });

  const certificationCourseIds = cpfCertificationResults.map(({ id }) => id);
  await cpfCertificationResultRepository.markCertificationCoursesAsExported({ certificationCourseIds, filename });
};
