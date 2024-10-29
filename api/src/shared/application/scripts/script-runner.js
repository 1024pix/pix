import * as url from 'node:url';

import pick from 'lodash/pick.js';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';

import { disconnect } from '../../../../db/knex-database-connection.js';
import { learningContentCache } from '../../infrastructure/caches/learning-content-cache.js';
import { logger as defaultLogger } from '../../infrastructure/utils/logger.js';

function isRunningFromCli(scriptFileUrl) {
  const modulePath = url.fileURLToPath(scriptFileUrl);
  return process.argv[1] === modulePath;
}

/**
 * A utility class for running scripts from the command line.
 */
export class ScriptRunner {
  /**
   * Executes the provided script class if running from the command line.
   * Parses command-line arguments and runs the script with the provided options.
   *
   * @param {string} scriptFileUrl - The file URL of the script being executed.
   * @param {typeof Script} ScriptClass - The script class to be instantiated and executed.
   * @param {object} [dependencies] - The script runner dependencies (logger, isRunningFromCli)
   */
  static async execute(scriptFileUrl, ScriptClass, dependencies = { logger: defaultLogger, isRunningFromCli }) {
    const { logger, isRunningFromCli } = dependencies;

    if (!isRunningFromCli(scriptFileUrl)) return;

    const script = new ScriptClass();
    const { description, options = {} } = script.metaInfo;

    const { argv } = process;

    try {
      const args = hideBin(argv);
      const result = await yargs(args).usage(description).options(options).help().version(false).parseAsync();

      const parsedOptions = pick(result, Object.keys(options));

      logger.info(`Start script`);

      if (args.length > 0) logger.info(`Arguments: ${args.join(' ')}`);

      await script.run(parsedOptions);

      logger.info(`Script execution successful.`);
    } catch (error) {
      logger.error(`Script execution failed.`);
      logger.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
      await learningContentCache.quit();
    }
  }
}
