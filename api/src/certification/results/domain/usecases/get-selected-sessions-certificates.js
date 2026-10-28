import { NotFoundError } from '../../../../shared/domain/errors.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import { getMultipleFilesAsZip } from '../../../../shared/infrastructure/utils/zip/get-multiple-files-as-zip.js';
import { NoCertificatesToDownloadError } from '../errors.js';
import { getCertificatesForSession } from '../services/get-certificates-for-session.js';

/**
 * @param {object} params
 * @param {Array<number>} params.sessionIds
 * @param {object} params.i18n
 * @param {boolean} params.isFrenchDomainExtension
 */

export async function getSelectedSessionsCertificates({
  sessionIds,
  i18n,
  isFrenchDomainExtension,
  dependencies = {
    getCertificatesForSession,
    getMultipleFilesAsZip,
  },
}) {
  const pdfFiles = [];

  for (const sessionId of sessionIds) {
    try {
      const pdfFile = await dependencies.getCertificatesForSession({
        sessionId,
        isFrenchDomainExtension,
        i18n,
      });

      pdfFiles.push(pdfFile);
    } catch (error) {
      if (!(error instanceof NotFoundError)) {
        throw error;
      }
      logger.warn(`[selected sessions download] No certificate for session : ${sessionId}`);
    }
  }

  if (!pdfFiles.length) {
    throw new NoCertificatesToDownloadError();
  }

  const zipContent = await dependencies.getMultipleFilesAsZip({ files: pdfFiles });

  return {
    filename: `pix-sessions-certificates-${Date.now()}.zip`,
    content: zipContent,
  };
}
