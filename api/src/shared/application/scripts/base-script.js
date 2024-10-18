import 'dotenv/config';

import Joi from 'joi';

import { disconnect } from '../../../../db/knex-database-connection.js';
import { learningContentCache } from '../../infrastructure/caches/learning-content-cache.js';
import { logger as defaultLogger } from '../../infrastructure/utils/logger.js';

const META_INFO_SCHEMA = Joi.object({
  description: Joi.string().required(),
  permanent: Joi.boolean().required(),
  options: Joi.object().optional(),
});

// See options doc: https://yargs.js.org/docs/#api-reference-optionskey-opt
const DEFAULT_OPTIONS = {
  dryRun: {
    type: 'boolean',
    describe: 'Run without making changes',
    default: false,
  },
};

// TODO: Rename BaseScript to Script
// TODO: Create test helpers
// TODO: Add JS doc
// TODO: Add Documentation page
// TODO: Make dry-run option optional (withDryRun)
// TODO: Add parser for options (ex: CommaSeparatedParser, CSVParser([col1,...]), CSVStreamParser([col1,...]))
export class BaseScript {
  constructor(metaInfo) {
    const result = Joi.attempt(metaInfo, META_INFO_SCHEMA, { abortEarly: false });

    // TODO: Tests
    this.metaInfo = {
      ...result,
      options: { ...DEFAULT_OPTIONS, ...result.options },
    };
  }

  async handle(_params) {
    throw new Error('"handle" method must be implemented');
  }

  async run(options, logger = defaultLogger) {
    try {
      await this.handle({ options, logger });
    } catch (error) {
      if (this.onError) await this.onError({ error, logger });

      throw error;
    } finally {
      if (this.onFinished) await this.onFinished({ logger });

      // TODO: Test
      await disconnect();
      await learningContentCache.quit();
    }
  }
}
