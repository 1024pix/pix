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
  const { batchId } = data;
  const start = new Date();
  const cpfCertificationResults = await cpfCertificationResultRepository.findByBatchId(batchId);

  if (cpfCertificationResults.length == 0) {
    logger.error(`CpfExportBuilderJob: create CPF results, with no certification found (batchId ${batchId})`);
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

  await cpfCertificationResultRepository.markCertificationCoursesAsExported({
    certificationCourseIds,
    filename,
  });

  logger.info(`${filename} generated in ${_getTimeInSec(start)}s.`);
};

function _getTimeInSec(start) {
  return Math.floor((new Date().getTime() - start) / 1024);
}
