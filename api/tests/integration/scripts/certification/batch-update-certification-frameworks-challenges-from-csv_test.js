import { knex } from '../../../../db/knex-database-connection.js';
import { BatchUpdateCertificationFrameworksChallengesFromCsv } from '../../../../scripts/certification/batch-update-certification-frameworks-challenges-from-csv.js';
import { createTempFile, databaseBuilder, expect, sinon } from '../../../test-helper.js';

describe('Integration | Scripts | Certification | batch-update-certification-frameworks-challenges-from-csv', function () {
  let complementaryCertificationKey1, complementaryCertificationKey2;
  let challenge1, challenge2, challenge3, challenge4;

  beforeEach(async function () {
    complementaryCertificationKey1 = databaseBuilder.factory.buildComplementaryCertification({
      key: 'DROIT',
    }).key;
    complementaryCertificationKey2 = databaseBuilder.factory.buildComplementaryCertification({
      key: 'EDU_1ER_DEGRE',
    }).key;

    challenge1 = databaseBuilder.factory.learningContent.buildChallenge({ id: 'rec123ABC' });
    challenge2 = databaseBuilder.factory.learningContent.buildChallenge({ id: 'rec456DEF' });
    challenge3 = databaseBuilder.factory.learningContent.buildChallenge({ id: 'rec789GHI' });
    challenge4 = databaseBuilder.factory.learningContent.buildChallenge({ id: 'rec012JKL' });

    databaseBuilder.factory.buildCertificationFrameworksChallenge({
      challengeId: challenge1.id,
      complementaryCertificationKey: complementaryCertificationKey1,
      discriminant: null,
      difficulty: null,
      calibrationId: null,
      createdAt: new Date('2021-01-01'),
    });

    databaseBuilder.factory.buildCertificationFrameworksChallenge({
      challengeId: challenge2.id,
      complementaryCertificationKey: complementaryCertificationKey1,
      discriminant: null,
      difficulty: null,
      createdAt: new Date('2021-01-01'),
    });

    databaseBuilder.factory.buildCertificationFrameworksChallenge({
      challengeId: challenge3.id,
      complementaryCertificationKey: complementaryCertificationKey1,
      discriminant: 0.5,
      difficulty: 1.89,
      calibrationId: 1000,
      createdAt: new Date('2020-01-01'),
    });

    databaseBuilder.factory.buildCertificationFrameworksChallenge({
      challengeId: challenge4.id,
      complementaryCertificationKey: complementaryCertificationKey2,
      discriminant: 1.25,
      difficulty: 3.91,
      calibrationId: 1000,
      createdAt: new Date('2021-01-01'),
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
        `${challenge3.id},${complementaryCertificationKey1},0.95,0.50,1002`,
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
          complementaryCertificationKey: complementaryCertificationKey1,
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
    it('handles empty CSV file', async function () {
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

    it('throws an error if there are multiple complementary certifications keys', async function () {
      // given
      const script = new BatchUpdateCertificationFrameworksChallengesFromCsv();
      const logger = { info: sinon.spy(), debug: sinon.spy(), error: sinon.spy(), warn: sinon.spy() };
      const file = [
        {
          challengeId: 'recSOMETHING_1',
          complementaryCertificationKey: complementaryCertificationKey1,
          alpha: 0.85,
          delta: 1.25,
          calibrationId: 1001,
        },
        {
          challengeId: 'recSOMETHING_2',
          complementaryCertificationKey: complementaryCertificationKey2,
          alpha: 0.58,
          delta: 2.15,
          calibrationId: 1001,
        },
      ];

      // when // then
      await expect(script.handle({ logger, options: { file, dryRun: false } })).to.be.rejectedWith(
        'The CSV file must contain only one complementary certification calibration',
      );
    });

    it('throws an error if there are no found challenges in the database', async function () {
      // given
      const script = new BatchUpdateCertificationFrameworksChallengesFromCsv();
      const logger = { info: sinon.spy(), debug: sinon.spy(), error: sinon.spy(), warn: sinon.spy() };
      const file = [
        {
          challengeId: 'recSOMETHING_1',
          complementaryCertificationKey: complementaryCertificationKey2,
          alpha: 0.85,
          delta: 1.25,
          calibrationId: 1001,
        },
      ];

      // when // then
      await expect(script.handle({ logger, options: { file, dryRun: false } })).to.be.rejectedWith(
        `No challenges to calibrate were found for the complementary certification key: ${complementaryCertificationKey2}`,
      );
    });

    it('runs in dry-run mode without making changes', async function () {
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
          alpha: 1.58,
          delta: 2.15,
          calibrationId: 1001,
        },
      ];

      // when
      const result = await script.handle({ logger, options: { file, dryRun: true } });

      // then
      expect(result.processed).to.equal(2);
      expect(result.updated).to.equal(0);
      expect(result.found).to.equal(2);

      const unchangedRecords = await knex('certification-frameworks-challenges')
        .where('complementaryCertificationKey', complementaryCertificationKey1)
        .andWhere('difficulty', null)
        .andWhere('discriminant', null)
        .andWhere('calibrationId', null);

      expect(unchangedRecords).to.have.length(2);
    });

    it('throws an error when trying to update challenges not found in the database', async function () {
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

      // when
      await expect(script.handle({ logger, options: { file, dryRun: false } })).to.be.rejectedWith(
        'Some challenges are missing',
      );

      // then
      expect(logger.warn).to.have.been.calledWith('Warning: 1 challenge(s) not found in database');
      expect(logger.warn).to.have.been.calledWith(`recNONEXISTENT`);
    });

    it('updates the latest version of certification-frameworks-challenges with new discriminant, difficulty and calibrationId values', async function () {
      // given
      const script = new BatchUpdateCertificationFrameworksChallengesFromCsv();
      const logger = { info: sinon.spy(), debug: sinon.spy(), error: sinon.spy(), warn: sinon.spy() };
      const challenge1Update = {
        challengeId: challenge1.id,
        complementaryCertificationKey: complementaryCertificationKey1,
        alpha: 0.85,
        delta: 1.25,
        calibrationId: 1001,
      };
      const challenge2Update = {
        challengeId: challenge2.id,
        complementaryCertificationKey: complementaryCertificationKey1,
        alpha: 1.12,
        delta: -0.75,
        calibrationId: 1001,
      };
      const file = [challenge1Update, challenge2Update];

      // when
      const result = await script.handle({ logger, options: { file, dryRun: false } });

      // then
      expect(result.processed).to.equal(2);
      expect(result.updated).to.equal(2);
      expect(result.found).to.equal(2);

      const updatedRecords = await knex('certification-frameworks-challenges')
        .whereIn('challengeId', [challenge1.id, challenge2.id])
        .where('complementaryCertificationKey', complementaryCertificationKey1)
        .select('challengeId', 'discriminant', 'difficulty', 'calibrationId')
        .orderBy('challengeId');

      expect(updatedRecords[0].discriminant).to.equal(challenge1Update.alpha);
      expect(updatedRecords[0].difficulty).to.equal(challenge1Update.delta);
      expect(updatedRecords[0].calibrationId).to.equal(challenge1Update.calibrationId);

      expect(updatedRecords[1].discriminant).to.equal(challenge2Update.alpha);
      expect(updatedRecords[1].difficulty).to.equal(challenge2Update.delta);
      expect(updatedRecords[1].calibrationId).to.equal(challenge2Update.calibrationId);
    });
  });
});
