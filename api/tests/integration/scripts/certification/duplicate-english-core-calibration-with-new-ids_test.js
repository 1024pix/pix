import sinon from 'sinon';

import { DuplicateEnglishCoreCalibrationWithNewIds } from '../../../../scripts/certification/duplicate-english-core-calibration-with-new-ids.js';
import { expect } from '../../../test-helper.js';
import { databaseBuilder, knex } from '../../../tooling/databases.js';

describe('Integration | Scripts | Certification | duplicate-english-core-calibration-with-new-ids', function () {
  let script;
  let logger;

  beforeEach(function () {
    script = new DuplicateEnglishCoreCalibrationWithNewIds();
    logger = { info: sinon.stub(), warn: sinon.stub() };
  });

  describe('#handle', function () {
    context('when dryRun is false', function () {
      it('should insert duplicates with -EN suffix for English challenges of the current CORE version', async function () {
        // given
        const { id: versionId } = databaseBuilder.factory.buildCertificationVersion({
          scope: 'CORE',
          expirationDate: null,
        });

        const { id: challengeId } = databaseBuilder.factory.learningContent.buildChallenge({
          id: 'challengeEn1',
          locales: ['en'],
        });

        databaseBuilder.factory.buildCertificationFrameworksChallenge({
          challengeId,
          versionId,
          discriminant: 1.5,
          difficulty: 2.5,
        });

        await databaseBuilder.commit();

        // when
        await script.handle({ logger, options: { dryRun: false } });

        // then
        const insertedChallenge = await knex('certification-frameworks-challenges')
          .where({ challengeId: `${challengeId}-EN`, versionId })
          .first();

        expect(insertedChallenge).to.exist;
        expect(insertedChallenge.discriminant).to.equal(1.5);
        expect(insertedChallenge.difficulty).to.equal(2.5);
      });

      it('should not duplicate non-English challenges', async function () {
        // given
        const { id: versionId } = databaseBuilder.factory.buildCertificationVersion({
          scope: 'CORE',
          expirationDate: null,
        });

        const { id: frenchChallengeId } = databaseBuilder.factory.learningContent.buildChallenge({
          id: 'challengeFr1',
          locales: ['fr'],
        });

        databaseBuilder.factory.buildCertificationFrameworksChallenge({
          challengeId: frenchChallengeId,
          versionId,
        });

        await databaseBuilder.commit();

        // when
        await script.handle({ logger, options: { dryRun: false } });

        // then
        const insertedChallenge = await knex('certification-frameworks-challenges')
          .where({ challengeId: `${frenchChallengeId}-EN` })
          .first();

        expect(insertedChallenge).to.not.exist;
      });

      it('should not duplicate English challenges from an expired CORE version', async function () {
        // given
        const { id: expiredVersionId } = databaseBuilder.factory.buildCertificationVersion({
          scope: 'CORE',
          expirationDate: new Date('2025-01-01'),
        });

        const { id: challengeId } = databaseBuilder.factory.learningContent.buildChallenge({
          id: 'challengeEnExpired',
          locales: ['en'],
        });

        databaseBuilder.factory.buildCertificationFrameworksChallenge({
          challengeId,
          versionId: expiredVersionId,
        });

        await databaseBuilder.commit();

        // when
        await script.handle({ logger, options: { dryRun: false } });

        // then
        const insertedChallenge = await knex('certification-frameworks-challenges')
          .where({ challengeId: `${challengeId}-EN` })
          .first();

        expect(insertedChallenge).to.not.exist;
      });
    });

    context('when dryRun is true', function () {
      it('should not modify the database', async function () {
        // given
        const { id: versionId } = databaseBuilder.factory.buildCertificationVersion({
          scope: 'CORE',
          expirationDate: null,
        });

        const { id: challengeId } = databaseBuilder.factory.learningContent.buildChallenge({
          id: 'challengeEn1',
          locales: ['en'],
        });

        databaseBuilder.factory.buildCertificationFrameworksChallenge({
          challengeId,
          versionId,
        });

        await databaseBuilder.commit();

        const { count: countBefore } = await knex('certification-frameworks-challenges').count('id as count').first();

        // when
        await script.handle({ logger, options: { dryRun: true } });

        // then
        const { count: countAfter } = await knex('certification-frameworks-challenges').count('id as count').first();
        expect(Number(countAfter)).to.equal(Number(countBefore));
      });
    });
  });
});
