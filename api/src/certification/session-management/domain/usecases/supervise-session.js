//@ts-check
/**
 * @typedef {import('./index.js').InvigilatorSessionRepository} InvigilatorSessionRepository
 * @typedef {import('./index.js').InvigilatorAccessRepository} InvigilatorAccessRepository
 * @typedef {import('./index.js').CertificationCenterRepository} CertificationCenterRepository
 * @typedef {import('./index.js').CertificationCenterAccessRepository} CertificationCenterAccessRepository
 */

import { withTransaction } from '../../../../shared/domain/DomainTransaction.js';
import {
  CertificationCenterIsArchivedError,
  InvalidSessionSupervisingLoginError,
  SessionFinalized,
  SessionNotJoinable,
} from '../errors.js';

export const superviseSession = withTransaction(
  /**
   * @param {object} params
   * @param {number} params.sessionId
   * @param {string} params.invigilatorPassword
   * @param {number} params.userId
   * @param {InvigilatorSessionRepository} params.invigilatorSessionRepository
   * @param {InvigilatorAccessRepository} params.invigilatorAccessRepository
   * @param {CertificationCenterRepository} params.certificationCenterRepository
   * @param {CertificationCenterAccessRepository} params.certificationCenterAccessRepository
   */
  async ({
    sessionId,
    invigilatorPassword,
    userId,
    invigilatorSessionRepository,
    invigilatorAccessRepository,
    certificationCenterRepository,
    certificationCenterAccessRepository,
  }) => {
    const session = await invigilatorSessionRepository.get({ id: sessionId });

    const certificationCenter = await certificationCenterRepository.getBySessionId({ sessionId });

    if (session.isNotJoinable) {
      throw new SessionFinalized();
    }

    const certificationCenterAccess = await certificationCenterAccessRepository.getCertificationCenterAccess({
      certificationCenterId: certificationCenter.id,
    });

    if (certificationCenterAccess.isAccessBlockedCollege) {
      throw new SessionNotJoinable(certificationCenterAccess.pixCertifScoBlockedAccessDateCollege);
    }

    if (certificationCenterAccess.isAccessBlockedLycee) {
      throw new SessionNotJoinable(certificationCenterAccess.pixCertifScoBlockedAccessDateLycee);
    }

    if (certificationCenterAccess.isAccessBlockedAEFE) {
      throw new SessionNotJoinable(certificationCenterAccess.pixCertifScoBlockedAccessDateLycee);
    }

    if (certificationCenterAccess.isAccessBlockedAgri) {
      throw new SessionNotJoinable(certificationCenterAccess.pixCertifScoBlockedAccessDateLycee);
    }

    if (!session.checkPassword(invigilatorPassword)) {
      throw new InvalidSessionSupervisingLoginError();
    }

    if (certificationCenter.archivedAt || certificationCenter.archivedBy) {
      throw new CertificationCenterIsArchivedError();
    }

    await invigilatorAccessRepository.create({ sessionId, userId });
  },
);
