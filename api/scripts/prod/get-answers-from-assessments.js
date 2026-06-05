import { randomUUID } from 'node:crypto';

import { parquetWriteBuffer } from 'hyparquet-writer';

import { knex } from '../../db/knex-database-connection.js';
import { Script } from '../../src/shared/application/scripts/script.js';
import { ScriptRunner } from '../../src/shared/application/scripts/script-runner.js';
import { DomainTransaction } from '../../src/shared/domain/DomainTransaction.js';
import { AnswersHistoryExportStorage } from './answers-history-export-storage.js';

const ASSESSMENT_ID_RANGE_SIZE = 1000;

export class GetAnswersFromAssessments extends Script {
  constructor() {
    super({
      description: 'Get answers from a list of assessments',
      permanent: true,
      options: {
        dryRun: {
          type: 'boolean',
          describe: 'Run the script without making any database changes',
          default: true,
        },
      },
    });
  }

  async handle({ logger, options }) {
    const { dryRun } = options;

    const todayDate = new Date();
    const oneYearAgoString = new Date(todayDate.getFullYear() - 1, todayDate.getMonth(), todayDate.getDate())
      .toISOString()
      .split('T')[0];

    const answersToBeDeleted = await getAnswersToBeDeleted();

    if (dryRun) {
      logger.info(`${answersToBeDeleted.length} answers would be written to parquet file and deleted`);
    } else {
      const answerHistoryExportStorage = new AnswersHistoryExportStorage();

      for (const [rangeStart, batchAnswersToBeDeleted] of partitionByAssessmentIdRange(answersToBeDeleted)) {
        logger.info(`Creating parquet file.`);
        const { partitionFile, fileContent } = createParquetArrayBuffer(
          rangeStart,
          batchAnswersToBeDeleted,
          ASSESSMENT_ID_RANGE_SIZE,
        );
        logger.info(`Successfully created ${partitionFile} file.`);
        try {
          logger.info(`Writing ${batchAnswersToBeDeleted.length} answers to ${partitionFile}.`);
          await answerHistoryExportStorage.sendFile({ filename: partitionFile, fileContent });
          logger.info(`Successfully written ${batchAnswersToBeDeleted.length} answers to ${partitionFile}.`);

          logger.info(`Deleting ${batchAnswersToBeDeleted.length} answers.`);
          await deleteBatchAnswers(batchAnswersToBeDeleted, logger);
          logger.info(`Successfully deleted ${batchAnswersToBeDeleted.length} answers.`);
        } catch {
          logger.error(`File upload failed, rolling back uploaded file ${partitionFile} and deleting it from bucket`);
          await answerHistoryExportStorage.deleteFile({ filename: partitionFile });
          throw Error('An error occurred during the process');
        }
      }
    }
  }
}

export async function getAnswersToBeDeleted() {
  const targetTypes = ['DEMO', 'COMPETENCE_EVALUATION', 'PLACEMENT', 'PREVIEW', 'CAMPAIGN'];
  return knex
    .select('answers.*')
    .from('assessments')
    .innerJoin('answers', 'answers.assessmentId', 'assessments.id')
    .whereIn('assessments.type', targetTypes)
    .where('assessments.state', 'completed')
    .whereRaw('DATE(assessments."updatedAt") = ?', ['2020-01-02']);
}

export function createParquetArrayBuffer(rangeStart, batchAnswersToBeDeleted, assessmentRangeSize, logger) {
  const rangeEnd = rangeStart + assessmentRangeSize - 1;
  const partitionFile = `answers/${rangeStart}_${rangeEnd}/${randomUUID()}.parquet`;
  try {
    const fileContent = _createArrayBufferFromAnswers(batchAnswersToBeDeleted);
    return { partitionFile, fileContent };
  } catch {
    logger.error('Could not create parquet from batched answers');
    throw Error('An error occurred while creating the parquet from batched answers');
  }
}

export async function deleteBatchAnswers(answersToBeDeleted, logger, connection = DomainTransaction.getConnection()) {
  const batchAnswersToBeDeletedIds = answersToBeDeleted.map(({ id }) => id);
  try {
    await connection('answers').delete().whereIn('id', batchAnswersToBeDeletedIds);
  } catch {
    logger.error('Could not delete answers from DB');
    throw Error('An error occurred during the answers deletion in DB');
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

export function partitionByAssessmentIdRange(answers) {
  const groups = new Map();
  for (const answer of answers) {
    const rangeStart = Math.floor((answer.assessmentId - 1) / ASSESSMENT_ID_RANGE_SIZE) * ASSESSMENT_ID_RANGE_SIZE + 1;
    if (!groups.has(rangeStart)) groups.set(rangeStart, []);
    groups.get(rangeStart).push(answer);
  }
  return groups;
}

await ScriptRunner.execute(import.meta.url, GetAnswersFromAssessments);
