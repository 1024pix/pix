import { Readable } from 'node:stream';

import { NotFoundError } from '../../../../shared/domain/errors.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import { getSessionCertificatesPDF } from '../services/get-session-certificates-pdf.js';

/**
 * Returns an iterable that allows lazy generation of PDF certificates for the selected sessions.
 * One session at a time.
 *
 * @param {object} params
 * @param {number[]} params.sessionIds
 * @param {object} params.i18n
 * @param {boolean} params.isFrenchDomainExtension
 * @param {object} [params.dependencies]
 * @param {Function} [params.dependencies.getCertificatesForSession]
 * @returns {AsyncGenerator<{
 *   filename: string,
 *   content: import('node:stream').Readable
 * }>}
 */
export async function* getSelectedSessionsCertificates({
  sessionIds,
  i18n,
  isFrenchDomainExtension,
  dependencies = {
    getCertificatesForSession: getSessionCertificatesPDF,
  },
}) {
  for (const sessionId of sessionIds) {
    try {
      const pdfFile = await dependencies.getCertificatesForSession({
        sessionId,
        isFrenchDomainExtension,
        i18n,
      });

      yield {
        filename: pdfFile.filename,
        content: Readable.from(pdfFile.content),
      };
    } catch (error) {
      if (!(error instanceof NotFoundError)) {
        throw error;
      }

      logger.warn(`No certificate for session: ${sessionId}`);
    }
  }
}
