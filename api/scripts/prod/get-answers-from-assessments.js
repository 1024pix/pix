import { parquetWriteBuffer } from 'hyparquet-writer';

import { knex } from '../../db/knex-database-connection.js';
import { Script } from '../../src/shared/application/scripts/script.js';
import { ScriptRunner } from '../../src/shared/application/scripts/script-runner.js';
import { AnswersHistoryExportStorage } from './answers-history-export-storage.js';
import { randomUUID } from "node:crypto";

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

    const targetTypes = ['DEMO', 'COMPETENCE_EVALUATION', 'PLACEMENT', 'PREVIEW', 'CAMPAIGN'];

    const answersToBeDeleted = await knex
      .select('answers.*')
      .from('assessments')
      .innerJoin('answers', 'answers.assessmentId', 'assessments.id')
      .whereIn('assessments.type', targetTypes)
      .where('assessments.state', 'completed')
      .whereRaw('DATE(assessments."updatedAt") = ?', ['2020-01-02']);

    if (dryRun) {
      logger.info(`${answersToBeDeleted.length} answers would be written to parquet file and deleted`);
    } else {
      const answerHistoryExportStorage = new AnswersHistoryExportStorage();
      const uploadedFiles = [];

      try {
        for (const [rangeStart, batchAnswersToBeDeleted] of partitionByAssessmentIdRange(answersToBeDeleted)) {
          const rangeEnd = rangeStart + ASSESSMENT_ID_RANGE_SIZE - 1;
          const partitionFile = `answers/${rangeStart}_${rangeEnd}/${randomUUID()}.parquet`;
          logger.info(`Upload ${partitionFile} to bucket`);
          const fileContent = writeBufferFromAnswers(batchAnswersToBeDeleted);
          await answerHistoryExportStorage.sendFile({ filename: partitionFile, fileContent });
          uploadedFiles.push(partitionFile);
          logger.info(`Written ${batchAnswersToBeDeleted.length} answers to ${partitionFile}`);
        }
      } catch (error) {
        logger.error(`File upload failed, rolling back ${uploadedFiles.length} uploaded files`);
        for (const file of uploadedFiles) {
          await answerHistoryExportStorage.deleteFile({ filename: file });
        }
        throw error;
      }

      try {
        const answerToBeDeletedIds = answersToBeDeleted.map(({ id }) => id);
        logger.info(`Delete ${answerToBeDeletedIds.length} answers`);
        await knex.delete().from('answers').whereIn('id', answerToBeDeletedIds);
        logger.info(`Deleted ${answerToBeDeletedIds.length} answers`);
      } catch (error) {
        logger.error(`Database deletion failed, rolling back: deleting ${uploadedFiles.length} files from bucket`);
        for (const file of uploadedFiles) {
          await answerHistoryExportStorage.deleteFile({ filename: file });
        }
        throw error;
      }
    }
  }
}

export function writeBufferFromAnswers(answersToBeDeleted) {
  return parquetWriteBuffer({
    rowGroupSize: 5,
    kvMetadata: [
      { key: "extract_date", value: new Date().toISOString().slice(0, 10) },
    ],
    columnData: [
      {
        name: "id",
        data: answersToBeDeleted.map(({ id }) => BigInt(id)),
        type: "INT64",
      },
      {
        name: "value",
        data: answersToBeDeleted.map(({ value }) => value ?? ""),
        type: "STRING",
      },
      {
        name: "result",
        data: answersToBeDeleted.map(({ result }) => result ?? ""),
        type: "STRING",
      },
      {
        name: "assessmentId",
        data: answersToBeDeleted.map(({ assessmentId }) => assessmentId),
        type: "INT32",
      },
      {
        name: "challengeId",
        data: answersToBeDeleted.map(({ challengeId }) => challengeId ?? ""),
        type: "STRING",
      },
      {
        name: "createdAt",
        data: answersToBeDeleted.map(({ createdAt }) => createdAt),
        type: "TIMESTAMP",
      },
      {
        name: "updatedAt",
        data: answersToBeDeleted.map(({ updatedAt }) => updatedAt),
        type: "TIMESTAMP",
      },
      {
        name: "timeout",
        data: answersToBeDeleted.map(({ timeout }) => timeout ?? null),
        type: "INT32",
      },
      {
        name: "resultDetails",
        data: answersToBeDeleted.map(
          ({ resultDetails }) => resultDetails ?? null,
        ),
        type: "STRING",
      },
      {
        name: "timeSpent",
        data: answersToBeDeleted.map(({ timeSpent }) => timeSpent ?? 0),
        type: "INT32",
      },
      {
        name: "isFocusedOut",
        data: answersToBeDeleted.map(
          ({ isFocusedOut }) => isFocusedOut ?? false,
        ),
        type: "BOOLEAN",
      },
      {
        name: "extractedAt",
        data: new Array(answersToBeDeleted.length).fill(
          new Date().toISOString().slice(0, 10),
        ),
        type: "STRING",
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
