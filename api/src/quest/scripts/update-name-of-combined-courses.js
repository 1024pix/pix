import { commaSeparatedNumberParser } from '../../shared/application/scripts/parsers.js';
import { Script } from '../../shared/application/scripts/script.js';
import { ScriptRunner } from '../../shared/application/scripts/script-runner.js';
import { DomainTransaction } from '../../shared/domain/DomainTransaction.js';
import { usecases } from '../domain/usecases/index.js';

export class UpdateCombinedCoursesNameScript extends Script {
  constructor() {
    super({
      description: 'Updates the name of a single or several combined courses',
      permanent: true,
      options: {
        combinedCourseIds: {
          type: 'string',
          describe: 'a list of comma separated combined course ids',
          demandOption: true,
          coerce: commaSeparatedNumberParser(),
        },
        newName: {
          type: 'string',
          describe: 'a single name that will apply to every combined course id given in argument',
          demandOption: true,
        },
        dryRun: {
          type: 'boolean',
          default: true,
        },
      },
    });
  }

  async handle({ options, logger, dependencies = usecases }) {
    logger.info(
      { event: 'UpdateCombinedCoursesNameScript' },
      `Updates the name attribute for ${options.combinedCourseIds.length} combined courses`,
    );
    await DomainTransaction.execute(async () => {
      const knexConn = DomainTransaction.getConnection();

      try {
        await dependencies.updateCombinedCourses({
          combinedCourseIds: options.combinedCourseIds,
          name: options.newName,
        });

        if (options.dryRun) {
          await knexConn.rollback();
          logger.info(`ROLLBACK due to dryRun`);
          logger.info(`--dryRun true to persist changes`);
          return;
        }

        logger.info(
          { event: 'UpdateCombinedCoursesNameScript' },
          `COMMIT: Successfully updated names for ${options.combinedCourseIds.length} combined courses.`,
        );
      } catch (error) {
        await knexConn.rollback();
        logger.error({ event: 'UpdateCombinedCoursesNameScript' }, `ROLLBACK: An error has occured, ${error}`);
        throw error;
      }
    });
  }
}
await ScriptRunner.execute(import.meta.url, UpdateCombinedCoursesNameScript);
