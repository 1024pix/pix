import { CertificationCompletedJob } from '../../../../../../../src/certification/evaluation/domain/events/CertificationCompleted.js';
import { DoubleCertificationScoring } from '../../../../../../../src/certification/evaluation/domain/models/DoubleCertificationScoring.js';
import * as flashAlgorithmService from '../../../../../../../src/certification/evaluation/domain/services/algorithm-methods/flash.js';
import { createV3AssessmentResult } from '../../../../../../../src/certification/evaluation/domain/services/scoring/create-v3-assessment-result.js';
import { handleV3CertificationScoring } from '../../../../../../../src/certification/evaluation/domain/services/scoring/scoring-v3.js';
import { CompetenceMark } from '../../../../../../../src/certification/shared/domain/models/CompetenceMark.js';
import { Frameworks } from '../../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { DomainTransaction } from '../../../../../../../src/shared/domain/DomainTransaction.js';
import { AssessmentResult } from '../../../../../../../src/shared/domain/models/AssessmentResult.js';
import { domainBuilder, expect, sinon } from '../../../../../../test-helper.js';
import {
  generateAnswersForChallenges,
  generateCalibratedChallengeList,
} from '../../../../../shared/fixtures/challenges.js';

const maximumAssessmentLength = 32;

describe('Unit | Certification | Evaluation | Domain | Services | Scoring V3', function () {
  context('#handleV3CertificationScoring', function () {
    let algorithm;
    let scoringDegradationService;

    let clock;
    const now = new Date('2019-01-01T05:06:07Z');

    beforeEach(function () {
      sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
        return callback();
      });
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
      scoringDegradationService = {
        downgradeCapacity: sinon.stub().rejects(new Error('Args mismatch')),
      };

      const flashAssessmentAlgorithmConfiguration = domainBuilder.buildFlashAlgorithmConfiguration();

      algorithm = domainBuilder.buildFlashAssessmentAlgorithm({
        flashAlgorithmImplementation: flashAlgorithmService,
        configuration: flashAssessmentAlgorithmConfiguration,
      });
      sinon.stub(createV3AssessmentResult);
    });

    afterEach(function () {
      clock.restore();
    });

    context('when scoring a CORE certification', function () {
      it('should return an AssessmentResult with a pixScore', function () {
        // given
        const assessmentId = 1214;
        const certificationCourseId = 1234;

        const assessmentSheet = domainBuilder.certification.evaluation.buildAssessmentSheet({
          assessmentId,
          certificationCourseId,
          certificationFramework: Frameworks.CORE,
        });

        const event = new CertificationCompletedJob({
          certificationCourseId,
        });

        const v3CertificationScoring = domainBuilder.buildV3CertificationScoring({
          competencesForScoring: [domainBuilder.buildCompetenceForScoring()],
        });
        const challenges = generateCalibratedChallengeList({
          length: maximumAssessmentLength,
        });
        const { answers } = _buildDataFromAnsweredChallenges(challenges);

        assessmentSheet.answers = answers;

        // when
        const score = handleV3CertificationScoring({
          event,
          assessmentSheet,
          allChallenges: challenges,
          askedChallengesWithoutLiveAlerts: challenges,
          algorithm,
          v3CertificationScoring,
          cleaScoringCriteria: null,
          scoringDegradationService,
        });

        // then
        expect(score.coreAssessmentResult).to.be.instanceOf(AssessmentResult);
        expect(score.coreAssessmentResult.competenceMarks[0]).to.be.instanceOf(CompetenceMark);
        expect(score.coreAssessmentResult.pixScore).to.equal(880);
        expect(score.doubleCertificationScoring).to.be.null;
      });

      context('when capacity does not belong to any mesh', function () {
        it('should return a REJECTED AssessmentResult', function () {
          // given
          const assessmentId = 1214;
          const certificationCourseId = 1234;

          const assessmentSheet = domainBuilder.certification.evaluation.buildAssessmentSheet({
            assessmentId,
            certificationCourseId,
            certificationFramework: Frameworks.CORE,
          });

          const event = new CertificationCompletedJob({
            certificationCourseId,
          });

          const v3CertificationScoring = domainBuilder.buildV3CertificationScoring({
            competencesForScoring: [domainBuilder.buildCompetenceForScoring()],
            certificationScoringConfiguration: [{ bounds: { max: 8, min: 7 }, meshLevel: 0 }],
          });
          const challenges = generateCalibratedChallengeList({
            length: maximumAssessmentLength,
          });
          const { answers } = _buildDataFromAnsweredChallenges(challenges);

          assessmentSheet.answers = answers;

          // when
          const score = handleV3CertificationScoring({
            event,
            assessmentSheet,
            allChallenges: challenges,
            askedChallengesWithoutLiveAlerts: challenges,
            algorithm,
            v3CertificationScoring,
            cleaScoringCriteria: null,
            scoringDegradationService,
          });

          // then
          expect(score.coreAssessmentResult.status).to.equal(AssessmentResult.status.REJECTED);
          expect(score.coreAssessmentResult.pixScore).to.equal(0);
        });
      });
    });

    context('when scoring a double certification (CLEA)', function () {
      it('should return an AssessmentResult with a pixScore and a DoubleCertificationScoring', function () {
        const assessmentId = 1214;
        const certificationCourseId = 1234;
        const userId = 4567;

        const assessmentSheet = domainBuilder.certification.evaluation.buildAssessmentSheet({
          assessmentId,
          certificationCourseId,
          certificationFramework: Frameworks.CLEA,
        });

        const event = new CertificationCompletedJob({
          assessmentId,
          userId,
          certificationCourseId,
        });

        const v3CertificationScoring = domainBuilder.buildV3CertificationScoring({
          competencesForScoring: [domainBuilder.buildCompetenceForScoring()],
        });

        const challenges = generateCalibratedChallengeList({
          length: maximumAssessmentLength,
        });
        const cleaScoringCriteria =
          domainBuilder.certification.evaluation.buildComplementaryCertificationScoringCriteria();

        const score = handleV3CertificationScoring({
          event,
          assessmentSheet,
          allChallenges: challenges,
          askedChallengesWithoutLiveAlerts: challenges,
          algorithm,
          v3CertificationScoring,
          cleaScoringCriteria,
          scoringDegradationService,
        });

        expect(score.coreAssessmentResult).to.be.instanceOf(AssessmentResult);
        expect(score.coreAssessmentResult.competenceMarks[0]).to.be.instanceOf(CompetenceMark);
        expect(score.coreAssessmentResult.pixScore).to.equal(55);
        expect(score.doubleCertificationScoring).to.be.instanceOf(DoubleCertificationScoring);
      });
    });

    context('when scoring a Pix + scoped certification', function () {
      it('should return an AssessmentResult without pixScore', function () {
        // given
        const assessmentId = 1214;
        const certificationCourseId = 1234;

        const assessmentSheet = domainBuilder.certification.evaluation.buildAssessmentSheet({
          assessmentId,
          certificationCourseId,
          certificationFramework: Frameworks.PRO_SANTE,
        });

        const event = new CertificationCompletedJob({
          certificationCourseId,
        });

        const v3CertificationScoring = domainBuilder.buildV3CertificationScoring();
        const challenges = generateCalibratedChallengeList({
          length: maximumAssessmentLength,
        });
        const { answers } = _buildDataFromAnsweredChallenges(challenges);

        assessmentSheet.answers = answers;

        // when
        const score = handleV3CertificationScoring({
          event,
          assessmentSheet,
          allChallenges: challenges,
          askedChallengesWithoutLiveAlerts: challenges,
          algorithm,
          v3CertificationScoring,
          cleaScoringCriteria: null,
          scoringDegradationService,
        });

        // then
        expect(score.coreAssessmentResult).to.be.instanceOf(AssessmentResult);
        expect(score.coreAssessmentResult.competenceMarks).to.have.lengthOf(0);
        expect(score.coreAssessmentResult.pixScore).to.be.null;
        expect(score.doubleCertificationScoring).to.be.null;
      });

      it('should return a REJECTED AssessmentResult when capacity is not included in any mesh', function () {
        // given
        const assessmentId = 1214;
        const certificationCourseId = 1234;

        const assessmentSheet = domainBuilder.certification.evaluation.buildAssessmentSheet({
          assessmentId,
          certificationCourseId,
          certificationFramework: Frameworks.EDU_1ER_DEGRE,
        });

        const event = new CertificationCompletedJob({
          certificationCourseId,
        });

        const v3CertificationScoring = domainBuilder.buildV3CertificationScoring({
          certificationScoringConfiguration: [
            { bounds: { max: 20, min: 10 }, meshLevel: 0 },
            { bounds: { max: 30, min: 20 }, meshLevel: 1 },
          ],
        });
        const challenges = generateCalibratedChallengeList({
          length: maximumAssessmentLength,
        });
        const { answers } = _buildDataFromAnsweredChallenges(challenges);

        assessmentSheet.answers = answers;

        // when
        const score = handleV3CertificationScoring({
          event,
          assessmentSheet,
          allChallenges: challenges,
          askedChallengesWithoutLiveAlerts: challenges,
          algorithm,
          v3CertificationScoring,
          cleaScoringCriteria: null,
          scoringDegradationService,
        });

        // then
        expect(score.coreAssessmentResult.status).to.equal(AssessmentResult.status.REJECTED);
      });
    });
  });
});

const _generateCertificationChallengeForChallenge = ({ discriminant, difficulty, id }) => {
  return domainBuilder.certification.evaluation.buildChallengeCalibration({
    id,
    discriminant,
    difficulty,
    certificationChallengeId: `certification-challenge-id-for-${id}`,
  });
};

const _buildDataFromAnsweredChallenges = (answeredChallenges) => {
  const challengeCalibrationsWithoutLiveAlerts = answeredChallenges.map(_generateCertificationChallengeForChallenge);
  const answers = generateAnswersForChallenges({
    challenges: answeredChallenges,
  });

  return { answers, challengeCalibrationsWithoutLiveAlerts };
};
