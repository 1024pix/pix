import { createV3AssessmentResult } from '../../../../../../../src/certification/evaluation/domain/services/scoring/create-v3-assessment-result.js';
import { AutoJuryCommentKeys } from '../../../../../../../src/certification/shared/domain/models/JuryComment.js';
import { config } from '../../../../../../../src/shared/config.js';
import { AssessmentResult, status } from '../../../../../../../src/shared/domain/models/AssessmentResult.js';
import { domainBuilder, expect } from '../../../../../../test-helper.js';
import { generateAnswersForChallenges, generateChallengeList } from '../../../../../shared/fixtures/challenges.js';

const { minimumAnswersRequiredToValidateACertification } = config.v3Certification.scoring;

describe('Unit | Certification | Evaluation | Domain | Services | Create V3 Assessment Result', function () {
  describe('createV3AssessmentResult', function () {
    it('it should return cancelled AssessmentResult if toBeCancelled is true', function () {
      //when
      const assessmentResult = createV3AssessmentResult({
        toBeCancelled: true,
        allAnswers: [],
        assessmentId: 123,
        certificationAssessmentScore: domainBuilder.buildCertificationAssessmentScoreV3(),
        isRejectedForFraud: false,
        isAbortReasonTechnical: false,
        juryId: 123,
      });

      //then
      expect(assessmentResult.status).to.equal(AssessmentResult.status.CANCELLED);
    });
    it('it should return a rejected for fraud AssessmentResult if isRejectedForFraud is true', function () {
      //when
      const assessmentResult = createV3AssessmentResult({
        toBeCancelled: false,
        allAnswers: [],
        assessmentId: 123,
        certificationAssessmentScore: domainBuilder.buildCertificationAssessmentScoreV3({ status: status.REJECTED }),
        isRejectedForFraud: true,
        isAbortReasonTechnical: false,
        juryId: 123,
      });

      //then
      const juryComment = domainBuilder.certification.shared.buildJuryComment.organization({
        commentByAutoJury: AutoJuryCommentKeys.FRAUD,
      });
      expect(assessmentResult.status).to.equal(AssessmentResult.status.REJECTED);
      expect(assessmentResult.commentForOrganization).to.deep.equal(juryComment);
    });
    context('when there is an insuffisant number of answer', function () {
      it('should return a cancelled AssessmentResult if the cause is technical', function () {
        //when
        const assessmentResult = createV3AssessmentResult({
          toBeCancelled: false,
          allAnswers: [],
          assessmentId: 123,
          certificationAssessmentScore: domainBuilder.buildCertificationAssessmentScoreV3(),
          isRejectedForFraud: false,
          isAbortReasonTechnical: true,
          juryId: 123,
        });

        //then
        const juryComment = domainBuilder.certification.shared.buildJuryComment.organization({
          commentByAutoJury: AutoJuryCommentKeys.CANCELLED_DUE_TO_LACK_OF_ANSWERS_FOR_TECHNICAL_REASON,
        });
        expect(assessmentResult.status).to.equal(AssessmentResult.status.CANCELLED);
        expect(assessmentResult.commentForOrganization).to.deep.equal(juryComment);
      });
      it('should return a rejected AssessmentResult if the cause is not technical', function () {
        //when
        const assessmentResult = createV3AssessmentResult({
          toBeCancelled: false,
          allAnswers: [],
          assessmentId: 123,
          certificationAssessmentScore: domainBuilder.buildCertificationAssessmentScoreV3({ status: status.REJECTED }),
          isRejectedForFraud: false,
          isAbortReasonTechnical: false,
          juryId: 123,
        });

        //then
        const juryComment = domainBuilder.certification.shared.buildJuryComment.organization({
          commentByAutoJury: AutoJuryCommentKeys.REJECTED_DUE_TO_LACK_OF_ANSWERS,
        });
        expect(assessmentResult.status).to.equal(AssessmentResult.status.REJECTED);
        expect(assessmentResult.commentForOrganization).to.deep.equal(juryComment);
      });
    });
    context('when there is a sufficient number of answers', function () {
      let allChallenges, answeredChallenges, answers;
      beforeEach(function () {
        allChallenges = generateChallengeList({ length: minimumAnswersRequiredToValidateACertification + 1 });
        answeredChallenges = allChallenges.slice(0, -1);

        answers = _buildDataFromAnsweredChallenges(answeredChallenges).answers;
      });
      it('should return a rejected AssessmentResult if pix score is 0', function () {
        //when
        const assessmentResult = createV3AssessmentResult({
          toBeCancelled: false,
          allAnswers: answers,
          assessmentId: 123,
          certificationAssessmentScore: domainBuilder.buildCertificationAssessmentScoreV3({ nbPix: 0 }),
          isRejectedForFraud: false,
          isAbortReasonTechnical: false,
          juryId: 123,
        });

        //then
        const juryComment = domainBuilder.certification.shared.buildJuryComment.organization({
          commentByAutoJury: AutoJuryCommentKeys.REJECTED_DUE_TO_ZERO_PIX_SCORE,
        });
        expect(assessmentResult.status).to.equal(AssessmentResult.status.REJECTED);
        expect(assessmentResult.commentForOrganization).to.deep.equal(juryComment);
      });
      it('should return a standard AssessmentResult if pix score is not 0', function () {
        //when
        const assessmentResult = createV3AssessmentResult({
          toBeCancelled: false,
          allAnswers: answers,
          assessmentId: 123,
          certificationAssessmentScore: domainBuilder.buildCertificationAssessmentScoreV3({
            nbPix: 100,
            status: status.VALIDATED,
          }),
          isRejectedForFraud: false,
          isAbortReasonTechnical: false,
          juryId: 123,
        });

        //then
        expect(assessmentResult.status).to.equal(AssessmentResult.status.VALIDATED);
        expect(assessmentResult.pixScore).to.equal(100);
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
  return domainBuilder.certification.scoring.buildChallengeCalibration({
    id,
    discriminant,
    difficulty,
    certificationChallengeId: `certification-challenge-id-for-${id}`,
  });
};
