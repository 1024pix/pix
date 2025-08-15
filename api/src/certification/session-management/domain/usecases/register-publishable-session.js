/**
 * @typedef {import('../read-models/SessionFinalized.js').SessionFinalized} SessionFinalized
 *  @typedef {import('./index.js').JuryCertificationSummaryRepository} JuryCertificationSummaryRepository
 *  @typedef {import('./index.js').FinalizedSessionRepository} FinalizedSessionRepository
 */

import { withTransaction } from '../../../../shared/domain/DomainTransaction.js';
import * as injectedFinalizedSessionRepository from '../../infrastructure/repositories/finalized-session-repository.js';
import * as injectedJuryCertificationSummaryRepository from '../../infrastructure/repositories/jury-certification-summary-repository.js';
import { FinalizedSession } from '../models/FinalizedSession.js';

export const registerPublishableSession = withTransaction(
  /**
   * @param {Object} params
   * @param {SessionFinalized} params.sessionFinalized
   * @param {JuryCertificationSummaryRepository} params.juryCertificationSummaryRepository
   * @param {FinalizedSessionRepository} params.finalizedSessionRepository
   */
  async ({
    sessionFinalized,
    juryCertificationSummaryRepository = injectedJuryCertificationSummaryRepository,
    finalizedSessionRepository = injectedFinalizedSessionRepository,
  } = {}) => {
    const juryCertificationSummaries = await juryCertificationSummaryRepository.findBySessionId({
      sessionId: sessionFinalized.sessionId,
    });

    const finalizedSession = FinalizedSession.from({
      sessionId: sessionFinalized.sessionId,
      finalizedAt: sessionFinalized.finalizedAt,
      certificationCenterName: sessionFinalized.certificationCenterName,
      sessionDate: sessionFinalized.sessionDate,
      sessionTime: sessionFinalized.sessionTime,
      hasExaminerGlobalComment: sessionFinalized.hasExaminerGlobalComment,
      juryCertificationSummaries,
    });

    await finalizedSessionRepository.save({ finalizedSession });
  },
);
