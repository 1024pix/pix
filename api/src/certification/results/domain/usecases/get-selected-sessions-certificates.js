import { promisify } from 'node:util';

import { NotFoundError } from '../../../../shared/domain/errors.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import { getSessionCertificatesPDF } from '../services/get-session-certificates-pdf.js';

/**
 * @param {object} params
 * @param {object} params.archive
 * @param {Array<number>} params.sessionIds
 * @param {object} params.i18n
 * @param {boolean} params.isFrenchDomainExtension
 */

export async function getSelectedSessionsCertificates({
  archive,
  sessionIds,
  i18n,
  isFrenchDomainExtension,
  dependencies = {
    getCertificatesForSession: getSessionCertificatesPDF,
  },
}) {
  const addEntry = promisify(archive.entry.bind(archive));

  for (const sessionId of sessionIds) {
    if (archive.destroyed) return;

    try {
      const { filename, content } = await dependencies.getCertificatesForSession({
        sessionId,
        isFrenchDomainExtension,
        i18n,
      });

      await addEntry(content, { name: filename });
    } catch (error) {
      if (!(error instanceof NotFoundError)) {
        throw error;
      }

      logger.warn(`[selected sessions download] No certificate for session : ${sessionId}`);
    }
  }

  archive.finish();
}
