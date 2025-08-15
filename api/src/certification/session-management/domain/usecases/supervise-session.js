import * as injectedCertificationCenterRepository from '../../../shared/infrastructure/repositories/certification-center-repository.js';
import {
  CertificationCenterIsArchivedError,
  InvalidSessionSupervisingLoginError,
  SessionNotAccessible,
} from '../../domain/errors.js';
import * as injectedSessionRepository from '../../infrastructure/repositories/session-repository.js';
import * as injectedSupervisorAccessRepository from '../../infrastructure/repositories/supervisor-access-repository.js';

const superviseSession = async function ({
  sessionId,
  invigilatorPassword,
  userId,
  sessionRepository = injectedSessionRepository,
  supervisorAccessRepository = injectedSupervisorAccessRepository,
  certificationCenterRepository = injectedCertificationCenterRepository,
} = {}) {
  // should use a specific get from sessionRepository instead
  const session = await sessionRepository.get({ id: sessionId });

  if (!session.isSupervisable(invigilatorPassword)) {
    throw new InvalidSessionSupervisingLoginError();
  }
  if (!session.isAccessible()) {
    throw new SessionNotAccessible();
  }
  const certificationCenter = await certificationCenterRepository.getBySessionId({ sessionId });
  if (certificationCenter.archivedAt || certificationCenter.archivedBy) {
    throw new CertificationCenterIsArchivedError();
  }
  await supervisorAccessRepository.create({ sessionId, userId });
};

export { superviseSession };
