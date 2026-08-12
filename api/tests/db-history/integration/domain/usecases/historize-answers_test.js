import { CreateBucketCommand, S3Client } from '@aws-sdk/client-s3';
import sinon from 'sinon';

import { knex } from '../../../../../db/knex-database-connection.js';
import {
  createParquetArrayBuffer,
  deleteBatchAnswers,
  getBatchesFromRange,
  historizeAnswers,
} from '../../../../../src/db-history/domain/usecases/historize-answers.js';
import { usecases } from '../../../../../src/db-history/domain/usecases/index.js';
import { AnswersHistoryRepository } from '../../../../../src/db-history/infrastructure/repositories/answers-history-repository.js';
import * as answersRepository from '../../../../../src/db-history/infrastructure/repositories/answers-repository.js';
import { config } from '../../../../../src/shared/config.js';
import { S3ObjectStorageProvider } from '../../../../../src/shared/storage/infrastructure/providers/S3ObjectStorageProvider.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { catchErr, catchErrSync } from '../../../../tooling/test-utils/error.js';

describe('Integration | History-db | Domain | Use-case | historize-answers', function () {
  let s3Client;

  beforeEach(async function () {
    const storageClient = config.answersHistoryExport.storage.client;
    const rawS3 = new S3Client({
      credentials: {
        accessKeyId: storageClient.accessKeyId,
        secretAccessKey: storageClient.secretAccessKey,
      },
      endpoint: storageClient.endpoint,
      region: storageClient.region,
      forcePathStyle: true,
    });
    try {
      await rawS3.send(new CreateBucketCommand({ Bucket: storageClient.bucket }));
    } catch {
      // bucket already exists
    }

    s3Client = S3ObjectStorageProvider.createClient(storageClient);

    const { Contents: files } = await s3Client.listFiles();
    for (const file of files ?? []) {
      await s3Client.deleteFile({ key: file.Key });
    }
  });

  it('deletes answers from a list of assessments and uploads a parquet file to S3', async function () {
    const logger = {
      info: sinon.stub(),
      error: sinon.stub(),
    };
    const targetDate = new Date('2020-01-02');

    const assessmentWithAnswerToDelete = databaseBuilder.factory.buildAssessment({
      id: 50001,
      updatedAt: new Date('2020-01-02'),
      state: 'completed',
      type: 'CAMPAIGN',
    });
    // each assessment carries a single answer, well below the configured answer batch size:
    // the expected file count below therefore depends on the assessment ranges only
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
      id: 50002,
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
      id: 50003,
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
      id: 51001,
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
      id: 51002,
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
    await usecases.historizeAnswers({ targetDate, logger });

    const remainingAnswers = await knex('answers');
    expect(remainingAnswers.length).to.equal(5);

    const { Contents: uploadedFiles } = await s3Client.listFiles();
    // IDs 50001-50003 → range [50001, 51000], IDs 51001-51002 → range [51001, 52000] with range=1000
    expect(uploadedFiles).to.have.length(2);
    expect(uploadedFiles[0].Key).to.match(/^answers\//);
  });

  describe('batching configuration', function () {
    // Guards the wiring between config.js and the use case: a mismatched property name or a
    // missing env var used to yield undefined/NaN, which silently collapsed every answer into
    // a single batch — which is exactly the OOM the batching is meant to prevent.
    it('exposes an answer batch size the use case can batch on', function () {
      const answerBatchSize = config.answersHistoryExport.storage.answerBatchSize;

      expect(Number.isInteger(answerBatchSize), `answerBatchSize must be an integer, got ${answerBatchSize}`).to.be
        .true;
      expect(answerBatchSize).to.be.above(0);
    });

    it('exposes an assessment id range the use case can batch on', function () {
      const assessmentIdRange = config.answersHistoryExport.storage.assessmentIdRange;

      expect(Number.isInteger(assessmentIdRange), `assessmentIdRange must be an integer, got ${assessmentIdRange}`).to
        .be.true;
      expect(assessmentIdRange).to.be.above(0);
    });

    it('throws rather than processing everything at once when the answer batch size is missing', async function () {
      sinon.stub(config.answersHistoryExport.storage, 'answerBatchSize').value(NaN);

      const error = await catchErr(usecases.historizeAnswers)({ targetDate: new Date('2020-01-02') });

      expect(error.message).to.equal(
        'Configuration is invalid: ANSWERS_HISTORY_ANSWER_BATCH_SIZE must be a positive integer, but was: NaN',
      );
    });

    it('throws rather than processing everything at once when the assessment id range is missing', async function () {
      sinon.stub(config.answersHistoryExport.storage, 'assessmentIdRange').value(NaN);

      const error = await catchErr(usecases.historizeAnswers)({ targetDate: new Date('2020-01-02') });

      expect(error.message).to.equal(
        'Configuration is invalid: ANSWERS_HISTORY_ASSESSMENT_ID_RANGE must be a positive integer, but was: NaN',
      );
    });
  });

  it('splits the answers of a single assessment range into one file per answer batch', async function () {
    const logger = {
      info: sinon.stub(),
      error: sinon.stub(),
    };
    const targetDate = new Date('2020-01-02');
    const { assessmentIdRange } = config.answersHistoryExport.storage;
    // forced locally so the test stays fast: the production batch size would need thousands of rows
    sinon.stub(config.answersHistoryExport.storage, 'answerBatchSize').value(2);

    // both assessments fall in the same assessment range, hence the same parquet partition
    const firstAssessmentId = assessmentIdRange * 50 + 1;
    const secondAssessmentId = firstAssessmentId + 1;
    for (const id of [firstAssessmentId, secondAssessmentId]) {
      databaseBuilder.factory.buildAssessment({
        id,
        updatedAt: targetDate,
        state: 'completed',
        type: 'CAMPAIGN',
      });
    }

    // 4 answers with a batch size of 2 means two batches, hence two files in that single partition,
    // whatever the answer ids happen to be
    databaseBuilder.factory.buildAnswer({ assessmentId: firstAssessmentId });
    databaseBuilder.factory.buildAnswer({ assessmentId: firstAssessmentId });
    databaseBuilder.factory.buildAnswer({ assessmentId: secondAssessmentId });
    databaseBuilder.factory.buildAnswer({ assessmentId: secondAssessmentId });

    await databaseBuilder.commit();
    await usecases.historizeAnswers({ targetDate, logger });

    const remainingAnswers = await knex('answers');
    expect(remainingAnswers).to.have.length(0);

    const { Contents: uploadedFiles } = await s3Client.listFiles();
    expect(uploadedFiles).to.have.length(2);
    const assessmentRangeEnd = firstAssessmentId + assessmentIdRange - 1;
    for (const file of uploadedFiles) {
      expect(file.Key).to.match(new RegExp(`^answers/${firstAssessmentId}_${assessmentRangeEnd}/`));
    }
  });

  describe('when target date is more recent than one year ago', function () {
    it('throws an error', async function () {
      //given
      const targetDate = '2026-01-03';

      //when
      const error = await catchErr(usecases.historizeAnswers)({ targetDate });

      //then
      expect(error).to.deepEqualInstance(new Error(`Target date: ${targetDate} must be at least one year ago.`));
    });
  });

  describe('when the answers cannot be deleted from the database', function () {
    it('rolls the uploaded file back and reports the underlying cause', async function () {
      // given
      const logger = {
        info: sinon.stub(),
        error: sinon.stub(),
      };
      const targetDate = new Date('2020-01-02');
      const assessment = databaseBuilder.factory.buildAssessment({
        updatedAt: targetDate,
        state: 'completed',
        type: 'CAMPAIGN',
      });
      databaseBuilder.factory.buildAnswer({ assessmentId: assessment.id });
      await databaseBuilder.commit();

      const databaseError = new Error('connection terminated unexpectedly');
      const failingAnswersRepository = {
        ...answersRepository,
        deleteAnswersByIds: sinon.stub().rejects(databaseError),
      };

      // when
      const error = await catchErr(historizeAnswers)({
        answersRepository: failingAnswersRepository,
        targetDate,
        logger,
      });

      // then
      expect(error.message).to.equal('An error occurred during the historization process');
      expect(error.cause.message).to.equal('An error occurred during the answers deletion in DB');
      expect(error.cause.cause).to.equal(databaseError);

      const { Contents: uploadedFiles } = await s3Client.listFiles();
      expect(uploadedFiles ?? []).to.have.length(0);

      // the cause is what makes the failure diagnosable from the logs alone
      expect(logger.error.lastCall.args[0]).to.include('An error occurred during the answers deletion in DB');
    });
  });

  describe('when the rollback of the uploaded file fails', function () {
    it('reports the deletion error instead of the historization one', async function () {
      // given
      const logger = {
        info: sinon.stub(),
        error: sinon.stub(),
      };
      const targetDate = new Date('2020-01-02');
      const assessment = databaseBuilder.factory.buildAssessment({
        updatedAt: targetDate,
        state: 'completed',
        type: 'CAMPAIGN',
      });
      databaseBuilder.factory.buildAnswer({ assessmentId: assessment.id });
      await databaseBuilder.commit();

      const deletionError = new Error('Access Denied');
      sinon.stub(AnswersHistoryRepository, 'createClient').returns({
        sendFile: sinon.stub().resolves(),
        deleteFile: sinon.stub().rejects(deletionError),
      });
      const failingAnswersRepository = {
        ...answersRepository,
        deleteAnswersByIds: sinon.stub().rejects(new Error('connection terminated unexpectedly')),
      };

      // when
      const error = await catchErr(historizeAnswers)({
        answersRepository: failingAnswersRepository,
        targetDate,
        logger,
      });

      // then
      expect(error.message).to.equal('An error occurred during the deletion process');
      expect(error.cause).to.equal(deletionError);
    });
  });

  describe('when an answer is corrupted', function () {
    it('does not delete any answer', async function () {
      // given
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
      await expect(deleteBatchAnswers(answersRepository, answersToBeDeleted, logger)).to.be.rejectedWith(Error);

      // then
      const remainingAnswers = await knex('answers');
      expect(remainingAnswers).to.have.length(3);
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

  describe('getBatchesFromRange', function () {
    it('should group assessment ids according to the assessments id range', function () {
      const firstAssessmentId = 100000;

      const secondAssessmentId = 100001;

      const thirdAssessmentId = 100002;

      const assessments = [firstAssessmentId, secondAssessmentId, thirdAssessmentId];
      const groups = getBatchesFromRange(assessments, 1000);

      expect(groups).to.have.length(2);
      expect(groups.get(99001)).to.deep.equal([firstAssessmentId]);
      expect(groups.get(100001)).to.deep.equal([secondAssessmentId, thirdAssessmentId]);
    });

    it('should not have empty group assessments ', function () {
      const assessmentIds = [100000, 200001, 200002];
      const groups = getBatchesFromRange(assessmentIds, 1000);
      expect(groups).to.have.length(2);
      expect(groups.get(100001)).to.be.undefined;
    });
  });
});
