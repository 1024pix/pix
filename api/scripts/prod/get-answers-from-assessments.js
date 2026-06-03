import { writeFile } from 'node:fs/promises';

import { parquetWriteBuffer } from 'hyparquet-writer';

import { knex } from '../../db/knex-database-connection.js';
import { Script } from '../../src/shared/application/scripts/script.js';
import { ScriptRunner } from '../../src/shared/application/scripts/script-runner.js';

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
        outputFile: {
          type: 'string',
          describe: 'Path to the output parquet file',
          default: './answers.parquet',
        },
      },
    });
  }

  async handle({ logger, options }) {
    const { dryRun, outputFile } = options;

    const todayDate = new Date();
    const oneYearAgoString = new Date(todayDate.getFullYear() - 1, todayDate.getMonth(), todayDate.getDate())
      .toISOString()
      .split('T')[0];

    const targetTypes = ['DEMO', 'COMPETENCE_EVALUATION', 'PLACEMENT', 'PREVIEW', 'CAMPAIGN'];

    const answersToBeDeleted = await knex
      .select('answers.*')
      .from('assessments')
      .join('answers', 'answers.assessmentId', 'assessments.id')
      .whereIn('assessments.type', targetTypes)
      .where('assessments.state', 'completed')
      .whereRaw('DATE(assessments."updatedAt") = ?', ['2020-01-03']);

    if (dryRun) {
      logger.info(`${answersToBeDeleted.length} answers would be written to parquet file and deleted`);
    } else {
      const buffer = writeBufferFromAnswers(answersToBeDeleted);
      await writeFile(outputFile, Buffer.from(buffer));
      logger.info(`Written ${answersToBeDeleted.length} answer ids to ${outputFile}`);
      const answerToBeDeletedIds = answersToBeDeleted.map(({ id }) => id);
      await knex.delete().from('answers').whereIn('id', answerToBeDeletedIds);
      logger.info(`Deleted ${answerToBeDeletedIds.length} answers`);
    }
  }
}

export function writeBufferFromAnswers(answersToBeDeleted) {
  return parquetWriteBuffer({
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

await ScriptRunner.execute(import.meta.url, GetAnswersFromAssessments);
