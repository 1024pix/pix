import { setTimeout } from 'node:timers/promises';

import { config } from '../../../../config/config.js';
import { JobScheduleController } from '../../../shared/application/jobs/job-schedule-controller.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { child, SCOPES } from '../../../shared/infrastructure/utils/logger.js';

const logger = child('llm:delete-expired-chats-job', { event: SCOPES.LLM });

const MAX_SAFE_ITER_COUNT = 1_000_000;

class DeleteExpiredChatsJobController extends JobScheduleController {
  constructor() {
    super('DeleteExpiredChatsJob', {
      jobCron: config.llm.deleteChatsJob.cron,
    });
  }

  async handle({ dependencies = { config, logger } }) {
    const { lifespan, dryRun, chunkSize, msBetweenChunks } = dependencies.config.llm.deleteChatsJob;

    const today = new Date();
    const cutoffDate = new Date();
    cutoffDate.setDate(today.getDate() - lifespan);

    const knex = DomainTransaction.getConnection();
    const [{ count: chatsToBeDeletedCount }] = await knex.count('id').from('chats').where('startedAt', '<', cutoffDate);

    dependencies.logger.info(
      `About to delete ${chatsToBeDeletedCount} chat(s) started before ${cutoffDate.toISOString()}`,
    );

    if (dryRun) {
      dependencies.logger.info('Dry run is enabled, not proceeding with deletion');
      return;
    }

    try {
      let totalChatsDeletedCount = 0;
      for (let i = 0; i <= MAX_SAFE_ITER_COUNT; i++) {
        const chatsToBeDeleted = await knex
          .select('id')
          .from('chats')
          .where('startedAt', '<', cutoffDate)
          .orderBy('startedAt', 'asc')
          .limit(chunkSize);

        const chatIds = chatsToBeDeleted.map(({ id }) => id);
        if (chatIds.length === 0) {
          dependencies.logger.debug('No more chats to delete');
          break;
        }

        dependencies.logger.debug(
          {
            count: chatIds.length,
          },
          'Chats count to be deleted in chunk',
        );

        await knex.delete().from('chat_messages').whereIn('chatId', chatIds);
        await knex.delete().from('chats').whereIn('id', chatIds);

        totalChatsDeletedCount += chatIds.length;

        await setTimeout(msBetweenChunks);
      }

      dependencies.logger.info({ totalChatsDeletedCount }, 'DONE');
    } catch (error) {
      dependencies.logger.error({ err: error, msg: 'Error during job execution' });
      throw error;
    }
  }
}

export { DeleteExpiredChatsJobController };
