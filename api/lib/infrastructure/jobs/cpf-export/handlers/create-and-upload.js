import { createGzip } from 'node:zlib';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import * as uuid from 'crypto';

dayjs.extend(utc);
dayjs.extend(timezone);

const createAndUpload = async function ({
  data,
  logger,
  cpfCertificationResultRepository,
  cpfCertificationXmlExportService,
  uploadCpfFiles,
  uuidService = uuid,
}) {
  const { batchId } = data;
  const start = new Date();
  const cpfCertificationResults = await cpfCertificationResultRepository.findByBatchId(batchId);

  if (cpfCertificationResults.length == 0) {
    logger.error(`Create CPF results, with no certification found (batchId ${batchId})`);
    return;
  }

  const certificationCourseIds = cpfCertificationResults.map(({ id }) => id);
  logger.info(`Create CPF results for ${certificationCourseIds.length} certifications (batchId ${batchId})`);

  const gzipStream = createGzip();
  cpfCertificationXmlExportService.buildXmlExport({
    cpfCertificationResults,
    writableStream: gzipStream,
    uuidService,
  });

  const now = dayjs().tz('Europe/Paris').format('YYYYMMDD-HHmmss');
  const filename = `pix-cpf-export-${now}.xml.gz`;
  await uploadCpfFiles({
    filename,
    readableStream: gzipStream,
    logger,
  });

  await cpfCertificationResultRepository.markCertificationCoursesAsExported({
    certificationCourseIds,
    filename,
  });

  logger.info(`${filename} generated in ${_getTimeInSec(start)}s.`);
};

export { createAndUpload };

function _getTimeInSec(start) {
  return Math.floor((new Date().getTime() - start) / 1024);
}
