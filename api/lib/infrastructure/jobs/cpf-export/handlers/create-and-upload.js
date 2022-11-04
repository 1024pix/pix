const { createGzip } = require('node:zlib');
const logger = require('../../../logger');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

module.exports = async function createAndUpload({
  data,
  cpfCertificationResultRepository,
  cpfCertificationXmlExportService,
  cpfExternalStorage,
}) {
  const start = new Date();
  const { jobId } = data;
  const cpfCertificationResults = await cpfCertificationResultRepository.findByTimeRange(jobId);

  if (cpfCertificationResults.length == 0) {
    logger.error(
      `CpfExportBuilderJob: create CPF results, with no certification found (start date: ${startDate}, end date: ${endDate}, limit: ${limit},offset: ${offset})`
    );
    return;
  }

  const certificationCourseIds = cpfCertificationResults.map(({ id }) => id);
  logger.info(`CpfExportBuilderJob: create CPF results for ${certificationCourseIds.length} certifications`);

  const gzipStream = createGzip();
  cpfCertificationXmlExportService.buildXmlExport({
    cpfCertificationResults,
    writableStream: gzipStream,
  });

  const now = dayjs().tz('Europe/Paris').format('YYYYMMDD-HHmmss');
  const filename = `pix-cpf-export-${now}.xml.gz`;
  await cpfExternalStorage.upload({
    filename,
    readableStream: gzipStream,
  });

  await cpfCertificationResultRepository.markCertificationCoursesAsExported({ certificationCourseIds, filename });
  logger.info(`${filename} generated in ${_getTimeInSec(start)}s.`);
};

function _getTimeInSec(start) {
  return Math.floor((new Date().getTime() - start) / 1024);
}
