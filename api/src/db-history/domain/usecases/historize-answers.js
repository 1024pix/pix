import { randomUUID } from 'node:crypto';

import { parquetWriteBuffer } from 'hyparquet-writer';

import { config } from '../../../shared/config.js';
import { logger as defaultLogger } from '../../../shared/infrastructure/utils/logger.js';
import { AnswersHistoryRepository } from '../../infrastructure/repositories/answers-history-repository.js';
import {
  selectAnswersByIds,
  selectAnswersIdsByAssementIds,
} from '../../infrastructure/repositories/answers-repository.js';
import { getAssessmentIdsByAssessmentTypeAndDateAndState } from '../../infrastructure/repositories/assessments-repository.js';
import { TARGET_STATE, TARGET_TYPES } from '../constants.js';

export async function historizeAnswers({ answersRepository, targetDate, logger = defaultLogger }) {
  const now = new Date();
  const oneYearAgo = now.setFullYear(now.getFullYear() - 1);

  if (new Date(targetDate) > oneYearAgo) {
    const errorMessage = `Target date: ${targetDate} must be at least one year ago.`;
    throw new Error(errorMessage);
  }

  const params = {
    ranges: {
      assessment: config.answersHistoryExport.storage.assessmentIdRange,
      answer: config.answersHistoryExport.storage.answerIdRange,
    },

    repositories: {
      answersHistory: AnswersHistoryRepository.createClient(),
      answers: answersRepository,
    },
  };

  const assessmentIds = await getAssessmentIdsByAssessmentTypeAndDateAndState({
    targetTypes: TARGET_TYPES,
    targetState: TARGET_STATE,
    targetDate,
  });
  logger.info(`${assessmentIds.length} assessments will be processed`);
  for (const [assessmentRangeStart, batchAssessmentIdsToBeProcessed] of getBatchesFromRange(
    assessmentIds.map((assessment) => assessment.id),
    params.ranges.assessment,
  )) {
    await _batchOnAssessments(assessmentRangeStart, batchAssessmentIdsToBeProcessed, params, logger);
  }
}

async function _batchOnAssessments(assessmentRangeStart, batchAssessmentIdsToBeProcessed, params, logger) {
  logger.info(`Porcessing for range from ${assessmentRangeStart}`);

  const answerIds = await selectAnswersIdsByAssementIds({ ids: batchAssessmentIdsToBeProcessed });
  for (const [answerRangeStart, batchAnswerIdsToBeProcessed] of getBatchesFromRange(
    answerIds.map((answer) => answer.id),
    params.ranges.answer,
  )) {
    await _batchOnAnswers(assessmentRangeStart, answerRangeStart, batchAnswerIdsToBeProcessed, params, logger);
  }
}

async function _batchOnAnswers(assessmentRangeStart, answerRangeStart, batchAnswerIdsToBeProcessed, params, logger) {
  const batchAnswersToBeDeleted = await selectAnswersByIds({ ids: batchAnswerIdsToBeProcessed });

  logger.info(
    `Creating parquet file starting for assement range from ${assessmentRangeStart} and answer range from ${answerRangeStart}`,
  );

  const { partitionFile, fileContent } = createParquetArrayBuffer(
    assessmentRangeStart,
    batchAnswersToBeDeleted,
    params.ranges.assessment,
  );
  logger.info(`Successfully created ${partitionFile} file.`);
  try {
    logger.info(`Writing ${batchAnswersToBeDeleted.length} answers to ${partitionFile}...`);
    await params.repositories.answersHistory.sendFile({
      filename: partitionFile,
      fileContent,
    });
    logger.info(`Successfully written ${batchAnswersToBeDeleted.length} answers to ${partitionFile}.`);

    logger.info(`Deleting ${batchAnswersToBeDeleted.length} answers...`);
    await deleteBatchAnswers(params.repositories.answers, batchAnswersToBeDeleted, logger);
    logger.info(`Successfully deleted ${batchAnswersToBeDeleted.length} answers.`);
  } catch (error) {
    logger.error(`File upload failed, rolling back uploaded file ${partitionFile} and deleting it from bucket`);
    await params.repositories.answersHistory.deleteFile({ filename: partitionFile });
    throw Error('An error occurred during the process', { cause: error });
  }
}

export function getBatchesFromRange(elments, range) {
  const elmentGroups = new Map();
  for (const element of elments) {
    const groupIndex = Math.floor((element - 1) / range);
    const firstAssessmentIdInGroup = groupIndex * range + 1;
    const groupExists = elmentGroups.has(firstAssessmentIdInGroup);
    if (!groupExists) elmentGroups.set(firstAssessmentIdInGroup, []);
    elmentGroups.get(firstAssessmentIdInGroup).push(element);
  }
  return elmentGroups;
}

export async function deleteBatchAnswers(answersRepository, answersToBeDeleted, logger) {
  const batchAnswersToBeDeletedIds = answersToBeDeleted.map(({ id }) => id);
  try {
    await answersRepository.deleteAnswersByIds({ ids: batchAnswersToBeDeletedIds });
  } catch (error) {
    logger.error('Could not delete answers from DB');
    throw Error('An error occurred during the answers deletion in DB', { cause: error });
  }
}

export function createParquetArrayBuffer(rangeStart, batchAnswersToBeDeleted, assessmentRangeSize, logger) {
  const rangeEnd = rangeStart + assessmentRangeSize - 1;
  const partitionFile = `answers/${rangeStart}_${rangeEnd}/${randomUUID()}.parquet`;
  try {
    const fileContent = _createArrayBufferFromAnswers(batchAnswersToBeDeleted);
    return { partitionFile, fileContent };
  } catch (error) {
    logger.error('Could not create parquet from batched answers');
    throw Error('An error occurred while creating the parquet from batched answers', { cause: error });
  }
}

function _createArrayBufferFromAnswers(answersToBeDeleted) {
  const ids = new Array(answersToBeDeleted.length);
  const values = new Array(answersToBeDeleted.length);
  const results = new Array(answersToBeDeleted.length);
  const assessmentIds = new Array(answersToBeDeleted.length);
  const challengeIds = new Array(answersToBeDeleted.length);
  const createdAts = new Array(answersToBeDeleted.length);
  const updatedAts = new Array(answersToBeDeleted.length);
  const timeouts = new Array(answersToBeDeleted.length);
  const resultsDetails = new Array(answersToBeDeleted.length);
  const timeSpents = new Array(answersToBeDeleted.length);
  const areFocusedOut = new Array(answersToBeDeleted.length);

  for (let i = 0; i < answersToBeDeleted.length; i++) {
    const answer = answersToBeDeleted[i];

    ids[i] = BigInt(answer.id);
    values[i] = answer.value ?? '';
    results[i] = answer.result ?? '';
    assessmentIds[i] = answer.assessmentId;
    challengeIds[i] = answer.challengeId ?? '';
    createdAts[i] = answer.createdAt;
    updatedAts[i] = answer.updatedAt;
    timeouts[i] = answer.timeout ?? null;
    resultsDetails[i] = answer.resultDetails ?? null;
    timeSpents[i] = answer.timeSpent ?? 0;
    areFocusedOut[i] = answer.isFocusedOut ?? false;
  }

  return parquetWriteBuffer({
    rowGroupSize: 5,
    columnData: [
      {
        name: 'id',
        data: ids,
        type: 'INT64',
      },
      {
        name: 'value',
        data: values,
        type: 'STRING',
      },
      {
        name: 'result',
        data: results,
        type: 'STRING',
      },
      {
        name: 'assessmentId',
        data: assessmentIds,
        type: 'INT32',
      },
      {
        name: 'challengeId',
        data: challengeIds,
        type: 'STRING',
      },
      {
        name: 'createdAt',
        data: createdAts,
        type: 'TIMESTAMP',
      },
      {
        name: 'updatedAt',
        data: updatedAts,
        type: 'TIMESTAMP',
      },
      {
        name: 'timeout',
        data: timeouts,
        type: 'INT32',
      },
      {
        name: 'resultDetails',
        data: resultsDetails,
        type: 'STRING',
      },
      {
        name: 'timeSpent',
        data: timeSpents,
        type: 'INT32',
      },
      {
        name: 'isFocusedOut',
        data: areFocusedOut,
        type: 'BOOLEAN',
      },
      {
        name: 'extractedAt',
        data: new Array(answersToBeDeleted.length).fill(new Date().toISOString().slice(0, 10)),
        type: 'STRING',
      },
    ],
  });
}
