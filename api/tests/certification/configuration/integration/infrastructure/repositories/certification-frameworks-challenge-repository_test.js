import * as certificationFrameworksChallengeRepository from '../../../../../../src/certification/configuration/infrastructure/repositories/certification-frameworks-challenge-repository.js';
import { ComplementaryCertificationKeys } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import { databaseBuilder, domainBuilder, expect, knex } from '../../../../../test-helper.js';

describe('Certification | Configuration | Integration | Repository | certification-frameworks-challenge', function () {
  describe('#find', function () {
    it('should return null when the framework does not exist', async function () {
      // given
      const createdAt = new Date();
      const complementaryCertificationKey = ComplementaryCertificationKeys.PIX_PLUS_DROIT;

      // when
      const certificationFrameworksChallenges = await certificationFrameworksChallengeRepository.find({
        complementaryCertificationKey,
        createdAt,
      });

      // then
      expect(certificationFrameworksChallenges).to.deep.equal([]);
    });

    it('should return a consolidated framework when it exists', async function () {
      // given
      const createdAt = new Date();
      const otherCreatedAt = new Date('2023-06-23');
      const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification();
      const certificationFrameworksChallengeSelected = databaseBuilder.factory.buildCertificationFrameworksChallenge({
        createdAt,
        challengeId: 'rec123',
        complementaryCertificationKey: complementaryCertification.key,
      });
      databaseBuilder.factory.buildCertificationFrameworksChallenge({
        createdAt: otherCreatedAt,
        challengeId: 'rec234',
        complementaryCertificationKey: complementaryCertification.key,
      });
      await databaseBuilder.commit();

      const expectedFrameworkChallenges = [
        domainBuilder.certification.configuration.buildCertificationFrameworksChallenge(
          certificationFrameworksChallengeSelected,
        ),
      ];

      // when
      const certificationFrameworksChallenges = await certificationFrameworksChallengeRepository.find({
        complementaryCertificationKey: complementaryCertification.key,
        createdAt,
      });

      // then
      expect(certificationFrameworksChallenges).to.deep.equal(expectedFrameworkChallenges);
    });
  });

  describe('#save', function () {
    it('should update framework challenges with an alpha and delta', async function () {
      // given
      const complementaryCertificationKey = ComplementaryCertificationKeys.PIX_PLUS_DROIT;
      const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
        key: complementaryCertificationKey,
      });

      const firstCertificationFrameworksChallenge = databaseBuilder.factory.buildCertificationFrameworksChallenge({
        complementaryCertificationKey: complementaryCertification.key,
        createdAt: new Date('2022-01-01T08:00:00Z'),
        challengeId: 'rec123',
        alpha: null,
        delta: null,
      });

      const secondCertificationFrameworksChallenge = databaseBuilder.factory.buildCertificationFrameworksChallenge({
        complementaryCertificationKey: complementaryCertification.key,
        createdAt: new Date('2022-01-01T08:00:00Z'),
        challengeId: 'rec456',
        alpha: null,
        delta: null,
      });

      await databaseBuilder.commit();

      const firstCalibratedCertificationFrameworksChallenge =
        domainBuilder.certification.configuration.buildCertificationFrameworksChallenge({
          ...firstCertificationFrameworksChallenge,
          alpha: 1.3,
          delta: 4.3,
        });
      const secondCalibratedCertificationFrameworksChallenge =
        domainBuilder.certification.configuration.buildCertificationFrameworksChallenge({
          ...secondCertificationFrameworksChallenge,
          alpha: 3.2,
          delta: 1.5,
        });

      const calibratedCertificationFrameworksChallenges = [
        firstCalibratedCertificationFrameworksChallenge,
        secondCalibratedCertificationFrameworksChallenge,
      ];

      const expectedCalibratedFrameworkChallenges = [
        {
          ...firstCertificationFrameworksChallenge,
          alpha: firstCalibratedCertificationFrameworksChallenge.alpha,
          delta: firstCalibratedCertificationFrameworksChallenge.delta,
        },
        {
          ...secondCertificationFrameworksChallenge,
          alpha: secondCalibratedCertificationFrameworksChallenge.alpha,
          delta: secondCalibratedCertificationFrameworksChallenge.delta,
        },
      ];

      // when
      await certificationFrameworksChallengeRepository.save({
        calibratedCertificationFrameworksChallenges,
      });

      // then
      const calibratedFrameworksChallenges = await knex('certification-frameworks-challenges');
      expect(calibratedFrameworksChallenges).to.have.deep.members(expectedCalibratedFrameworkChallenges);
    });
  });
});
