import sinon from 'sinon';

import * as calibratedChallengeService from '../../../../../../../src/certification/evaluation/domain/services/scoring/calibrated-challenge-service.js';
import { DomainTransaction } from '../../../../../../../src/shared/domain/DomainTransaction.js';
import { expect } from '../../../../../../test-helper.js';
import { domainBuilder } from '../../../../../../tooling/domain-builder/domain-builder.js';
import { generateChallengeList } from '../../../../../shared/fixtures/challenges.js';

const minimumAnswersRequiredToValidateACertification = 20;

describe('Certification | Evaluation | Unit | Domain | Services | calibrated challenge service', function () {
  context('#findCalibratedChallenges', function () {
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

        const version = domainBuilder.certification.configuration
          .versionBuilder()
          .asActive({ startDate: new Date('2025-06-22') })
          .withParameters({ id: 1 })
          .build();
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
        } = await calibratedChallengeService.findCalibratedChallenges({
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
        const version = domainBuilder.certification.configuration
          .versionBuilder()
          .asActive({ startDate: new Date('2025-06-22') })
          .withParameters({ id: 1 })
          .build();
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
          await calibratedChallengeService.findCalibratedChallenges({
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
  return domainBuilder.certification.evaluation.buildChallengeCalibration({
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
