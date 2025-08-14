import _ from 'lodash';

import * as injectedSharedSessionRepository from '../../../shared/infrastructure/repositories/session-repository.js';
import * as injectedCertificationResultRepository from '../../infrastructure/repositories/certification-result-repository.js';

const getSessionResultsByResultRecipientEmail = async function ({
  sessionId,
  resultRecipientEmail,
  sharedSessionRepository = injectedSharedSessionRepository,
  certificationResultRepository = injectedCertificationResultRepository,
} = {}) {
  const session = await sharedSessionRepository.getWithCertificationCandidates({ id: sessionId });
  const certificationCandidateIdsForResultRecipient = _(session.certificationCandidates)
    .filter((candidate) => candidate.resultRecipientEmail.toLowerCase() === resultRecipientEmail.toLowerCase())
    .map('id')
    .value();

  const certificationResults = await certificationResultRepository.findByCertificationCandidateIds({
    certificationCandidateIds: certificationCandidateIdsForResultRecipient,
  });

  return { session, certificationResults };
};

export { getSessionResultsByResultRecipientEmail };
