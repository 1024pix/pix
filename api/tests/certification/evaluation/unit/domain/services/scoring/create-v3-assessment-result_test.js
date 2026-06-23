import { createV3AssessmentResult } from '../../../../../../../src/certification/evaluation/domain/services/scoring/create-v3-assessment-result.js';
import { Frameworks } from '../../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { AutoJuryCommentKeys } from '../../../../../../../src/certification/shared/domain/models/JuryComment.js';
import { AssessmentResult } from '../../../../../../../src/shared/domain/models/AssessmentResult.js';
import { expect } from '../../../../../../test-helper.js';
import { domainBuilder } from '../../../../../../tooling/domain-builder/domain-builder.js';
import { generateAnswersForChallenges, generateChallengeList } from '../../../../../shared/fixtures/challenges.js';

const minimumAnswersRequiredToValidateACertification = 20;

describe('Unit | Certification | Evaluation | Domain | Services | Create V3 Assessment Result', function () {
  const competenceMarks = Symbol('someCompetenceMarks');
  const pixScore = 456;
  const capacity = 2.45;
  const reachedMeshIndex = 5;
  const versionId = 7;

  describe('createV3AssessmentResult', function () {
    context('when assessment is going to be cancelled', function () {
      it('it should return cancelled AssessmentResult', function () {
        //when
        const assessmentResult = createV3AssessmentResult({
          toBeCancelled: true,
          allAnswers: [],
          assessmentId: 123,
          pixScore,
          capacity,
          reachedMeshIndex,
          versionId,
          competenceMarks,
          isRejectedForFraud: false,
          isAbortReasonTechnical: false,
          juryId: 123,
          minimumAnswersRequiredToValidateACertification,
        });

        //then
        expect(assessmentResult.status).to.equal(AssessmentResult.status.CANCELLED_BY_JURY);
        expect(assessmentResult.pixScore).to.be.null;
        expect(assessmentResult.competenceMarks).to.deep.equal([]);
        expect(assessmentResult.capacity).to.be.null;
        expect(assessmentResult.reachedMeshIndex).to.be.null;
        expect(assessmentResult.versionId).to.equal(versionId);
      });
    });

    context('when assessment is rejected for fraud', function () {
      it('it should return a rejected for fraud AssessmentResult', function () {
        //when
        const assessmentResult = createV3AssessmentResult({
          toBeCancelled: false,
          allAnswers: [],
          pixScore,
          capacity,
          reachedMeshIndex,
          versionId,
          status: AssessmentResult.status.REJECTED,
          competenceMarks,
          assessmentId: 123,
          isRejectedForFraud: true,
          isAbortReasonTechnical: false,
          juryId: 123,
          minimumAnswersRequiredToValidateACertification,
        });

        //then
        const juryComment = domainBuilder.certification.shared.buildJuryComment.organization({
          commentByAutoJury: AutoJuryCommentKeys.FRAUD,
        });
        expect(assessmentResult.status).to.equal(AssessmentResult.status.REJECTED);
        expect(assessmentResult.commentForOrganization).to.deep.equal(juryComment);
        expect(assessmentResult.pixScore).to.be.null;
        expect(assessmentResult.competenceMarks).to.deep.equal([]);
        expect(assessmentResult.capacity).to.be.null;
        expect(assessmentResult.reachedMeshIndex).to.be.null;
        expect(assessmentResult.versionId).to.equal(versionId);
      });
    });

    context('when assessment has an insuffisant number of answers', function () {
      it('should return a cancelled AssessmentResult if the cause is technical', function () {
        //when
        const assessmentResult = createV3AssessmentResult({
          toBeCancelled: false,
          allAnswers: [],
          assessmentId: 123,
          pixScore,
          capacity,
          reachedMeshIndex,
          versionId,
          status: AssessmentResult.status.VALIDATED,
          competenceMarks,
          isRejectedForFraud: false,
          isAbortReasonTechnical: true,
          juryId: 123,
          minimumAnswersRequiredToValidateACertification,
        });

        //then
        const juryComment = domainBuilder.certification.shared.buildJuryComment.organization({
          commentByAutoJury: AutoJuryCommentKeys.CANCELLED_DUE_TO_LACK_OF_ANSWERS_FOR_TECHNICAL_REASON,
        });
        expect(assessmentResult.status).to.equal(AssessmentResult.status.CANCELLED);
        expect(assessmentResult.commentForOrganization).to.deep.equal(juryComment);
        expect(assessmentResult.pixScore).to.be.null;
        expect(assessmentResult.competenceMarks).to.deep.equal([]);
        expect(assessmentResult.capacity).to.be.null;
        expect(assessmentResult.reachedMeshIndex).to.be.null;
        expect(assessmentResult.versionId).to.equal(versionId);
      });

      it('should return a rejected AssessmentResult if the cause is not technical', function () {
        //when
        const assessmentResult = createV3AssessmentResult({
          toBeCancelled: false,
          allAnswers: [],
          assessmentId: 123,
          pixScore,
          capacity,
          reachedMeshIndex,
          versionId,
          status: AssessmentResult.status.REJECTED,
          competenceMarks,
          isRejectedForFraud: false,
          isAbortReasonTechnical: false,
          juryId: 123,
          minimumAnswersRequiredToValidateACertification,
        });

        //then
        const juryComment = domainBuilder.certification.shared.buildJuryComment.organization({
          commentByAutoJury: AutoJuryCommentKeys.REJECTED_DUE_TO_LACK_OF_ANSWERS,
        });
        expect(assessmentResult.status).to.equal(AssessmentResult.status.REJECTED);
        expect(assessmentResult.commentForOrganization).to.deep.equal(juryComment);
        expect(assessmentResult.pixScore).to.be.null;
        expect(assessmentResult.competenceMarks).to.deep.equal([]);
        expect(assessmentResult.capacity).to.be.null;
        expect(assessmentResult.reachedMeshIndex).to.be.null;
        expect(assessmentResult.versionId).to.equal(versionId);
      });
    });

    context('when assessment has a sufficient number of answers', function () {
      let allChallenges, answeredChallenges, answers;

      beforeEach(function () {
        allChallenges = generateChallengeList({ length: minimumAnswersRequiredToValidateACertification + 1 });
        answeredChallenges = allChallenges.slice(0, -1);

        answers = _buildDataFromAnsweredChallenges(answeredChallenges).answers;
      });

      context('when capacity does not belong to any mesh', function () {
        context('there is a score equal to 0', function () {
          it('should return a rejected AssessmentResult with auto-jury comment', function () {
            //when
            const assessmentResult = createV3AssessmentResult({
              toBeCancelled: false,
              allAnswers: answers,
              assessmentId: 123,
              pixScore: 0,
              capacity,
              reachedMeshIndex: null,
              versionId,
              status: AssessmentResult.status.REJECTED,
              competenceMarks,
              isRejectedForFraud: false,
              isAbortReasonTechnical: false,
              juryId: 123,
              minimumAnswersRequiredToValidateACertification,
              certificationFramework: Frameworks.CORE,
            });

            //then
            const juryComment = domainBuilder.certification.shared.buildJuryComment.organization({
              commentByAutoJury: AutoJuryCommentKeys.REJECTED_DUE_TO_ZERO_PIX_SCORE,
            });
            expect(assessmentResult.status).to.equal(AssessmentResult.status.REJECTED);
            expect(assessmentResult.commentForOrganization).to.deep.equal(juryComment);
            expect(assessmentResult.pixScore).to.equal(0);
            expect(assessmentResult.competenceMarks).to.deep.equal([]);
            expect(assessmentResult.capacity).to.equal(capacity);
            expect(assessmentResult.reachedMeshIndex).to.equal(null);
            expect(assessmentResult.versionId).to.equal(versionId);
          });
        });

        context('when there is no score', function () {
          it('should return a rejected AssessmentResult without auto-jury comment', function () {
            //when
            const assessmentResult = createV3AssessmentResult({
              toBeCancelled: false,
              allAnswers: answers,
              assessmentId: 123,
              pixScore: null,
              capacity,
              reachedMeshIndex: null,
              versionId,
              status: AssessmentResult.status.REJECTED,
              competenceMarks,
              isRejectedForFraud: false,
              isAbortReasonTechnical: false,
              juryId: 123,
              minimumAnswersRequiredToValidateACertification,
              certificationFramework: Frameworks.CORE,
            });

            //then
            expect(assessmentResult.status).to.equal(AssessmentResult.status.REJECTED);
            expect(assessmentResult.commentForOrganization).to.deep.equal(
              domainBuilder.certification.shared.buildJuryComment.organization({
                commentByAutoJury: null,
              }),
            );
            expect(assessmentResult.pixScore).to.be.null;
          });
        });

        context('when the certification framework is an EDU one', function () {
          it('should return a rejected AssessmentResult with the REJECTED_EDU_NOT_ELIGIBLE auto-jury comment', function () {
            //when
            const assessmentResult = createV3AssessmentResult({
              toBeCancelled: false,
              allAnswers: answers,
              assessmentId: 123,
              pixScore: null,
              capacity,
              reachedMeshIndex: null,
              versionId,
              status: AssessmentResult.status.REJECTED,
              competenceMarks,
              isRejectedForFraud: false,
              isAbortReasonTechnical: false,
              juryId: 123,
              minimumAnswersRequiredToValidateACertification,
              certificationFramework: Frameworks.EDU_1ER_DEGRE,
            });

            //then
            const juryComment = domainBuilder.certification.shared.buildJuryComment.candidate({
              commentByAutoJury: AutoJuryCommentKeys.REJECTED_EDU_NOT_ELIGIBLE,
            });
            expect(assessmentResult.status).to.equal(AssessmentResult.status.REJECTED);
            expect(assessmentResult.commentForCandidate).to.deep.equal(juryComment);
            expect(assessmentResult.pixScore).to.be.null;
            expect(assessmentResult.reachedMeshIndex).to.be.null;
          });
        });

        context('when the certification framework is a Pix+ (DROIT, PRO_SANTE)', function () {
          it('should return a rejected AssessmentResult with the REJECTED_PIX_PLUS_NOT_OBTAINED auto-jury comment', function () {
            //when
            const assessmentResult = createV3AssessmentResult({
              toBeCancelled: false,
              allAnswers: answers,
              assessmentId: 123,
              pixScore: null,
              capacity,
              reachedMeshIndex: null,
              versionId,
              status: AssessmentResult.status.REJECTED,
              competenceMarks,
              isRejectedForFraud: false,
              isAbortReasonTechnical: false,
              juryId: 123,
              minimumAnswersRequiredToValidateACertification,
              certificationFramework: Frameworks.DROIT,
            });

            //then
            const juryComment = domainBuilder.certification.shared.buildJuryComment.candidate({
              commentByAutoJury: AutoJuryCommentKeys.REJECTED_PIX_PLUS_NOT_OBTAINED,
            });
            expect(assessmentResult.status).to.equal(AssessmentResult.status.REJECTED);
            expect(assessmentResult.commentForCandidate).to.deep.equal(juryComment);
            expect(assessmentResult.pixScore).to.be.null;
            expect(assessmentResult.reachedMeshIndex).to.be.null;
          });
        });
      });

      context('when at least minimum mesh is reached', function () {
        context('there is a score and it is equal to 0', function () {
          it('should return a rejected AssessmentResult with auto-jury comment', function () {
            //when
            const assessmentResult = createV3AssessmentResult({
              toBeCancelled: false,
              allAnswers: answers,
              assessmentId: 123,
              pixScore: 0,
              capacity,
              reachedMeshIndex: 0,
              versionId,
              status: AssessmentResult.status.REJECTED,
              competenceMarks,
              isRejectedForFraud: false,
              isAbortReasonTechnical: false,
              juryId: 123,
              minimumAnswersRequiredToValidateACertification,
              certificationFramework: Frameworks.CORE,
            });

            //then
            const juryComment = domainBuilder.certification.shared.buildJuryComment.organization({
              commentByAutoJury: AutoJuryCommentKeys.REJECTED_DUE_TO_ZERO_PIX_SCORE,
            });
            expect(assessmentResult.status).to.equal(AssessmentResult.status.REJECTED);
            expect(assessmentResult.commentForOrganization).to.deep.equal(juryComment);
            expect(assessmentResult.pixScore).to.equal(0);
            expect(assessmentResult.competenceMarks).to.deep.equal([]);
            expect(assessmentResult.capacity).to.equal(capacity);
            expect(assessmentResult.reachedMeshIndex).to.equal(0);
            expect(assessmentResult.versionId).to.equal(versionId);
          });
        });
        it('should return a standard AssessmentResult', function () {
          //when
          const assessmentResult = createV3AssessmentResult({
            toBeCancelled: false,
            allAnswers: answers,
            assessmentId: 123,
            pixScore,
            capacity,
            reachedMeshIndex,
            versionId,
            status: AssessmentResult.status.VALIDATED,
            competenceMarks,
            isRejectedForFraud: false,
            isAbortReasonTechnical: false,
            juryId: 123,
            minimumAnswersRequiredToValidateACertification,
            certificationFramework: Frameworks.CORE,
          });

          //then
          expect(assessmentResult.status).to.equal(AssessmentResult.status.VALIDATED);
          expect(assessmentResult.pixScore).to.equal(pixScore);
          expect(assessmentResult.competenceMarks).to.deep.equal(competenceMarks);
          expect(assessmentResult.capacity).to.equal(capacity);
          expect(assessmentResult.reachedMeshIndex).to.equal(reachedMeshIndex);
          expect(assessmentResult.versionId).to.equal(versionId);
        });
      });
    });
  });
});

const _buildDataFromAnsweredChallenges = (answeredChallenges) => {
  const challengeCalibrationsWithoutLiveAlerts = answeredChallenges.map(_generateCertificationChallengeForChallenge);
  const answers = generateAnswersForChallenges({ challenges: answeredChallenges });

  return { answers, challengeCalibrationsWithoutLiveAlerts };
};

const _generateCertificationChallengeForChallenge = ({ discriminant, difficulty, id }) => {
  return domainBuilder.certification.evaluation.buildChallengeCalibration({
    id,
    discriminant,
    difficulty,
    certificationChallengeId: `certification-challenge-id-for-${id}`,
  });
};
