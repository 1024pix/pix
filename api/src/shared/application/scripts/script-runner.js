import * as url from 'node:url';

import pick from 'lodash/pick.js';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';

import { logger as defaultLogger } from '../../infrastructure/utils/logger.js';

// TODO: Add JS doc
// TODO: Add tests
export class ScriptRunner {
  static async execute(scriptFileUrl, ScriptClass, logger = defaultLogger) {
    const script = new ScriptClass();

    if (!isRunningFromCLI(scriptFileUrl)) return;

    const { description, options } = script.metaInfo;

    const { argv } = process;

    const result = yargs(hideBin(argv)).usage(description).options(options).help().version(false).parse();

    const parsedOptions = pick(result, Object.keys(options));

    try {
      logger.info(`Start script`);
      logger.info(` > Options: ${JSON.stringify(parsedOptions)}`);

      await script.run({ options: parsedOptions });

      logger.info(`Script execution successful.`);
    } catch (error) {
      logger.error(`Script execution failed.`);
      logger.error(error);
      process.exitCode = 1;
    }
  }
}

function isRunningFromCLI(scriptFileUrl) {
  const modulePath = url.fileURLToPath(scriptFileUrl);
  return process.argv[1] === modulePath;
}
