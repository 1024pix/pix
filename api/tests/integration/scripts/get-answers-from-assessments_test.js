import { CreateBucketCommand, S3Client } from '@aws-sdk/client-s3';
import { expect } from 'chai';
import sinon from 'sinon';

import { knex } from '../../../db/knex-database-connection.js';
import {
  createParquetArrayBuffer,
  deleteBatchAnswers,
  GetAnswersFromAssessments,
} from '../../../scripts/prod/get-answers-from-assessments.js';
import { S3ObjectStorageProvider } from '../../../src/shared/storage/infrastructure/providers/S3ObjectStorageProvider.js';
import { databaseBuilder } from '../../tooling/databases.js';
import { catchErrSync } from '../../tooling/test-utils/error.js';

describe('GetAnswersFromAssessments', function () {
  describe('handle', function () {
    describe('when running in dryRun mode', function () {
      it('does not delete selected answers', async function () {
        const logger = {
          info: sinon.stub(),
        };
        const todayDate = new Date();
        const oneYearAgo = new Date(todayDate.getFullYear() - 1, todayDate.getMonth(), todayDate.getDate());

        const validAssessment = databaseBuilder.factory.buildAssessment({
          updatedAt: oneYearAgo,
          state: 'completed',
          type: 'CAMPAIGN',
        });
        databaseBuilder.factory.buildAnswer({ assessmentId: validAssessment.id });

        const olderAssessment = databaseBuilder.factory.buildAssessment({
          updatedAt: new Date('2020-01-01'),
          state: 'completed',
          type: 'CAMPAIGN',
        });
        databaseBuilder.factory.buildAnswer({
          assessmentId: olderAssessment.id,
        });

        const certificationAssessment = databaseBuilder.factory.buildAssessment({
          updatedAt: oneYearAgo,
          state: 'completed',
          type: 'CERTIFICATION',
        });
        databaseBuilder.factory.buildAnswer({
          assessmentId: certificationAssessment.id,
        });

        await databaseBuilder.commit();

        const script = new GetAnswersFromAssessments();
        await script.handle({
          logger,
          options: { dryRun: true },
        });

        const remainingAnswers = await knex('answers');
        expect(remainingAnswers.length).to.equal(3);
        expect(logger.info.calledOnce).true;
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

      it('deletes answers from a list of assessments and uploads a parquet file to S3', async function () {
        const logger = {
          info: sinon.stub(),
          error: sinon.stub(),
        };
        const todayDate = new Date();
        const oneYearAgo = new Date(todayDate.getFullYear() - 1, todayDate.getMonth(), todayDate.getDate());

        const assessmentWithAnswerToDelete = databaseBuilder.factory.buildAssessment({
          updatedAt: new Date('2020-01-02'),
          state: 'completed',
          type: 'CAMPAIGN',
        });
        databaseBuilder.factory.buildAnswer({
          assessmentId: assessmentWithAnswerToDelete.id,
        });

        const olderCampaignAssessment = databaseBuilder.factory.buildAssessment({
          updatedAt: new Date('2020-01-01'),
          state: 'completed',
          type: 'CAMPAIGN',
        });
        databaseBuilder.factory.buildAnswer({
          assessmentId: olderCampaignAssessment.id,
        });

        const demoAssessmentWithAnswerToDelete = databaseBuilder.factory.buildAssessment({
          updatedAt: new Date('2020-01-02'),
          state: 'completed',
          type: 'DEMO',
        });
        databaseBuilder.factory.buildAnswer({
          assessmentId: demoAssessmentWithAnswerToDelete.id,
        });

        const olderDemoAssessment = databaseBuilder.factory.buildAssessment({
          updatedAt: new Date('2020-01-01'),
          state: 'completed',
          type: 'DEMO',
        });
        databaseBuilder.factory.buildAnswer({
          assessmentId: olderDemoAssessment.id,
        });

        const evaluationAssessmentWithAnswerToDelete = databaseBuilder.factory.buildAssessment({
          updatedAt: new Date('2020-01-02'),
          state: 'completed',
          type: 'COMPETENCE_EVALUATION',
        });
        databaseBuilder.factory.buildAnswer({
          assessmentId: evaluationAssessmentWithAnswerToDelete.id,
        });

        const olderEvaluationAssessment = databaseBuilder.factory.buildAssessment({
          updatedAt: new Date('2020-01-01'),
          state: 'completed',
          type: 'DEMO',
        });
        databaseBuilder.factory.buildAnswer({
          assessmentId: olderEvaluationAssessment.id,
        });

        const placementAssessmentWithAnswerToDelete = databaseBuilder.factory.buildAssessment({
          updatedAt: new Date('2020-01-02'),
          state: 'completed',
          type: 'PLACEMENT',
        });
        databaseBuilder.factory.buildAnswer({
          assessmentId: placementAssessmentWithAnswerToDelete.id,
        });

        const olderPlacementAssessment = databaseBuilder.factory.buildAssessment({
          updatedAt: new Date('2020-01-01'),
          state: 'completed',
          type: 'PLACEMENT',
        });
        databaseBuilder.factory.buildAnswer({
          assessmentId: olderPlacementAssessment.id,
        });

        const previewAssessmentWithAnswerToDelete = databaseBuilder.factory.buildAssessment({
          updatedAt: new Date('2020-01-02'),
          state: 'completed',
          type: 'PREVIEW',
        });
        databaseBuilder.factory.buildAnswer({
          assessmentId: previewAssessmentWithAnswerToDelete.id,
        });

        const olderPreviewAssessment = databaseBuilder.factory.buildAssessment({
          updatedAt: new Date('2020-01-01'),
          state: 'completed',
          type: 'PREVIEW',
        });
        databaseBuilder.factory.buildAnswer({
          assessmentId: olderPreviewAssessment.id,
        });

        await databaseBuilder.commit();

        const script = new GetAnswersFromAssessments();
        await script.handle({
          logger,
          options: { dryRun: false },
        });

        const remainingAnswers = await knex('answers');
        expect(remainingAnswers.length).to.equal(5);

        const { Contents: uploadedFiles } = await s3Client.listFiles();
        // We expect 2 different files as assessmentIds created by the databaseBuilder
        // overlap the ASSESSMENT_ID_RANGE_SIZE given in the production code file
        expect(uploadedFiles).to.have.length(2);
        expect(uploadedFiles[0].Key).to.match(/^answers\//);
      });
    });
  });

  describe('createParquetArrayBuffer', function () {
    it('creates a array buffer for parquet file', async function () {
      const assessmentId = databaseBuilder.factory.buildAssessment().id;
      const firstAnswer = databaseBuilder.factory.buildAnswer({
        assessmentId,
        value: 'value for first answer',
        result: 'result for first answer',
        challengeId: 'rec123ABC',
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2020-01-02'),
        timeout: null,
        resultDetails: 'result details for first answer.',
        isFocusedOut: false,
        timeSpent: 30,
      });

      const secondAnswer = databaseBuilder.factory.buildAnswer({
        assessmentId,
        value: 'value for second answer',
        result: 'result for second answer',
        challengeId: 'rec123DEF',
        createdAt: new Date('2020-01-03'),
        updatedAt: new Date('2020-01-04'),
        timeout: 10,
        resultDetails: 'result details for second answer.',
        isFocusedOut: true,
        timeSpent: 50,
      });

      const answersToBeDeleted = [firstAnswer, secondAnswer];
      const rangeStart = 0;
      const assessmentRangeSize = 1000;

      await databaseBuilder.commit();

      const { partitionFile, fileContent } = createParquetArrayBuffer(
        rangeStart,
        answersToBeDeleted,
        assessmentRangeSize,
      );

      expect(partitionFile)
        .to.be.a('string')
        .and.to.include(`answers/0_${assessmentRangeSize - 1}/`);

      const buffer = Buffer.from(fileContent);
      const expectedBufferLength = 1642;
      expect(buffer).to.have.length(expectedBufferLength);

      // Presence of both Parquet Magic Bytes indicates that the resulting parquet file is both complete and not truncated
      const parquetMagicBytes = 'PAR1';
      expect(buffer.slice(0, 4).toString()).to.equal(parquetMagicBytes);
      expect(buffer.slice(-4).toString()).to.equal(parquetMagicBytes);
    });

    it('fails to create an  array buffer for parquet file', async function () {
      const logger = {
        error: sinon.stub(),
      };

      const assessmentId = databaseBuilder.factory.buildAssessment().id;
      const firstAnswer = databaseBuilder.factory.buildAnswer({
        assessmentId,
        value: 'value for first answer',
        result: 'result for first answer',
        challengeId: 'rec123ABC',
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2020-01-02'),
        timeout: null,
        resultDetails: 'result details for first answer.',
        isFocusedOut: false,
        timeSpent: 30,
      });

      const secondAnswer = databaseBuilder.factory.buildAnswer({
        assessmentId,
        value: 'value for second answer',
        result: 'result for second answer',
        challengeId: 'rec123DEF',
        createdAt: 'toDay',
        updatedAt: new Date('2020-01-04'),
        timeout: 10,
        resultDetails: 'result details for second answer.',
        isFocusedOut: true,
        timeSpent: 50,
      });

      const thirdAnswer = databaseBuilder.factory.buildAnswer({
        assessmentId,
        value: 'value for third answer',
        result: 'result for third answer',
        challengeId: 'rec123DEF',
        createdAt: new Date('2020-01-03'),
        updatedAt: new Date('2020-01-04'),
        timeout: 10,
        resultDetails: 'result details for third answer.',
        isFocusedOut: true,
        timeSpent: 50,
      });

      secondAnswer.id = 'aString';
      const answersToBeDeleted = [firstAnswer, secondAnswer, thirdAnswer];
      const rangeStart = 0;
      const assessmentRangeSize = 1000;

      const error = catchErrSync(createParquetArrayBuffer)(rangeStart, answersToBeDeleted, assessmentRangeSize, logger);
      expect(error).to.deep.equal(Error('An error occurred while creating the parquet from batched answers'));
    });
  });

  describe('deleteBatchAnswers', function () {
    it('deletes a batch of answers', async function () {
      // given
      const assessmentId = databaseBuilder.factory.buildAssessment().id;
      const firstAnswer = databaseBuilder.factory.buildAnswer({
        assessmentId,
        value: 'value for first answer',
        result: 'result for first answer',
        challengeId: 'rec123ABC',
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2020-01-02'),
        timeout: null,
        resultDetails: 'result details for first answer.',
        isFocusedOut: false,
        timeSpent: 30,
      });

      const secondAnswer = databaseBuilder.factory.buildAnswer({
        assessmentId,
        value: 'value for second answer',
        result: 'result for second answer',
        challengeId: 'rec123DEF',
        createdAt: new Date('2020-01-03'),
        updatedAt: new Date('2020-01-04'),
        timeout: 10,
        resultDetails: 'result details for second answer.',
        isFocusedOut: true,
        timeSpent: 50,
      });

      const answersToBeDeleted = [firstAnswer, secondAnswer];

      await databaseBuilder.commit();

      // when
      await deleteBatchAnswers(answersToBeDeleted);

      // then
      const remainingAnswers = await knex('answers');
      expect(remainingAnswers).to.be.empty;
    });

    describe('when an error occurs while deleting', function () {
      describe('when a answer is corrupted', function () {
        it('does not delete any answer', async function () {
          // given
          const assessmentId = databaseBuilder.factory.buildAssessment().id;
          const firstAnswer = databaseBuilder.factory.buildAnswer({
            assessmentId,
            value: 'value for first answer',
            result: 'result for first answer',
            challengeId: 'rec123ABC',
            createdAt: new Date('2020-01-01'),
            updatedAt: new Date('2020-01-02'),
            timeout: null,
            resultDetails: 'result details for first answer.',
            isFocusedOut: false,
            timeSpent: 30,
          });

          const secondAnswer = databaseBuilder.factory.buildAnswer({
            assessmentId,
            value: 'value for second answer',
            result: 'result for second answer',
            challengeId: 'rec123DEF',
            createdAt: new Date('2020-01-03'),
            updatedAt: new Date('2020-01-04'),
            timeout: 10,
            resultDetails: 'result details for second answer.',
            isFocusedOut: true,
            timeSpent: 50,
          });

          const thirdAnswer = databaseBuilder.factory.buildAnswer({
            assessmentId,
            value: 'value for third answer',
            result: 'result for third answer',
            challengeId: 'rec123DEF',
            createdAt: new Date('2020-01-03'),
            updatedAt: new Date('2020-01-04'),
            timeout: 10,
            resultDetails: 'result details for third answer.',
            isFocusedOut: true,
            timeSpent: 50,
          });

          await databaseBuilder.commit();

          secondAnswer.id = 'aString';
          const answersToBeDeleted = [firstAnswer, secondAnswer, thirdAnswer];

          // when
          await expect(deleteBatchAnswers(answersToBeDeleted)).to.be.rejectedWith(Error);

          // then
          const remainingAnswers = await knex('answers');
          expect(remainingAnswers).to.have.length(3);
        });
      });
    });
  });
});
