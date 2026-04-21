import sinon from 'sinon';

import { CertificationComputeError } from '../../../../../../src/certification/evaluation/domain/errors.js';
import { ChallengeNeutralized } from '../../../../../../src/certification/evaluation/domain/events/ChallengeNeutralized.js';
import { rescoreV2Certification } from '../../../../../../src/certification/evaluation/domain/usecases/rescore-v2-certification.js';
import { SessionAlreadyPublishedError } from '../../../../../../src/certification/session-management/domain/errors.js';
import { CertificationCourseRejected } from '../../../../../../src/certification/session-management/domain/events/CertificationCourseRejected.js';
import { CertificationAssessment } from '../../../../../../src/certification/session-management/domain/models/CertificationAssessment.js';
import { NotFinalizedSessionError } from '../../../../../../src/shared/domain/errors.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';
import { AssessmentResult } from '../../../../../../src/shared/domain/models/AssessmentResult.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | Certification | Evaluation | UseCases | rescore-v2-certification', function () {
  describe('session is not in a publishable state', function () {
    it('should reject to do a rescoring is session is still in progress', async function () {
      // given
      const certificationCourseId = 123;
      const sessionNotFinalized = domainBuilder.certification.evaluation.buildSession();
      const evaluationSessionRepository = { getByCertificationCourseId: sinon.stub().resolves(sessionNotFinalized) };

      const event = new CertificationCourseRejected({
        certificationCourseId,
      });

      // when
      const error = await catchErr(rescoreV2Certification)({
        event,
        evaluationSessionRepository,
      });

      // then
      expect(evaluationSessionRepository.getByCertificationCourseId).to.have.been.calledOnceWithExactly({
        certificationCourseId,
      });
      expect(error).to.be.instanceOf(NotFinalizedSessionError);
    });

    it('should reject to do a rescoring on a published session', async function () {
      // given

      const certificationCourseId = 123;
      const sessionStillPublished = domainBuilder.certification.evaluation.buildSession.published();
      const evaluationSessionRepository = { getByCertificationCourseId: sinon.stub().resolves(sessionStillPublished) };

      const event = new CertificationCourseRejected({
        certificationCourseId,
      });

      // when
      const error = await catchErr(rescoreV2Certification)({
        event,
        evaluationSessionRepository,
      });

      // then
      expect(evaluationSessionRepository.getByCertificationCourseId).to.have.been.calledOnceWithExactly({
        certificationCourseId,
      });
      expect(error).to.be.instanceOf(SessionAlreadyPublishedError);
    });
  });

  describe('when handling a v2 certification', function () {
    let assessmentResultRepository,
      certificationAssessmentRepository,
      complementaryCertificationScoringCriteriaRepository,
      evaluationSessionRepository,
      services,
      dependencies;

    beforeEach(function () {
      const session = domainBuilder.certification.evaluation.buildSession.finalized();
      evaluationSessionRepository = { getByCertificationCourseId: sinon.stub().resolves(session) };
      assessmentResultRepository = { save: sinon.stub() };
      certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub() };
      services = {
        handleV2CertificationScoring: sinon.stub(),
        scoreComplementaryCertificationV2: sinon.stub(),
      };

      complementaryCertificationScoringCriteriaRepository = {
        findByCertificationCourseId: sinon.stub(),
      };

      dependencies = {
        assessmentResultRepository,
        certificationAssessmentRepository,
        complementaryCertificationScoringCriteriaRepository,
        evaluationSessionRepository,
        services,
      };
    });

    context('when computation fails', function () {
      it('computes and persists the assessment result in error', async function () {
        // given
        const event = new ChallengeNeutralized({ certificationCourseId: 1, juryId: 7 });
        const certificationAssessment = new CertificationAssessment({
          id: 123,
          userId: 123,
          certificationCourseId: 789,
          createdAt: new Date('2020-01-01'),
          state: Assessment.states.STARTED,
          version: 2,
          certificationChallenges: [
            domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false }),
            domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false }),
          ],
          certificationAnswersByDate: ['answer'],
        });
        certificationAssessmentRepository.getByCertificationCourseId
          .withArgs({ certificationCourseId: 1 })
          .resolves(certificationAssessment);

        services.handleV2CertificationScoring.rejects(new CertificationComputeError('Oopsie'));

        const assessmentResultToBeSaved = new AssessmentResult({
          id: undefined,
          commentByJury: 'Oopsie',
          pixScore: 0,
          reproducibilityRate: 0,
          status: AssessmentResult.status.ERROR,
          assessmentId: 123,
          juryId: 7,
        });
        const savedAssessmentResult = new AssessmentResult({ ...assessmentResultToBeSaved, id: 4 });
        assessmentResultRepository.save
          .withArgs({
            certificationCourseId: 123,
            assessmentResult: assessmentResultToBeSaved,
          })
          .resolves(savedAssessmentResult);

        // when
        await rescoreV2Certification({
          event,
          ...dependencies,
        });

        // then
        expect(assessmentResultRepository.save).to.have.been.calledOnce;
      });
    });
  });
});
