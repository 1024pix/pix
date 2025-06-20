import * as activeCalibratedChallengeRepository from '../../../../../../src/certification/configuration/infrastructure/repositories/active-calibrated-challenge-repository.js';
import { ComplementaryCertificationKeys } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import { datamartBuilder, domainBuilder, expect } from '../../../../../test-helper.js';

describe('Certification | Configuration | Integration | Repository | active-calibrated-challenge', function () {
  describe('#findByComplementaryKeyAndChallengeIds', function () {
    it('should return empty array when empty challenges given', async function () {
      const challenges = [];
      const complementaryCertificationKey = ComplementaryCertificationKeys.PIX_PLUS_DROIT;

      const calibratedChallenges = activeCalibratedChallengeRepository.findByComplementaryKeyAndChallengeIds({
        complementaryCertificationKey,
        challenges,
      });
      expect(calibratedChallenges).to.be.empty;
    });

    it('should return active calibrated challenges found when no challenges given', async function () {
      //given
      const complementaryCertificationKey = ComplementaryCertificationKeys.PIX_PLUS_DROIT;
      const challengeId = 'rec1234';
      const otherChallengeId = 'rec5678';

      const activeCalibratedChallenge = datamartBuilder.factory.buildActiveCalibratedChallenge({
        challengeId,
        calibrationId: '12',
        scope: complementaryCertificationKey,
      });
      // from CLEA scope
      datamartBuilder.factory.buildActiveCalibratedChallenge({
        challengeId,
        scope: ComplementaryCertificationKeys.CLEA,
      });
      // with other challenges
      datamartBuilder.factory.buildActiveCalibratedChallenge({
        otherChallengeId,
        scope: complementaryCertificationKey,
      });
      const expectedActiveCalibratedChallenges = [
        domainBuilder.certification.configuration.buildActiveCalibratedChallenge({
          ...activeCalibratedChallenge,
          challengeId: activeCalibratedChallenge.challenge_id,
        }),
      ];

      const challengeIds = [challengeId];
      await datamartBuilder.commit();

      //when
      const calibratedChallenges = await activeCalibratedChallengeRepository.findByComplementaryKeyAndChallengeIds({
        complementaryCertificationKey,
        challengeIds,
      });

      //then
      expect(calibratedChallenges).to.deep.equal(expectedActiveCalibratedChallenges);
    });
  });
});
