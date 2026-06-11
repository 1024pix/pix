import { CreateBucketCommand, S3Client } from '@aws-sdk/client-s3';
import { expect } from 'chai';
import sinon from 'sinon';

import { knex } from '../../../../../db/knex-database-connection.js';
import {
  createParquetArrayBuffer,
  deleteBatchAnswers,
  getAnswersGroupedByAssessmentId,
} from '../../../../../src/db-history/domain/usecases/historize-answers.js';
import { usecases } from '../../../../../src/db-history/domain/usecases/index.js';
import * as answersRepository from '../../../../../src/db-history/infrastructure/repositories/answers-repository.js';
import { config } from '../../../../../src/shared/config.js';
import { S3ObjectStorageProvider } from '../../../../../src/shared/storage/infrastructure/providers/S3ObjectStorageProvider.js';
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
    await usecases.historizeAnswers({ targetDate, logger });

    const remainingAnswers = await knex('answers');
    expect(remainingAnswers.length).to.equal(5);

    const { Contents: uploadedFiles } = await s3Client.listFiles();
    // We expect 2 different files as assessmentIds created by the databaseBuilder
    // overlap the ASSESSMENT_ID_RANGE_SIZE given in the production code file
    expect(uploadedFiles).to.have.length(2);
    expect(uploadedFiles[0].Key).to.match(/^answers\//);
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
      await expect(deleteBatchAnswers(answersToBeDeleted, logger, answersRepository)).to.be.rejectedWith(Error);

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

  describe('getAnswersGroupedByAssessmentId', function () {
    it('should group answers according to the assessments id range', function () {
      const firstAnswer = databaseBuilder.factory.buildAnswer({
        assessmentId: 100000,
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
        assessmentId: 100001,
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
        assessmentId: 100002,
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
      const answers = [firstAnswer, secondAnswer, thirdAnswer];
      const groups = getAnswersGroupedByAssessmentId(answers);
      expect(groups).to.have.length(2);
      expect(groups.get(99001)).to.deep.equal([firstAnswer]);
      expect(groups.get(100001)).to.deep.equal([secondAnswer, thirdAnswer]);
    });

    it('should not have empty group answers ', function () {
      const firstAnswer = databaseBuilder.factory.buildAnswer({
        assessmentId: 100000,
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
        assessmentId: 200001,
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
        assessmentId: 200002,
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
      const answers = [firstAnswer, secondAnswer, thirdAnswer];
      const groups = getAnswersGroupedByAssessmentId(answers);
      expect(groups).to.have.length(2);
      expect(groups.get(100001)).to.be.undefined;
    });
  });
});
