import { CreateBucketCommand, S3Client } from '@aws-sdk/client-s3';
import { expect } from 'chai';
import sinon from 'sinon';

import { knex } from '../../../db/knex-database-connection.js';
import { AnswersHistoryExportStorage } from '../../../scripts/prod/answers-history-export-storage.js';
import { createParquetArrayBuffer } from '../../../scripts/prod/get-answers-from-assessments.js';
import {
  findParquetRange,
  ReInsertDeletedAnswersFromAssessments,
} from '../../../scripts/prod/insert-answers-from-assessments.js';
import { S3ObjectStorageProvider } from '../../../src/shared/storage/infrastructure/providers/S3ObjectStorageProvider.js';
import { databaseBuilder } from '../../tooling/databases.js';

describe('ReInsertDeletedAnswersFromAssessments', function () {
  describe('handle', function () {
    describe('when running in dryRun mode', function () {
      it('logs the assessment count without inserting anything', async function () {
        const logger = { info: sinon.stub() };

        const script = new ReInsertDeletedAnswersFromAssessments();
        await script.handle({
          logger,
          options: { dryRun: true, assessmentIds: [1, 2, 3] },
        });

        expect(logger.info.calledOnce).to.be.true;
        expect(logger.info.firstCall.args[0]).to.include('3 assessments');
      });
    });

    describe('when not running in dryRun mode', function () {
      let s3Client;
      const S3_TEST_CONFIG = {
        accessKeyId: 'test',
        secretAccessKey: 'test',
        endpoint: 'http://localhost:9090',
        region: 'pix',
        bucket: 'pix-answers-history-export-test',
        forcePathStyle: true,
      };
      const savedEnv = {};

      beforeEach(async function () {
        for (const [key, value] of Object.entries({
          ANSWERS_HISTORY_EXPORT_STORAGE_ACCESS_KEY_ID: S3_TEST_CONFIG.accessKeyId,
          ANSWERS_HISTORY_EXPORT_STORAGE_SECRET_ACCESS_KEY: S3_TEST_CONFIG.secretAccessKey,
          ANSWERS_HISTORY_EXPORT_STORAGE_ENDPOINT: S3_TEST_CONFIG.endpoint,
          ANSWERS_HISTORY_EXPORT_STORAGE_REGION: S3_TEST_CONFIG.region,
          ANSWERS_HISTORY_EXPORT_STORAGE_BUCKET_NAME: S3_TEST_CONFIG.bucket,
        })) {
          savedEnv[key] = process.env[key];
          process.env[key] = value;
        }

        const rawS3 = new S3Client({
          credentials: { accessKeyId: S3_TEST_CONFIG.accessKeyId, secretAccessKey: S3_TEST_CONFIG.secretAccessKey },
          endpoint: S3_TEST_CONFIG.endpoint,
          region: S3_TEST_CONFIG.region,
          forcePathStyle: true,
        });
        try {
          await rawS3.send(new CreateBucketCommand({ Bucket: S3_TEST_CONFIG.bucket }));
        } catch {
          // bucket already exists
        }

        s3Client = S3ObjectStorageProvider.createClient(S3_TEST_CONFIG);
      });

      afterEach(async function () {
        const { Contents: files } = await s3Client.listFiles();
        for (const file of files ?? []) {
          await s3Client.deleteFile({ key: file.Key });
        }

        for (const [key, originalValue] of Object.entries(savedEnv)) {
          if (originalValue === undefined) {
            delete process.env[key];
          } else {
            process.env[key] = originalValue;
          }
        }
      });

      it('reads answers from a parquet file in S3, reinserts them in the database, then deletes the parquet file', async function () {
        const logger = { info: sinon.stub(), error: sinon.stub() };

        const assessment = databaseBuilder.factory.buildAssessment({
          updatedAt: new Date('2020-01-02'),
          state: 'completed',
          type: 'CAMPAIGN',
        });
        const answer1 = databaseBuilder.factory.buildAnswer({
          assessmentId: assessment.id,
          value: 'aaa',
          result: 'ok',
          challengeId: 'recABC123',
          createdAt: new Date('2020-01-01'),
          updatedAt: new Date('2020-01-02'),
          timeout: null,
          resultDetails: 'details for answer 1',
          isFocusedOut: false,
          timeSpent: 30,
        });
        const answer2 = databaseBuilder.factory.buildAnswer({
          assessmentId: assessment.id,
          value: 'bbb',
          result: 'ko',
          challengeId: 'recDEF456',
          createdAt: new Date('2020-01-03'),
          updatedAt: new Date('2020-01-04'),
          timeout: 10,
          resultDetails: 'details for answer 2',
          isFocusedOut: true,
          timeSpent: 60,
        });

        await databaseBuilder.commit();

        // Simulate what the export script (get-answers-from-assessments) produced:
        // create a parquet file from the existing answers and upload it to S3
        const rangeStart = Math.floor((assessment.id - 1) / 1000) * 1000 + 1;
        const { partitionFile, fileContent } = createParquetArrayBuffer(rangeStart, [answer1, answer2], 1000);

        const answerHistoryStorage = new AnswersHistoryExportStorage();
        await answerHistoryStorage.sendFile({ filename: partitionFile, fileContent });

        // Simulate the deletion step from the export script
        await knex('answers').delete().whereIn('id', [answer1.id, answer2.id]);

        const script = new ReInsertDeletedAnswersFromAssessments();
        await script.handle({
          logger,
          options: { dryRun: false, assessmentIds: [assessment.id] },
        });

        const reinsertedAnswers = await knex('answers').where({ assessmentId: assessment.id });
        expect(reinsertedAnswers).to.have.length(2);

        const challengeIds = reinsertedAnswers.map(({ challengeId }) => challengeId);
        expect(challengeIds).to.include.members(['recABC123', 'recDEF456']);

        const { Contents: remainingFiles } = await s3Client.listFiles();
        expect(remainingFiles ?? []).to.be.empty;

        expect(logger.info.calledWith('Successfully reinserted 2 answers in database.')).to.be.true;
        expect(logger.info.calledWith(sinon.match(/^Successfully deleted .+ file\./))).to.be.true;
      });

      it('processes multiple parquet files from S3 and reinserts all answers', async function () {
        const logger = { info: sinon.stub(), error: sinon.stub() };

        // Two assessments — their IDs may fall in the same or different 1000-wide ranges
        // depending on DB state, but both parquet files must be downloaded and processed
        const assessment1 = databaseBuilder.factory.buildAssessment({
          updatedAt: new Date('2020-01-02'),
          state: 'completed',
          type: 'CAMPAIGN',
        });
        const answerForAssessment1 = databaseBuilder.factory.buildAnswer({
          assessmentId: assessment1.id,
          value: 'first-answer',
          result: 'ok',
          challengeId: 'recFIRST1',
          createdAt: new Date('2020-01-01'),
          updatedAt: new Date('2020-01-02'),
          timeout: null,
          resultDetails: null,
          isFocusedOut: false,
          timeSpent: 10,
        });

        const assessment2 = databaseBuilder.factory.buildAssessment({
          updatedAt: new Date('2020-01-02'),
          state: 'completed',
          type: 'CAMPAIGN',
        });
        const answerForAssessment2 = databaseBuilder.factory.buildAnswer({
          assessmentId: assessment2.id,
          value: 'second-answer',
          result: 'ko',
          challengeId: 'recSECOND2',
          createdAt: new Date('2020-01-03'),
          updatedAt: new Date('2020-01-04'),
          timeout: null,
          resultDetails: null,
          isFocusedOut: false,
          timeSpent: 20,
        });

        await databaseBuilder.commit();

        const answerHistoryStorage = new AnswersHistoryExportStorage();

        const rangeStart1 = Math.floor((assessment1.id - 1) / 1000) * 1000 + 1;
        const { partitionFile: partitionFile1, fileContent: fileContent1 } = createParquetArrayBuffer(
          rangeStart1,
          [answerForAssessment1],
          1000,
        );
        await answerHistoryStorage.sendFile({ filename: partitionFile1, fileContent: fileContent1 });

        const rangeStart2 = Math.floor((assessment2.id - 1) / 1000) * 1000 + 1;
        const { partitionFile: partitionFile2, fileContent: fileContent2 } = createParquetArrayBuffer(
          rangeStart2,
          [answerForAssessment2],
          1000,
        );
        await answerHistoryStorage.sendFile({ filename: partitionFile2, fileContent: fileContent2 });

        await knex('answers').delete().whereIn('id', [answerForAssessment1.id, answerForAssessment2.id]);

        const script = new ReInsertDeletedAnswersFromAssessments();
        await script.handle({
          logger,
          options: { dryRun: false, assessmentIds: [assessment1.id, assessment2.id] },
        });

        const reinsertedForAssessment1 = await knex('answers').where({ assessmentId: assessment1.id });
        const reinsertedForAssessment2 = await knex('answers').where({ assessmentId: assessment2.id });

        expect(reinsertedForAssessment1).to.have.length(1);
        expect(reinsertedForAssessment2).to.have.length(1);

        const { Contents: remainingFiles } = await s3Client.listFiles();
        expect(remainingFiles ?? []).to.be.empty;
      });
    });
  });

  describe('findParquetRange', function () {
    it('returns "1_1000" for assessmentId 1', function () {
      expect(findParquetRange(1)).to.equal('1_1000');
    });

    it('returns "1_1000" for assessmentId 1000', function () {
      expect(findParquetRange(1000)).to.equal('1_1000');
    });

    it('returns "1001_2000" for assessmentId 1001', function () {
      expect(findParquetRange(1001)).to.equal('1001_2000');
    });

    it('returns "1001_2000" for assessmentId 2000', function () {
      expect(findParquetRange(2000)).to.equal('1001_2000');
    });
  });
});
