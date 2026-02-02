import * as calibratedChallengeService from '../../../../../../../src/certification/evaluation/domain/services/scoring/calibrated-challenge-service.js';
import { config } from '../../../../../../../src/shared/config.js';
import { DomainTransaction } from '../../../../../../../src/shared/domain/DomainTransaction.js';
import { domainBuilder, expect, sinon } from '../../../../../../test-helper.js';
import { generateChallengeList } from '../../../../../shared/fixtures/challenges.js';

const { minimumAnswersRequiredToValidateACertification } = config.v3Certification.scoring;

describe('Certification | Evaluation | Unit | Domain | Services | calibrated challenge service', function () {
  context('#findByCertificationCourseAndVersion', function () {
    let challengeCalibrationRepository, calibratedChallengeRepository, certificationChallengeLiveAlertRepository;

    let challengeList;

    beforeEach(function () {
      sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
        return callback();
      });

      challengeList = generateChallengeList({ length: minimumAnswersRequiredToValidateACertification + 1 });

      challengeCalibrationRepository = {
        getByCertificationCourseId: sinon.stub().rejects(new Error('Args mismatch')),
      };

      certificationChallengeLiveAlertRepository = {
        getLiveAlertValidatedChallengeIdsByAssessmentId: sinon.stub(),
      };

      calibratedChallengeRepository = {
        getAllCalibratedChallenges: sinon.stub().rejects(new Error('Args mismatch')),
      };
    });

    context('when there are no validated live alerts', function () {
      it('should return askedChallenges, allChallenges and challengeCalibrations', async function () {
        // given
        const certificationCourseId = 1234;
        const assessmentId = 5678;

        const version = domainBuilder.certification.shared.buildVersion({
          startDate: new Date('2025-06-22'),
        });
        calibratedChallengeRepository.getAllCalibratedChallenges.withArgs({ version }).resolves(challengeList);

        const expectedAskedChallenges = [...challengeList.slice(1)];
        const expectedChallengeCalibrations = _buildDataFromAnsweredChallenges(expectedAskedChallenges);
        challengeCalibrationRepository.getByCertificationCourseId
          .withArgs({ certificationCourseId })
          .resolves(expectedChallengeCalibrations);

        certificationChallengeLiveAlertRepository.getLiveAlertValidatedChallengeIdsByAssessmentId
          .withArgs({ assessmentId })
          .resolves([]);

        // when
        const {
          allChallenges,
          askedChallengesWithoutLiveAlerts: askedChallenges,
          challengeCalibrationsWithoutLiveAlerts: challengeCalibrations,
        } = await calibratedChallengeService.findByCertificationCourseAndVersion({
          certificationCourseId,
          version,
          assessmentId,
          challengeCalibrationRepository,
          certificationChallengeLiveAlertRepository,
          calibratedChallengeRepository,
        });

        // then
        expect(allChallenges).to.deep.equal(challengeList);
        expect(askedChallenges).to.deep.equal(expectedAskedChallenges);
        expect(challengeCalibrations).to.deep.equal(expectedChallengeCalibrations);
      });
    });

    context('when there are validated live alerts', function () {
      it('should return asked challenges without live alerts, all challenges and challenge calibrations without live alerts', async function () {
        // given
        const certificationCourseId = 1234;
        const assessmentId = 5678;
        const version = domainBuilder.certification.shared.buildVersion({
          startDate: new Date('2025-06-22'),
        });
        calibratedChallengeRepository.getAllCalibratedChallenges.withArgs({ version }).resolves(challengeList);

        const challengeWithValidatedLiveAlert = domainBuilder.buildChallenge({
          ...challengeList.at(-1),
        });

        const expectedAskedChallenges = [...challengeList];
        const expectedChallengeCalibrations = _buildDataFromAnsweredChallenges(expectedAskedChallenges);
        challengeCalibrationRepository.getByCertificationCourseId
          .withArgs({ certificationCourseId })
          .resolves(expectedChallengeCalibrations);

        certificationChallengeLiveAlertRepository.getLiveAlertValidatedChallengeIdsByAssessmentId
          .withArgs({ assessmentId })
          .resolves([challengeWithValidatedLiveAlert.id]);

        challengeCalibrationRepository.getByCertificationCourseId
          .withArgs({ certificationCourseId })
          .resolves(expectedChallengeCalibrations);

        const expectedAskedChallengesWithoutLiveAlerts = expectedAskedChallenges.slice(0, -1);
        const expectedChallengeCalibrationsWithoutLiveAlerts = expectedChallengeCalibrations.slice(0, -1);

        // when
        const { allChallenges, askedChallengesWithoutLiveAlerts, challengeCalibrationsWithoutLiveAlerts } =
          await calibratedChallengeService.findByCertificationCourseAndVersion({
            certificationCourseId,
            version,
            assessmentId,
            challengeCalibrationRepository,
            certificationChallengeLiveAlertRepository,
            calibratedChallengeRepository,
          });

        // then
        expect(allChallenges).to.deep.equal(challengeList);
        expect(challengeCalibrationsWithoutLiveAlerts).to.deep.equal(expectedChallengeCalibrationsWithoutLiveAlerts);
        expect(askedChallengesWithoutLiveAlerts).to.deep.equal(expectedAskedChallengesWithoutLiveAlerts);
      });
    });
  });
});

const _generateChallengeCalibrations = ({ discriminant, difficulty, id }) => {
  return domainBuilder.certification.scoring.buildChallengeCalibration({
    id,
    discriminant,
    difficulty,
    certificationChallengeId: `certification-challenge-id-for-${id}`,
  });
};

const _buildDataFromAnsweredChallenges = (challengeList) => {
  const challengeCalibrations = challengeList.map(_generateChallengeCalibrations);
  return challengeCalibrations;
};
