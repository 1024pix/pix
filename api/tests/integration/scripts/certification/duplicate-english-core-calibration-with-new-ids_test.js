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
      it('should insert duplicates with -EN suffix for challenges that have a -EN counterpart in LCMS', async function () {
        // given
        const { id: versionId } = databaseBuilder.factory.buildCertificationVersion({
          scope: 'CORE',
          expirationDate: null,
        });

        const baseId = 'challengeEn1';

        databaseBuilder.factory.learningContent.buildChallenge({
          id: `${baseId}-EN`,
        });

        databaseBuilder.factory.buildCertificationFrameworksChallenge({
          challengeId: baseId,
          versionId,
          discriminant: 1.5,
          difficulty: 2.5,
        });

        await databaseBuilder.commit();

        // when
        await script.handle({ logger, options: { dryRun: false } });

        // then
        const insertedChallenge = await knex('certification-frameworks-challenges')
          .where({ challengeId: `${baseId}-EN`, versionId })
          .first();

        expect(insertedChallenge).to.exist;
        expect(insertedChallenge.discriminant).to.equal(1.5);
        expect(insertedChallenge.difficulty).to.equal(2.5);
      });

      it('should not duplicate challenges that have no corresponding -EN entry in LCMS', async function () {
        // given
        const { id: versionId } = databaseBuilder.factory.buildCertificationVersion({
          scope: 'CORE',
          expirationDate: null,
        });

        databaseBuilder.factory.learningContent.buildChallenge({
          id: 'challengeFr1',
        });

        databaseBuilder.factory.buildCertificationFrameworksChallenge({
          challengeId: 'challengeFr1',
          versionId,
        });

        await databaseBuilder.commit();

        // when
        await script.handle({ logger, options: { dryRun: false } });

        // then
        const insertedChallenge = await knex('certification-frameworks-challenges')
          .where({ challengeId: 'challengeFr1-EN' })
          .first();

        expect(insertedChallenge).to.not.exist;
      });

      it('should not duplicate challenges from an expired CORE version', async function () {
        // given
        const { id: expiredVersionId } = databaseBuilder.factory.buildCertificationVersion({
          scope: 'CORE',
          expirationDate: new Date('2025-01-01'),
        });

        const baseId = 'challengeEnExpired';

        databaseBuilder.factory.learningContent.buildChallenge({
          id: `${baseId}-EN`,
        });

        databaseBuilder.factory.buildCertificationFrameworksChallenge({
          challengeId: baseId,
          versionId: expiredVersionId,
        });

        await databaseBuilder.commit();

        // when
        await script.handle({ logger, options: { dryRun: false } });

        // then
        const insertedChallenge = await knex('certification-frameworks-challenges')
          .where({ challengeId: `${baseId}-EN` })
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

        const baseId = 'challengeEn1';

        databaseBuilder.factory.learningContent.buildChallenge({
          id: `${baseId}-EN`,
        });

        databaseBuilder.factory.buildCertificationFrameworksChallenge({
          challengeId: baseId,
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

    context('when an error occurs during insertion', function () {
      afterEach(function () {
        sinon.restore();
      });

      it('should rollback the transaction and rethrow the error', async function () {
        // given
        const { id: versionId } = databaseBuilder.factory.buildCertificationVersion({
          scope: 'CORE',
          expirationDate: null,
        });

        const baseId = 'challengeEnError';

        databaseBuilder.factory.learningContent.buildChallenge({
          id: `${baseId}-EN`,
        });

        databaseBuilder.factory.buildCertificationFrameworksChallenge({
          challengeId: baseId,
          versionId,
          discriminant: 1.5,
          difficulty: 2.5,
        });

        await databaseBuilder.commit();

        const dbError = new Error('DB insertion error');
        const fakeTrx = {
          batchInsert: sinon.stub().rejects(dbError),
          rollback: sinon.stub().resolves(),
        };
        sinon.stub(knex, 'transaction').resolves(fakeTrx);

        // when / then
        await expect(script.handle({ logger, options: { dryRun: false } })).to.be.rejectedWith('DB insertion error');
        expect(fakeTrx.rollback).to.have.been.calledOnce;
      });
    });
  });
});
