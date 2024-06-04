import * as uuid from 'node:crypto';
import { createGzip } from 'node:zlib';

import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';

import { logErrorWithCorrelationIds, logInfoWithCorrelationIds } from '../../../monitoring-tools.js';

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
    logErrorWithCorrelationIds(`Create CPF results, with no certification found (batchId ${batchId})`);
    return;
  }

  const certificationCourseIds = cpfCertificationResults.map(({ id }) => id);
  logInfoWithCorrelationIds(
    `Create CPF results for ${certificationCourseIds.length} certifications (batchId ${batchId})`,
  );

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

  logInfoWithCorrelationIds(`${filename} generated in ${_getTimeInSec(start)}s.`);
};

export { createAndUpload };

function _getTimeInSec(start) {
  return Math.floor((new Date().getTime() - start) / 1024);
}
