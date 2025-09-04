import { knex } from '../../../../db/knex-database-connection.js';
import { BatchUpdateCertificationFrameworksChallengesFromCsv } from '../../../../scripts/certification/batch-update-certification-frameworks-challenges-from-csv.js';
import { createTempFile, databaseBuilder, expect, sinon } from '../../../test-helper.js';

describe('Integration | Scripts | Certification | batch-update-certification-frameworks-challenges-from-csv', function () {
  let complementaryCertificationKey1, complementaryCertificationKey2;
  let challenge1, challenge2, challenge3;

  beforeEach(async function () {
    // Create test data
    complementaryCertificationKey1 = databaseBuilder.factory.buildComplementaryCertification({
      key: 'DROIT',
    }).key;
    complementaryCertificationKey2 = databaseBuilder.factory.buildComplementaryCertification({
      key: 'EDU_1ER_DEGRE',
    }).key;

    challenge1 = databaseBuilder.factory.learningContent.buildChallenge({ id: 'rec123ABC' });
    challenge2 = databaseBuilder.factory.learningContent.buildChallenge({ id: 'rec456DEF' });
    challenge3 = databaseBuilder.factory.learningContent.buildChallenge({ id: 'rec789GHI' });

    // Create existing certification-frameworks-challenges records
    databaseBuilder.factory.buildCertificationFrameworksChallenge({
      challengeId: challenge1.id,
      complementaryCertificationKey: complementaryCertificationKey1,
      discriminant: 1.0,
      difficulty: 0.5,
      calibrationId: 1,
    });

    databaseBuilder.factory.buildCertificationFrameworksChallenge({
      challengeId: challenge2.id,
      complementaryCertificationKey: complementaryCertificationKey1,
      discriminant: 0.8,
      difficulty: -0.3,
      calibrationId: 2,
    });

    databaseBuilder.factory.buildCertificationFrameworksChallenge({
      challengeId: challenge3.id,
      complementaryCertificationKey: complementaryCertificationKey2,
      discriminant: 1.2,
      difficulty: 1.1,
      calibrationId: 3,
    });

    await databaseBuilder.commit();
  });

  describe('#parse', function () {
    it('parses CSV input file with all required columns', async function () {
      // given
      const script = new BatchUpdateCertificationFrameworksChallengesFromCsv();
      const options = script.metaInfo.options;
      const file = 'certification-frameworks-challenges-update.csv';
      const csvData = [
        'challengeId,complementaryCertificationKey,alpha,delta,calibrationId',
        `${challenge1.id},${complementaryCertificationKey1},0.85,1.25,1001`,
        `${challenge2.id},${complementaryCertificationKey1},1.12,-0.75,1001`,
        `${challenge3.id},${complementaryCertificationKey2},0.95,0.50,1002`,
      ].join('\n');

      const csvFilePath = await createTempFile(file, csvData);

      // when
      const parsedData = await options.file.coerce(csvFilePath);

      // then
      expect(parsedData).to.deep.equal([
        {
          challengeId: challenge1.id,
          complementaryCertificationKey: complementaryCertificationKey1,
          alpha: 0.85,
          delta: 1.25,
          calibrationId: 1001,
        },
        {
          challengeId: challenge2.id,
          complementaryCertificationKey: complementaryCertificationKey1,
          alpha: 1.12,
          delta: -0.75,
          calibrationId: 1001,
        },
        {
          challengeId: challenge3.id,
          complementaryCertificationKey: complementaryCertificationKey2,
          alpha: 0.95,
          delta: 0.5,
          calibrationId: 1002,
        },
      ]);
    });

    it('should fail when required columns are missing', async function () {
      // given
      const script = new BatchUpdateCertificationFrameworksChallengesFromCsv();
      const options = script.metaInfo.options;
      const file = 'invalid-certification-frameworks-challenges.csv';
      const csvData = ['challengeId,alpha,delta', `${challenge1.id},0.85,1.25`].join('\\n');

      const csvFilePath = await createTempFile(file, csvData);

      // when/then
      await expect(options.file.coerce(csvFilePath)).to.be.rejected;
    });
  });

  describe('#handle', function () {
    it('should update certification-frameworks-challenges with new discriminant and difficulty values', async function () {
      // given
      const script = new BatchUpdateCertificationFrameworksChallengesFromCsv();
      const logger = { info: sinon.spy(), debug: sinon.spy(), error: sinon.spy(), warn: sinon.spy() };
      const file = [
        {
          challengeId: challenge1.id,
          complementaryCertificationKey: complementaryCertificationKey1,
          alpha: 0.85,
          delta: 1.25,
          calibrationId: 1001,
        },
        {
          challengeId: challenge2.id,
          complementaryCertificationKey: complementaryCertificationKey1,
          alpha: 1.12,
          delta: -0.75,
          calibrationId: 1001,
        },
      ];

      // when
      const result = await script.handle({ logger, options: { file, dryRun: false } });

      // then
      expect(result.processed).to.equal(2);
      expect(result.updated).to.equal(2);
      expect(result.found).to.equal(2);

      // Check that the values were actually updated in the database
      const updatedRecords = await knex('certification-frameworks-challenges')
        .whereIn('challengeId', [challenge1.id, challenge2.id])
        .where('complementaryCertificationKey', complementaryCertificationKey1)
        .select('challengeId', 'discriminant', 'difficulty', 'calibrationId');

      const record1 = updatedRecords.find((r) => r.challengeId === challenge1.id);
      const record2 = updatedRecords.find((r) => r.challengeId === challenge2.id);

      expect(record1.discriminant).to.equal(0.85);
      expect(record1.difficulty).to.equal(1.25);
      expect(record1.calibrationId).to.equal(1001);

      expect(record2.discriminant).to.equal(1.12);
      expect(record2.difficulty).to.equal(-0.75);
      expect(record2.calibrationId).to.equal(1001);
    });

    it('should handle null calibrationId values correctly', async function () {
      // given
      const script = new BatchUpdateCertificationFrameworksChallengesFromCsv();
      const logger = { info: sinon.spy(), debug: sinon.spy(), error: sinon.spy(), warn: sinon.spy() };
      const file = [
        {
          challengeId: challenge3.id,
          complementaryCertificationKey: complementaryCertificationKey2,
          alpha: 0.95,
          delta: 0.5,
          calibrationId: null,
        },
      ];

      // when
      await script.handle({ logger, options: { file, dryRun: false } });

      // then
      const updatedRecord = await knex('certification-frameworks-challenges')
        .where('challengeId', challenge3.id)
        .where('complementaryCertificationKey', complementaryCertificationKey2)
        .first();

      expect(updatedRecord.discriminant).to.equal(0.95);
      expect(updatedRecord.difficulty).to.equal(0.5);
      expect(updatedRecord.calibrationId).to.be.null;
    });

    it('should run in dry-run mode without making changes', async function () {
      // given
      const script = new BatchUpdateCertificationFrameworksChallengesFromCsv();
      const logger = { info: sinon.spy(), debug: sinon.spy(), error: sinon.spy(), warn: sinon.spy() };
      const file = [
        {
          challengeId: challenge1.id,
          complementaryCertificationKey: complementaryCertificationKey1,
          alpha: 0.85,
          delta: 1.25,
          calibrationId: 1001,
        },
      ];

      // Store original values
      const originalRecord = await knex('certification-frameworks-challenges')
        .where('challengeId', challenge1.id)
        .where('complementaryCertificationKey', complementaryCertificationKey1)
        .first();

      // when
      const result = await script.handle({ logger, options: { file, dryRun: true } });

      // then
      expect(result.processed).to.equal(1);
      expect(result.updated).to.equal(0);
      expect(result.found).to.equal(1);

      // Verify no changes were made
      const unchangedRecord = await knex('certification-frameworks-challenges')
        .where('challengeId', challenge1.id)
        .where('complementaryCertificationKey', complementaryCertificationKey1)
        .first();

      expect(unchangedRecord.discriminant).to.equal(originalRecord.discriminant);
      expect(unchangedRecord.difficulty).to.equal(originalRecord.difficulty);
      expect(unchangedRecord.calibrationId).to.equal(originalRecord.calibrationId);
    });

    it('should throw error when trying to update non-existent challenge combinations', async function () {
      // given
      const script = new BatchUpdateCertificationFrameworksChallengesFromCsv();
      const logger = { info: sinon.spy(), debug: sinon.spy(), error: sinon.spy(), warn: sinon.spy() };
      const file = [
        {
          challengeId: 'recNONEXISTENT',
          complementaryCertificationKey: complementaryCertificationKey1,
          alpha: 0.85,
          delta: 1.25,
          calibrationId: 1001,
        },
      ];

      // when/then
      await expect(script.handle({ logger, options: { file, dryRun: false } })).to.be.rejectedWith(
        'Some challenges are missing',
      );

      expect(logger.warn).to.have.been.calledWith(
        'Warning: 1 complementaryCertificationKey-challengeId combinations not found in database:',
      );
      expect(logger.warn).to.have.been.calledWith(`  - ${complementaryCertificationKey1} : recNONEXISTENT`);
    });

    it('should handle empty CSV file gracefully', async function () {
      // given
      const script = new BatchUpdateCertificationFrameworksChallengesFromCsv();
      const logger = { info: sinon.spy(), debug: sinon.spy(), error: sinon.spy(), warn: sinon.spy() };
      const file = [];

      // when
      const result = await script.handle({ logger, options: { file, dryRun: false } });

      // then
      expect(result.processed).to.equal(0);
      expect(result.updated).to.equal(0);
      expect(logger.info).to.have.been.calledWith('No records to process');
    });

    it('should update multiple records efficiently using batch operation', async function () {
      // given
      const script = new BatchUpdateCertificationFrameworksChallengesFromCsv();
      const logger = { info: sinon.spy(), debug: sinon.spy(), error: sinon.spy(), warn: sinon.spy() };
      const file = [
        {
          challengeId: challenge1.id,
          complementaryCertificationKey: complementaryCertificationKey1,
          alpha: 0.85,
          delta: 1.25,
          calibrationId: 1001,
        },
        {
          challengeId: challenge2.id,
          complementaryCertificationKey: complementaryCertificationKey1,
          alpha: 1.12,
          delta: -0.75,
          calibrationId: 1002,
        },
        {
          challengeId: challenge3.id,
          complementaryCertificationKey: complementaryCertificationKey2,
          alpha: 0.95,
          delta: 0.5,
          calibrationId: 1003,
        },
      ];

      // when
      const result = await script.handle({ logger, options: { file, dryRun: false } });

      // then
      expect(result.processed).to.equal(3);
      expect(result.updated).to.equal(3);
      expect(result.found).to.equal(3);

      // Verify all records were updated
      const allUpdatedRecords = await knex('certification-frameworks-challenges')
        .whereIn('challengeId', [challenge1.id, challenge2.id, challenge3.id])
        .select('challengeId', 'complementaryCertificationKey', 'discriminant', 'difficulty', 'calibrationId');

      expect(allUpdatedRecords).to.have.length(3);

      const record1 = allUpdatedRecords.find((r) => r.challengeId === challenge1.id);
      expect(record1.discriminant).to.equal(0.85);
      expect(record1.calibrationId).to.equal(1001);

      const record2 = allUpdatedRecords.find((r) => r.challengeId === challenge2.id);
      expect(record2.discriminant).to.equal(1.12);
      expect(record2.calibrationId).to.equal(1002);

      const record3 = allUpdatedRecords.find((r) => r.challengeId === challenge3.id);
      expect(record3.discriminant).to.equal(0.95);
      expect(record3.calibrationId).to.equal(1003);
    });
  });
});
