import { randomUUID } from 'node:crypto';
import * as url from 'node:url';

import pick from 'lodash/pick.js';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';

import { executeInContext, EXECUTORS } from '../../infrastructure/execution-context-manager.js';
import { releaseInfrastructure } from '../../infrastructure/release-infrastructure.js';
import { logger } from '../../infrastructure/utils/logger.js';

function isRunningFromCli(scriptFileUrl) {
  const modulePath = url.fileURLToPath(scriptFileUrl);
  return process.argv[1] === modulePath;
}

function getProcessArgs() {
  return hideBin(process.argv);
}

/**
 * A utility class for running scripts from the command line.
 */
export class ScriptRunner {
  /**
   * Executes the provided script class if running from the command line.
   * Parses command-line arguments and runs the script with the provided options.
   *
   * @template {typeof import('./script.js').Script} Script
   * @param {string} scriptFileUrl - The file URL of the script being executed.
   * @param {Script} ScriptClass - The script class to be instantiated and executed.
   * @param {object} [dependencies] - The script runner dependencies (logger, isRunningFromCli, getProcessArgs, releaseInfrastructure)
   */
  static async execute(
    scriptFileUrl,
    ScriptClass,
    dependencies = {
      isRunningFromCli,
      getProcessArgs,
      releaseInfrastructure,
    },
  ) {
    const { isRunningFromCli, getProcessArgs, releaseInfrastructure } = dependencies;
    const context = { event: ScriptClass.name, scriptId: randomUUID() };
    await executeInContext(
      context,
      async () => {
        if (!isRunningFromCli(scriptFileUrl)) return;

        const script = new ScriptClass();
        const { description, options = {}, commands = {} } = script.metaInfo;

        try {
          const yargsCommand = yargs(getProcessArgs()).usage(description).options(options).help().version(false);
          Object.entries(commands).forEach(([name, { description, options }]) =>
            yargsCommand.command(name, description, options),
          );

          const result = await yargsCommand.parseAsync();

          let command;
          if (result._[0] in commands) {
            command = result._[0];
          }

          let optionKeys = Object.keys(options);
          if (commands[command]?.options) {
            optionKeys = [...optionKeys, ...Object.keys(commands[command].options)];
          }
          const parsedOptions = pick(result, optionKeys);

          logger.info(`Start script`);

          await script.run({ command, options: parsedOptions, logger });

          logger.info(`Script execution successful.`);
        } catch (error) {
          logger.error(`Script execution failed.`);
          logger.error(error);
          process.exitCode = 1;
        } finally {
          await releaseInfrastructure();
        }
      },
      EXECUTORS.SCRIPT,
    );
  }
}
