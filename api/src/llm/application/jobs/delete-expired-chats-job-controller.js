import { JobScheduleController } from '../../../shared/application/jobs/job-schedule-controller.js';
import { config } from '../../../shared/config.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { child, SCOPES } from '../../../shared/infrastructure/utils/logger.js';

const logger = child('llm:delete-expired-chats-job', { event: SCOPES.LLM });

class DeleteExpiredChatsJobController extends JobScheduleController {
  constructor() {
    super('DeleteExpiredChatsJob', {
      jobCron: config.llm.deleteChatsJob.cron,
    });
  }

  async handle({ dependencies = { config, logger } }) {
    const { lifespan, dryRun } = dependencies.config.llm.deleteChatsJob;

    if (dryRun) {
      dependencies.logger.info(
        'DeleteExpiredChatsJobHandler - Starting script in dry run mode. No chats will actually be deleted.',
      );
    }

    const today = new Date();
    const cutoffDate = new Date();
    cutoffDate.setDate(today.getDate() - lifespan);

    dependencies.logger.info(`About to delete chats started before ${cutoffDate.toISOString()}`);

    await DomainTransaction.execute(async () => {
      const trx = DomainTransaction.getConnection();
      try {
        const [{ allChatsCount }] = await trx('chats').count('*', { as: 'allChatsCount' });
        const chatsToBeDeleted = await trx('chats').where('startedAt', '<', cutoffDate);
        const chatIdsToDelete = chatsToBeDeleted.map(({ id }) => id);

        const [{ allChatMessagesCount }] = await trx('chat_messages').count('*', { as: 'allChatMessagesCount' });
        const chatMessagesToBeDeleted = await trx('chat_messages').whereIn('chatId', chatIdsToDelete);

        if (dryRun) {
          logger.info(`${chatsToBeDeleted.length} chat(s) would have been deleted (out of ${allChatsCount})`);
          logger.info(
            `${chatMessagesToBeDeleted.length} chat message(s) would have been deleted (out of ${allChatMessagesCount})`,
          );
          throw new Error('dryRun is true');
        }

        const deletedChatMessages = await trx('chat_messages')
          .whereIn('chatId', chatIdsToDelete)
          .delete()
          .returning('id');
        const deletedChatMessageIds = deletedChatMessages.map(({ id }) => id);
        logger.debug({
          deletedChatMessageIds,
          count: deletedChatMessages.length,
        });

        const expectedRemainingChatMessagesCount = allChatMessagesCount - chatMessagesToBeDeleted.length;
        const actualRemaningChatMessagesCount = allChatMessagesCount - deletedChatMessages.length;
        logger.info(`Number of expected remaining chat messages: ${expectedRemainingChatMessagesCount}`);
        logger.info(`Number of remaining chat messages: ${actualRemaningChatMessagesCount}`);
        if (expectedRemainingChatMessagesCount !== actualRemaningChatMessagesCount) {
          const leftoverChatMessageIds = await trx('chats_messages').select('id').whereIn('chatId', chatIdsToDelete);
          logger.error({
            msg: `Number of actual remaining chats (${actualRemainingChatsCount}) does not match number of expected remaining chat (${expectedRemainingChatsCount}}).`,
            leftoverChatMessageIds,
            deletedChatMessageIds,
          });
        }

        const deletedChats = await trx('chats').where('startedAt', '<', cutoffDate).delete().returning('id');
        const deletedChatIds = deletedChats.map(({ id }) => id);
        logger.debug({
          deletedChatIds,
          count: deletedChats.length,
        });

        const expectedRemainingChatsCount = allChatsCount - chatsToBeDeleted.length;
        const actualRemainingChatsCount = allChatsCount - deletedChats.length;
        logger.info(`Number of expected remaining chats: ${expectedRemainingChatsCount}`);
        logger.info(`Number of actual remaining chats: ${actualRemainingChatsCount}`);
        if (expectedRemainingChatsCount !== actualRemainingChatsCount) {
          const leftoverChatIds = await trx('chats').select('id').where('startedAt', '<', cutoffDate);
          logger.error({
            msg: `Number of actual remaining chats (${actualRemainingChatsCount}) does not match number of expected remaining chat (${expectedRemainingChatsCount}}).`,
            leftoverChatIds,
            deletedChatIds,
          });
        }
      } catch (error) {
        logger.error({ err: error, msg: 'Error during job execution, starting rollback...' });
        throw error;
      }
    });
  }
}

export { DeleteExpiredChatsJobController };
