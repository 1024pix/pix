import { knex } from '../../db/knex-database-connection.js';
import { commaSeparatedNumberParser } from '../../src/shared/application/scripts/parsers.js';
import { Script } from '../../src/shared/application/scripts/script.js';
import { ScriptRunner } from '../../src/shared/application/scripts/script-runner.js';
import { AnswersHistoryExportStorage } from './answers-history-export-storage.js';

const ASSESSMENT_ID_RANGE_SIZE = 1000;

export class ReInsertDeletedAnswersFromAssessments extends Script {
  constructor() {
    super({
      description: 'Reinsert deleted answers from a list of assessments',
      permanent: true,
      options: {
        dryRun: {
          type: 'boolean',
          describe: 'Run the script without making any database changes',
          default: true,
        },
        assessmentIds: {
          type: 'string',
          describe:
            'List of comma separated assessment ids from deleted answers to be reinserted to find parquet to be deleted after insertion',
          demandOption: true,
          coerce: commaSeparatedNumberParser(),
        },
      },
    });
  }

  async handle({ logger, options }) {
    const { dryRun, assessmentIds } = options;

    assessmentIds.sort();

    if (dryRun) {
      logger.info(
        `${assessmentIds.length} assessments to find answers would be reinserted from parquet file to database`,
      );
    } else {
      const answerHistoryStorage = new AnswersHistoryExportStorage();

      const assessmentsIdRangesToFindParquet = new Map();

      for (const assessmentId of assessmentIds) {
        const assessmentIdRange = findParquetRange(assessmentId);
        if (assessmentsIdRangesToFindParquet.get(assessmentIdRange)) {
          assessmentsIdRangesToFindParquet.get(assessmentIdRange).push(assessmentId);
        } else {
          assessmentsIdRangesToFindParquet.set(assessmentIdRange, [assessmentId]);
        }
      }

      const parquetsToReInsertAnswers = [];

      for (const range of [...assessmentsIdRangesToFindParquet.keys()]) {
        const parquetFiles = await answerHistoryStorage.findParquetWithAssessmentsIds(
          assessmentsIdRangesToFindParquet.get(range),
        );
        parquetsToReInsertAnswers.push(...parquetFiles);
      }

      const answersToReinsert = [];
      for (const parquetFile of parquetsToReInsertAnswers) {
        const library = {};
        const parquetFileData = await library.read(parquetFile);
        answersToReinsert.push(parquetFileData);
      }

      const chunkSize = 30;
      await knex.batchInsert('answers', answersToReinsert, chunkSize);
      logger.info(`Successfully reinserted answers in database.`);

      for (const parquetFile of parquetsToReInsertAnswers) {
        await answerHistoryStorage.deleteFile({ filename: parquetFile });
        logger.info(`Successfully deleted ${parquetFile} file.`);
      }
    }
  }
}

export function findParquetRange(assessmentId) {
  const rangeLowerBound = Math.floor((assessmentId - 1) / ASSESSMENT_ID_RANGE_SIZE) * ASSESSMENT_ID_RANGE_SIZE + 1;
  const rangeHigherBound = rangeLowerBound + ASSESSMENT_ID_RANGE_SIZE - 1;
  return `${rangeLowerBound}_${rangeHigherBound}`;
}

await ScriptRunner.execute(import.meta.url, ReInsertDeletedAnswersFromAssessments);
