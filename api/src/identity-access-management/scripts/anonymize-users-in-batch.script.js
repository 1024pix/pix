import joi from 'joi';

import { csvFileStreamer } from '../../shared/application/scripts/parsers.js';
import { ScriptRunner } from '../../shared/application/scripts/script-runner.js';
import { ScriptWithJob } from '../../shared/application/scripts/script-with-job.js';
import { usecases } from '../domain/usecases/index.js';

const CHUNK_SIZE = 1000;
const DELAY = 1000;

const columnSchemas = [{ name: 'userId', schema: joi.number().required() }];

export class AnonymizeUsersInBatchScript extends ScriptWithJob {
  constructor() {
    super({
      description: 'Anonymizes the given user accounts.',
      permanent: true,
      options: {
        file: {
          type: 'string',
          describe: 'The file path',
          demandOption: true,
          coerce: csvFileStreamer(columnSchemas),
        },
        dryRun: {
          type: 'boolean',
          describe: 'If present, the script will not make any changes to the database',
          default: false,
        },
        anonymizerId: {
          type: 'number',
          describe: 'The user id of the anonymizer',
          demandOption: true,
        },
        chunkSize: {
          type: 'number',
          describe: 'Chunk size to process the file',
          default: CHUNK_SIZE,
        },
        delayInMilliseconds: {
          type: 'number',
          describe: 'Delay between each chunk in milliseconds',
          default: DELAY,
        },
      },
    });

    this.successLines = 0;
    this.failedLines = 0;
    this.currentLineNumber = 0;
    this.currentChunkNumber = 0;
    this.errorOccured = false;
  }

  async handle({ options, logger, anonymizeUser = usecases.anonymizeUser, jobClient }) {
    const { file: streamFile, dryRun, anonymizerId, chunkSize, delayInMilliseconds } = options;

    await super.handle({ jobClient });

    await streamFile(async (chunk) => {
      logger.info(`Processing chunk ${this.currentChunkNumber + 1} (${chunk.length} rows)...`);
      this.currentChunkNumber++;

      await new Promise((resolve) => setTimeout(resolve, delayInMilliseconds)); // delay between chunks to avoid overloading the database

      for (const { userId } of chunk) {
        this.currentLineNumber += 1;
        if (dryRun) continue;

        try {
          await anonymizeUser({ userId, updatedByUserId: anonymizerId });
          this.successLines++;
        } catch (error) {
          this.errorOccured = true;
          this.failedLines++;
          logger.error(`Error on line ${this.currentLineNumber}. ${error}`);
        }
      }
    }, chunkSize);

    if (dryRun) {
      logger.info(`DryRun mode, ${this.currentLineNumber} user accounts to be processed.`);
      return;
    }

    logger.info(`${this.successLines} user accounts processed successfully.`);

    if (this.errorOccured) {
      throw new Error('There was some errors during the process.');
    }
  }
}

await ScriptRunner.execute(import.meta.url, AnonymizeUsersInBatchScript);
