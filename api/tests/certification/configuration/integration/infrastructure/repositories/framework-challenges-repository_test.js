import * as frameworkChallengesRepository from '../../../../../../src/certification/configuration/infrastructure/repositories/framework-challenges-repository.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Configuration | Integration | Repository | framework-challenges', function () {
  describe('#getByVersionId', function () {
    it('should return an error when framework challenges do not exist for the given versionId', async function () {
      // given
      const nonExistentVersionId = 99999;

      // when
      const error = await catchErr(frameworkChallengesRepository.getByVersionId)({
        versionId: nonExistentVersionId,
      });

      // then
      expect(error).to.deepEqualInstance(new NotFoundError('Framework challenges do not exist for this version'));
    });

    it('should return framework challenges sorted by challengeId for a given versionId', async function () {
      // given
      const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification();
      const version = databaseBuilder.factory.buildCertificationVersion({
        scope: complementaryCertification.key,
      });

      const secondChallengeSelected = databaseBuilder.factory.buildCertificationFrameworksChallenge({
        versionId: version.id,
        challengeId: 'rec234',
        discriminant: 2.5,
        difficulty: 3.0,
        complementaryCertificationKey: complementaryCertification.key,
      });

      const firstChallengeSelected = databaseBuilder.factory.buildCertificationFrameworksChallenge({
        versionId: version.id,
        challengeId: 'rec123',
        discriminant: 1.5,
        difficulty: 2.0,
        complementaryCertificationKey: complementaryCertification.key,
      });

      // Different versionId - should not be included
      const otherVersion = databaseBuilder.factory.buildCertificationVersion({
        scope: complementaryCertification.key,
      });
      databaseBuilder.factory.buildCertificationFrameworksChallenge({
        versionId: otherVersion.id,
        challengeId: 'rec999',
        complementaryCertificationKey: complementaryCertification.key,
      });

      await databaseBuilder.commit();

      const expectedChallenges = [
        domainBuilder.certification.configuration.buildCertificationFrameworksChallenge({
          versionId: version.id,
          challengeId: firstChallengeSelected.challengeId,
          discriminant: firstChallengeSelected.discriminant,
          difficulty: firstChallengeSelected.difficulty,
        }),
        domainBuilder.certification.configuration.buildCertificationFrameworksChallenge({
          versionId: version.id,
          challengeId: secondChallengeSelected.challengeId,
          discriminant: secondChallengeSelected.discriminant,
          difficulty: secondChallengeSelected.difficulty,
        }),
      ];

      // when
      const challenges = await frameworkChallengesRepository.getByVersionId({
        versionId: version.id,
      });

      // then
      expect(challenges).to.deep.equal(expectedChallenges);
    });
  });

  describe('#update', function () {
    it('should update framework challenges with calibration data', async function () {
      // given
      const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification();
      const version = databaseBuilder.factory.buildCertificationVersion({
        scope: complementaryCertification.key,
      });

      databaseBuilder.factory.buildCertificationFrameworksChallenge({
        versionId: version.id,
        challengeId: 'rec123',
        discriminant: null,
        difficulty: null,
        complementaryCertificationKey: complementaryCertification.key,
      });

      databaseBuilder.factory.buildCertificationFrameworksChallenge({
        versionId: version.id,
        challengeId: 'rec456',
        discriminant: null,
        difficulty: null,
        complementaryCertificationKey: complementaryCertification.key,
      });

      await databaseBuilder.commit();

      const challenges = [
        domainBuilder.certification.configuration.buildCertificationFrameworksChallenge({
          versionId: version.id,
          challengeId: 'rec123',
          discriminant: 1.5,
          difficulty: 2.0,
        }),
        domainBuilder.certification.configuration.buildCertificationFrameworksChallenge({
          versionId: version.id,
          challengeId: 'rec456',
          discriminant: 2.5,
          difficulty: 3.0,
        }),
      ];

      // when
      await frameworkChallengesRepository.update(challenges);

      // then
      const updatedChallenges = await knex('certification-frameworks-challenges')
        .where({ versionId: version.id })
        .orderBy('challengeId');

      expect(updatedChallenges).to.have.lengthOf(2);
      expect(updatedChallenges[0].challengeId).to.equal('rec123');
      expect(updatedChallenges[0].discriminant).to.equal(1.5);
      expect(updatedChallenges[0].difficulty).to.equal(2.0);
      expect(updatedChallenges[1].challengeId).to.equal('rec456');
      expect(updatedChallenges[1].discriminant).to.equal(2.5);
      expect(updatedChallenges[1].difficulty).to.equal(3.0);
    });
  });

  describe('#create', function () {
    it('persists the certification challenges', async function () {
      // given
      const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification();
      const versionId = databaseBuilder.factory.buildCertificationVersion({
        scope: complementaryCertification.key,
      }).id;
      await databaseBuilder.commit();

      const challenges = [
        domainBuilder.certification.configuration.buildCertificationFrameworksChallenge({
          versionId,
          challengeId: 'rec123',
          discriminant: 1.5,
          difficulty: 2.0,
        }),
        domainBuilder.certification.configuration.buildCertificationFrameworksChallenge({
          versionId,
          challengeId: 'rec456',
          discriminant: 2.5,
          difficulty: 3.0,
        }),
      ];

      // when
      await frameworkChallengesRepository.create(challenges);

      // then
      const createdChallenges = await knex('certification-frameworks-challenges')
        .select(['versionId', 'challengeId', 'discriminant', 'difficulty'])
        .where({ versionId })
        .orderBy('challengeId');

      expect(createdChallenges).to.deepEqualArray([
        {
          versionId,
          challengeId: 'rec123',
          discriminant: 1.5,
          difficulty: 2.0,
        },
        {
          versionId,
          challengeId: 'rec456',
          discriminant: 2.5,
          difficulty: 3.0,
        },
      ]);
    });
  });
});
