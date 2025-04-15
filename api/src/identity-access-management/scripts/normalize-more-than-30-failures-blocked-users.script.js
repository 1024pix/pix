import { knex } from '../../../db/knex-database-connection.js';
import { Script } from '../../shared/application/scripts/script.js';
import { ScriptRunner } from '../../shared/application/scripts/script-runner.js';

const BLOCKING_LIMIT_FAILURE_COUNT = 30;
const USER_LOGINS_TABLE_NAME = 'user-logins';

export class NormalizeMoreThan30failuresBlockedUsersScript extends Script {
  constructor() {
    super({
      description: 'This script normalizes user-logins records wrt the 30 failures updated blocking limit.',
      permanent: false,
    });
  }
  async handle({ logger }) {
    const updatedUserLoginIds = await knex(USER_LOGINS_TABLE_NAME)
      .where('failureCount', '>=', BLOCKING_LIMIT_FAILURE_COUNT)
      .update({
        blockedAt: new Date(),
        failureCount: BLOCKING_LIMIT_FAILURE_COUNT,
      })
      .returning('id');

    logger.info(`user-logins updated records: ${updatedUserLoginIds.length}`);
  }
}

await ScriptRunner.execute(import.meta.url, NormalizeMoreThan30failuresBlockedUsersScript);
