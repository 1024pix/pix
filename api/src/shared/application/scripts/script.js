import 'dotenv/config';

import Joi from 'joi';

import { logger as defaultLogger } from '../../infrastructure/utils/logger.js';

const META_INFO_SCHEMA = Joi.object({
  description: Joi.string().required(),
  permanent: Joi.boolean().required(),
  options: Joi.object().optional(),
});

/**
 * Class for scripts with meta information and execution handling.
 */
export class Script {
  /**
   * Constructs a Script instance.
   *
   * @param {object} metaInfo - The metadata for the script.
   * @param {string} metaInfo.description - A brief description of the script. Required.
   * @param {boolean} metaInfo.permanent - Indicates whether the script is permanent. Required.
   * @param {object} [metaInfo.options] - Options of the script, see doc: https://yargs.js.org/docs/#api-reference-optionskey-opt.
   */
  constructor(metaInfo) {
    const result = Joi.attempt(metaInfo, META_INFO_SCHEMA, { abortEarly: false });
    this.metaInfo = result;
  }

  /**
   * Handles the core logic of the script.
   * This method must be implemented in script classes.
   *
   * @param {object} _params - The metadata for the script.
   * @param {string} _params.options - The parsed options of the script.
   * @param {boolean} _params.permanent - The logger for the script.
   */
  async handle(_params) {
    throw new Error('"handle" method must be implemented');
  }

  /**
   * Runs the script with the given options and logger.
   * If an error occurs, it calls `onError`. After completion, it calls `onFinished`.
   *
   * @param {object} options - The parsed options of the script.
   * @param {object} [logger=defaultLogger] - The logger for the script. Defaults to `defaultLogger`.
   * @throws {Error} If an error occurs during script execution.
   */
  async run(options, logger = defaultLogger) {
    try {
      await this.handle({ options, logger });
    } catch (error) {
      if (this.onError) await this.onError({ error, logger });

      throw error;
    } finally {
      if (this.onFinished) await this.onFinished({ logger });
    }
  }
}
