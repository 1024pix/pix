import { randomUUID } from 'node:crypto';

import { parquetWriteBuffer } from 'hyparquet-writer';

import { logger as defaultLogger } from '../../../shared/infrastructure/utils/logger.js';
import { AnswersHistoryRepository } from '../../infrastructure/repositories/answers-history-repository.js';
import { ASSESSMENT_ID_RANGE_SIZE, TARGET_STATE, TARGET_TYPES } from '../constants.js';

export async function historizeAnswers({ answersRepository, targetDate, logger = defaultLogger }) {
  const now = new Date();
  const oneYearAgo = now.setFullYear(now.getFullYear() - 1);

  if (new Date(targetDate) > oneYearAgo) {
    const errorMessage = `Target date: ${targetDate} must be at least one year ago.`;
    throw new Error(errorMessage);
  }

  const answersToBeDeleted = await answersRepository.getAnswersByAssessmentTypeAndDateAndState({
    targetTypes: TARGET_TYPES,
    targetState: TARGET_STATE,
    targetDate,
  });

  logger.info(`${answersToBeDeleted.length} answers will be written to parquet file and deleted`);

  const answersHistoryRepository = AnswersHistoryRepository.createClient();

  for (const [rangeStart, batchAnswersToBeDeleted] of getAnswersGroupedByAssessmentId(answersToBeDeleted)) {
    logger.info(`Creating parquet file starting for range from ${rangeStart}`);
    const { partitionFile, fileContent } = createParquetArrayBuffer(
      rangeStart,
      batchAnswersToBeDeleted,
      ASSESSMENT_ID_RANGE_SIZE,
    );
    logger.info(`Successfully created ${partitionFile} file.`);
    try {
      logger.info(`Writing ${batchAnswersToBeDeleted.length} answers to ${partitionFile}...`);
      await answersHistoryRepository.sendFile({
        filename: partitionFile,
        fileContent,
      });
      logger.info(`Successfully written ${batchAnswersToBeDeleted.length} answers to ${partitionFile}.`);

      logger.info(`Deleting ${batchAnswersToBeDeleted.length} answers...`);
      await deleteBatchAnswers(answersRepository, batchAnswersToBeDeleted, logger);
      logger.info(`Successfully deleted ${batchAnswersToBeDeleted.length} answers.`);
    } catch (error) {
      logger.error(`File upload failed, rolling back uploaded file ${partitionFile} and deleting it from bucket`);
      await answersHistoryRepository.deleteFile({ filename: partitionFile });
      throw Error('An error occurred during the process', { cause: error });
    }
  }
}

export function getAnswersGroupedByAssessmentId(answers) {
  const answerGroups = new Map();
  for (const answer of answers) {
    const firstAssessmentIdInGroup = Math.floor((answer.assessmentId - 1) / ASSESSMENT_ID_RANGE_SIZE) * ASSESSMENT_ID_RANGE_SIZE + 1;
    const groupExists = answerGroups.has(firstAssessmentIdInGroup);
    if (!groupExists) answerGroups.set(firstAssessmentIdInGroup, []);
    answerGroups.get(firstAssessmentIdInGroup).push(answer);
  }
  return answerGroups;
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
  return parquetWriteBuffer({
    rowGroupSize: 5,
    columnData: [
      {
        name: 'id',
        data: answersToBeDeleted.map(({ id }) => BigInt(id)),
        type: 'INT64',
      },
      {
        name: 'value',
        data: answersToBeDeleted.map(({ value }) => value ?? ''),
        type: 'STRING',
      },
      {
        name: 'result',
        data: answersToBeDeleted.map(({ result }) => result ?? ''),
        type: 'STRING',
      },
      {
        name: 'assessmentId',
        data: answersToBeDeleted.map(({ assessmentId }) => assessmentId),
        type: 'INT32',
      },
      {
        name: 'challengeId',
        data: answersToBeDeleted.map(({ challengeId }) => challengeId ?? ''),
        type: 'STRING',
      },
      {
        name: 'createdAt',
        data: answersToBeDeleted.map(({ createdAt }) => createdAt),
        type: 'TIMESTAMP',
      },
      {
        name: 'updatedAt',
        data: answersToBeDeleted.map(({ updatedAt }) => updatedAt),
        type: 'TIMESTAMP',
      },
      {
        name: 'timeout',
        data: answersToBeDeleted.map(({ timeout }) => timeout ?? null),
        type: 'INT32',
      },
      {
        name: 'resultDetails',
        data: answersToBeDeleted.map(({ resultDetails }) => resultDetails ?? null),
        type: 'STRING',
      },
      {
        name: 'timeSpent',
        data: answersToBeDeleted.map(({ timeSpent }) => timeSpent ?? 0),
        type: 'INT32',
      },
      {
        name: 'isFocusedOut',
        data: answersToBeDeleted.map(({ isFocusedOut }) => isFocusedOut ?? false),
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
