/**
 * @typedef {import ('../../domain/usecases/index.js').CertificationResultRepository} CertificationResultRepository
 * @typedef {import ('../../domain/usecases/index.js').SessionForResultsSharingRepository} SessionForResultsSharingRepository
 * @typedef {import('i18n').I18n} I18n
 */

import { getMultipleFilesAsZip } from '../../../../shared/infrastructure/utils/zip/get-multiple-files-as-zip.js';
import { getSessionCertificationResultsCsv } from '../../infrastructure/utils/csv/certification-results/get-session-certification-results-csv.js';

/**
 * @param {object} params
 * @param {Array<number>} params.sessionIds
 * @param {object} params.i18n
 * @param {CertificationResultRepository} params.certificationResultRepository
 * @param {SessionForResultsSharingRepository} params.sessionForResultsSharingRepository
 */
export const getSelectedSessionsResultsZip = async function ({
  sessionIds,
  i18n,
  certificationResultRepository,
  sessionForResultsSharingRepository,
}) {
  const csvFiles = [];

  for (const sessionId of sessionIds) {
    const certificationResults = await certificationResultRepository.findBySessionId({ sessionId });

    if (certificationResults.length) {
      const csvFile = await getSessionCertificationResultsCsv({
        sessionId,
        certificationResults,
        i18n,
        sessionForResultsSharingRepository,
      });

      csvFiles.push(csvFile);
    }
  }

  const zipContent = await getMultipleFilesAsZip({ files: csvFiles });

  return {
    filename: `pix-sessions-results-${Date.now()}.zip`,
    content: zipContent,
  };
};
