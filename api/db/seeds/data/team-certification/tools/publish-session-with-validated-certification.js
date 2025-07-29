import dayjs from 'dayjs';
import i18n from 'i18n';

import { usecases as enrolmentUseCases } from '../../../../../src/certification/enrolment/domain/usecases/index.js';
import pickChallengeService from '../../../../../src/certification/evaluation/domain/services/pick-challenge-service.js';
import { usecases as evaluationUseCases } from '../../../../../src/certification/evaluation/domain/usecases/index.js';
import { usecases as flashUseCases } from '../../../../../src/certification/evaluation/domain/usecases/index.js';
import { usecases as scoringUseCases } from '../../../../../src/certification/scoring/domain/usecases/index.js';
import { usecases as sessionManagementUseCases } from '../../../../../src/certification/session-management/domain/usecases/index.js';
import { ABORT_REASONS } from '../../../../../src/certification/shared/domain/models/CertificationCourse.js';
import { CertificationReport } from '../../../../../src/certification/shared/domain/models/CertificationReport.js';
import { pickAnswerStatusService } from '../../../../../src/certification/shared/domain/services/pick-answer-status-service.js';
import { config } from '../../../../../src/shared/config.js';
import { LANGUAGES_CODE } from '../../../../../src/shared/domain/services/language-service.js';
import { FRENCH_SPOKEN } from '../../../../../src/shared/domain/services/locale-service.js';

/**
 * @param {Object} params
 * @param {number} params.sessionId
 * @param {number} params.candidateId
 * @param {number} params.pixScoreTarget - WARNING: final certification pix score will vary
 *                                         because simulation simulates a few user errors
 */
export default async function publishSessionWithValidatedCertification({
  databaseBuilder,
  sessionId,
  candidateId,
  pixScoreTarget,
}) {
  const session = await enrolmentUseCases.getSession({ sessionId });
  const candidate = await enrolmentUseCases.getCandidate({ certificationCandidateId: candidateId });

  const { certificationCourse } = await evaluationUseCases.retrieveLastOrCreateCertificationCourse({
    sessionId,
    accessCode: session.accessCode,
    userId: candidate.userId,
    locale: LANGUAGES_CODE.FRENCH,
  });

  const assessment = certificationCourse._assessment;

  // We simulate a certification in order to get the right capacity for a specific pix score
  const { capacity } = await scoringUseCases.simulateCapacityFromScore({
    score: pixScoreTarget,
    date: new Date(),
  });
  const pickAnswerStatus = pickAnswerStatusService.pickAnswerStatusForCapacity(capacity);
  const pickChallenge = pickChallengeService.getChallengePicker(
    config.v3Certification.defaultProbabilityToPickChallenge,
  );

  // stopAtChallenge helps to simulate less answer to trigger degradation, and a check reports at finalization
  const simulatedCertification = await flashUseCases.simulateFlashAssessmentScenario({
    locale: FRENCH_SPOKEN,
    initialCapacity: config.v3Certification.defaultCandidateCapacity,
    stopAtChallenge: config.v3Certification.numberOfChallengesPerCourse - 1,
    pickChallenge,
    pickAnswerStatus,
  });

  let timePad = 1;
  let challengeDate = dayjs();
  const getNewSecondPad = () => {
    challengeDate = challengeDate.add(`${timePad++ % 60}`, 'seconds');
    return challengeDate;
  };
  for (const simulatedChallenge of simulatedCertification) {
    databaseBuilder.factory.buildCertificationChallenge({
      associatedSkillName: simulatedChallenge.challenge.skill.name,
      associatedSkillId: simulatedChallenge.challenge.skill.id,
      challengeId: simulatedChallenge.challenge.id,
      competenceId: simulatedChallenge.challenge.skill.competenceId,
      courseId: certificationCourse._id,
      createdAt: getNewSecondPad(),
      updatedAt: getNewSecondPad(),
      isNeutralized: false,
      hasBeenSkippedAutomatically: false,
      certifiableBadgeKey: null,
      difficulty: simulatedChallenge.challenge.difficulty,
      discriminant: simulatedChallenge.challenge.discriminant,
    });

    databaseBuilder.factory.buildAnswer({
      value: 'dummy value',
      result: simulatedChallenge.answerStatus,
      assessmentId: assessment.id,
      challengeId: simulatedChallenge.challenge.id,
      createdAt: getNewSecondPad(),
      updatedAt: getNewSecondPad(),
      timeout: null,
      resultDetails: 'dummy value',
      timeSpent: 10,
    });
  }

  await databaseBuilder.commit();

  const report = new CertificationReport({
    certificationCourseId: certificationCourse._id,
    isCompleted: false,
    abortReason: ABORT_REASONS.TECHNICAL,
  });

  databaseBuilder.factory.buildCertificationReport({ sessionId, ...report });

  await databaseBuilder.commit();

  const sessionFinalized = await sessionManagementUseCases.finalizeSession({
    sessionId,
    examinerGlobalComment: 'dummy comment',
    hasIncident: false,
    hasJoiningIssue: false,
    certificationReports: [report],
  });

  await sessionManagementUseCases.processAutoJury({ sessionId: sessionFinalized.sessionId });

  await sessionManagementUseCases.registerPublishableSession({ sessionFinalized });

  await databaseBuilder.commit();

  await sessionManagementUseCases.publishSession({ sessionId, i18n });
}
