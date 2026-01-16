import { CertificationCompletedJob } from '../../../../../../../src/certification/evaluation/domain/events/CertificationCompleted.js';
import { CoreScoring } from '../../../../../../../src/certification/evaluation/domain/models/CoreScoring.js';
import { DoubleCertificationScoring } from '../../../../../../../src/certification/evaluation/domain/models/DoubleCertificationScoring.js';
import * as flashAlgorithmService from '../../../../../../../src/certification/evaluation/domain/services/algorithm-methods/flash.js';
import { createV3AssessmentResult } from '../../../../../../../src/certification/evaluation/domain/services/scoring/create-v3-assessment-result.js';
import { handleV3CertificationScoring } from '../../../../../../../src/certification/evaluation/domain/services/scoring/scoring-v3.js';
import { SCOPES } from '../../../../../../../src/certification/shared/domain/models/Scopes.js';
import { DomainTransaction } from '../../../../../../../src/shared/domain/DomainTransaction.js';
import { domainBuilder, expect, sinon } from '../../../../../../test-helper.js';
import { generateAnswersForChallenges, generateChallengeList } from '../../../../../shared/fixtures/challenges.js';

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
      scoringDegradationService = { downgradeCapacity: sinon.stub().rejects(new Error('Args mismatch')) };

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

    context('when scoring a only CORE scoped certification', function () {
      it('should return a CoreScoring', async function () {
        // given
        const assessmentId = 1214;
        const certificationCourseId = 1234;
        const userId = 4567;

        const candidate = domainBuilder.certification.evaluation.buildCandidate({
          subscriptionScope: SCOPES.CORE,
          hasCleaSubscription: false,
          reconciledAt: new Date('2021-01-01'),
        });
        const assessmentSheet = domainBuilder.certification.evaluation.buildAssessmentSheet({
          assessmentId,
          certificationCourseId,
        });

        const event = new CertificationCompletedJob({
          assessmentId,
          userId,
          certificationCourseId,
        });

        const v3CertificationScoring = domainBuilder.buildV3CertificationScoring({
          competencesForScoring: [domainBuilder.buildCompetenceForScoring()],
        });
        const challenges = generateChallengeList({ length: maximumAssessmentLength });
        const { answers } = _buildDataFromAnsweredChallenges(challenges);

        assessmentSheet.answers = answers;

        const scoringCriteria = domainBuilder.certification.evaluation.buildComplementaryCertificationScoringCriteria();

        // when
        const score = await handleV3CertificationScoring({
          event,
          assessmentSheet,
          candidate,
          allChallenges: challenges,
          askedChallengesWithoutLiveAlerts: challenges,
          algorithm,
          v3CertificationScoring,
          scoringCriteria,
          scoringDegradationService,
        });

        // then
        expect(score).to.be.instanceOf(CoreScoring);
      });
    });

    context('when scoring a CLEA scoped certification', function () {
      it('should return a CoreScoring and a DoubleCertificationScoring', async function () {
        const assessmentId = 1214;
        const certificationCourseId = 1234;
        const userId = 4567;

        const candidate = domainBuilder.certification.evaluation.buildCandidate({
          subscriptionScope: SCOPES.CORE,
          hasCleaSubscription: true,
          reconciledAt: new Date('2021-01-01'),
        });

        const assessmentSheet = domainBuilder.certification.evaluation.buildAssessmentSheet({
          assessmentId,
          certificationCourseId,
        });

        const event = new CertificationCompletedJob({
          assessmentId,
          userId,
          certificationCourseId,
        });

        const v3CertificationScoring = domainBuilder.buildV3CertificationScoring({
          competencesForScoring: [domainBuilder.buildCompetenceForScoring()],
        });

        const challenges = generateChallengeList({ length: maximumAssessmentLength });
        const scoringCriteria = domainBuilder.certification.evaluation.buildComplementaryCertificationScoringCriteria();

        const score = await handleV3CertificationScoring({
          event,
          assessmentSheet,
          candidate,
          allChallenges: challenges,
          askedChallengesWithoutLiveAlerts: challenges,
          algorithm,
          v3CertificationScoring,
          scoringCriteria,
          scoringDegradationService,
        });

        expect(score.coreScoring).to.be.instanceOf(CoreScoring);
        expect(score.doubleCertificationScoring).to.be.instanceOf(DoubleCertificationScoring);
      });
    });

    context('when scoring a not CORE scoped certification', function () {
      it('should return false because no scoring occurred', async function () {
        const candidate = domainBuilder.certification.evaluation.buildCandidate({
          subscriptionScope: SCOPES.PIX_PLUS_DROIT,
          hasCleaSubscription: false,
        });

        const hasScored = await handleV3CertificationScoring({
          candidate,
        });

        expect(hasScored).to.be.undefined;
      });
    });
  });
});

const _generateCertificationChallengeForChallenge = ({ discriminant, difficulty, id }) => {
  return domainBuilder.certification.scoring.buildChallengeCalibration({
    id,
    discriminant,
    difficulty,
    certificationChallengeId: `certification-challenge-id-for-${id}`,
  });
};

const _buildDataFromAnsweredChallenges = (answeredChallenges) => {
  const challengeCalibrationsWithoutLiveAlerts = answeredChallenges.map(_generateCertificationChallengeForChallenge);
  const answers = generateAnswersForChallenges({ challenges: answeredChallenges });

  return { answers, challengeCalibrationsWithoutLiveAlerts };
};
