import { randomUUID } from 'node:crypto';

import { parquetWriteBuffer } from 'hyparquet-writer';

import { config } from '../../../shared/config.js';
import { logger as defaultLogger } from '../../../shared/infrastructure/utils/logger.js';
import { AnswersHistoryRepository } from '../../infrastructure/repositories/answers-history-repository.js';
import { TARGET_STATE, TARGET_TYPES } from '../constants.js';

export async function historizeAnswers({
  answersRepository,
  assessmentsRepository,
  targetDate,
  logger = defaultLogger,
}) {
  const now = new Date();
  const oneYearAgo = now.setFullYear(now.getFullYear() - 1);

  if (new Date(targetDate) > oneYearAgo) {
    const errorMessage = `Target date: ${targetDate} must be at least one year ago.`;
    throw new Error(errorMessage);
  }

  const params = {
    // assessments are grouped by id range because the range names the parquet partition,
    // whereas answers are only chunked by count to bound the memory footprint of a batch
    assessmentIdRange: _requirePositiveInteger(
      config.answersHistoryExport.storage.assessmentIdRange,
      'ANSWERS_HISTORY_ASSESSMENT_ID_RANGE',
    ),
    answerBatchSize: _requirePositiveInteger(
      config.answersHistoryExport.storage.answerBatchSize,
      'ANSWERS_HISTORY_ANSWER_BATCH_SIZE',
    ),

    repositories: {
      answersHistory: AnswersHistoryRepository.createClient(),
      answers: answersRepository,
    },
  };
  let fromId = 0;
  let hasMore = true;
  const pageSize = 10000;

  while (hasMore) {
    const assessmentIds = await assessmentsRepository.getAssessmentIdsByAssessmentTypeAndDateAndState({
      targetTypes: TARGET_TYPES,
      targetState: TARGET_STATE,
      targetDate,
      fromId,
      pageSize,
    });

    hasMore = assessmentIds.length === pageSize;

    if (assessmentIds.length === 0) {
      break;
    }

    logger.info(`${assessmentIds.length} assessments will be processed`);

    for (const [assessmentRangeStart, batchAssessmentIdsToBeProcessed] of getBatchesFromRange(
      assessmentIds,
      params.assessmentIdRange,
    )) {
      await _batchOnAssessments(
        assessmentRangeStart,
        batchAssessmentIdsToBeProcessed,
        params,
        logger,
        answersRepository,
      );
    }

    fromId = assessmentIds.at(-1);
  }
}

async function _batchOnAssessments(
  assessmentRangeStart,
  batchAssessmentIdsToBeProcessed,
  params,
  logger,
  answersRepository,
) {
  logger.info(`Processing assessment range from ${assessmentRangeStart}`);

  let fromId = 0;
  let batchCount = 1;
  let hasMore = true;
  const pageSize = params.answerBatchSize;

  while (hasMore) {
    const answerIds = await answersRepository.selectAnswerIdsByAssessmentIds({
      ids: batchAssessmentIdsToBeProcessed,
      pageSize,
      fromId,
    });

    hasMore = answerIds.length === pageSize;

    if (answerIds.length === 0) {
      break;
    }

    logger.info(`${answerIds.length} answers to historize from batch ${batchCount}`);

    await _batchOnAnswers(assessmentRangeStart, batchCount, answerIds, params, logger, answersRepository);

    batchCount++;
    fromId = answerIds.at(-1);
  }
}

async function _batchOnAnswers(
  assessmentRangeStart,
  batchCount,
  batchAnswerIdsToBeProcessed,
  params,
  logger,
  answersRepository,
) {
  const batchAnswersToBeDeleted = await answersRepository.selectAnswersByIds({
    ids: batchAnswerIdsToBeProcessed,
  });

  logger.info(`Creating parquet file for assessment range from ${assessmentRangeStart}, answer batch ${batchCount}`);

  const { partitionFile, fileContent } = createParquetArrayBuffer(
    assessmentRangeStart,
    batchAnswersToBeDeleted,
    params.assessmentIdRange,
    logger,
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
  } catch (historizationError) {
    logger.error(
      `File upload failed, rolling back uploaded file ${partitionFile} and deleting it from bucket. Error: ${historizationError}`,
    );
    try {
      await params.repositories.answersHistory.deleteFile({
        filename: partitionFile,
      });
    } catch (deletionError) {
      throw Error('An error occurred during the deletion process', {
        cause: deletionError,
      });
    }
    throw Error('An error occurred during the historization process', {
      cause: historizationError,
    });
  }
}

/**
 * Groups ids by the id range they belong to, keyed by the first id of the range.
 * Beware: the size of a group depends on how dense the ids are, so it cannot be used to bound
 * the amount of data loaded at once — use a chunk by count for that.
 */
export function getBatchesFromRange(ids, rangeSize) {
  const groupsByFirstIdInRange = new Map();
  for (const id of ids) {
    const rangeIndex = Math.floor((id - 1) / rangeSize);
    const firstIdInRange = rangeIndex * rangeSize + 1;
    const groupExists = groupsByFirstIdInRange.has(firstIdInRange);
    if (!groupExists) groupsByFirstIdInRange.set(firstIdInRange, []);
    groupsByFirstIdInRange.get(firstIdInRange).push(id);
  }
  return groupsByFirstIdInRange;
}

function _requirePositiveInteger(value, environmentVariableName) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(
      `Configuration is invalid: ${environmentVariableName} must be a positive integer, but was: ${value}`,
    );
  }
  return value;
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
