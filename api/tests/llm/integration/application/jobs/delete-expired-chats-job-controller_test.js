import { randomUUID } from 'node:crypto';

import { expect } from 'chai';
import sinon from 'sinon';

import { DeleteExpiredChatsJobController } from '../../../../../src/llm/application/jobs/delete-expired-chats-job-controller.js';
import { JobGroup } from '../../../../../src/shared/application/jobs/job-controller.js';
import { config } from '../../../../../src/shared/config.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';

describe('LLM | Integration | Application | Jobs | DeleteExpiredChatsJobController', function () {
  /** @type {DeleteExpiredChatsJobController} */
  let jobController, loggerStub;

  beforeEach(function () {
    jobController = new DeleteExpiredChatsJobController();
    loggerStub = {
      info: sinon.stub(),
      debug: sinon.stub(),
      error: sinon.stub(),
    };
  });

  afterEach(function () {
    sinon.reset();
  });

  it('sets up the job controller configuration correctly', async function () {
    expect(jobController.jobName).to.equal('DeleteExpiredChatsJob');
    expect(jobController.jobGroup).to.equal(JobGroup.DEFAULT);
  });

  describe('when dryRun is true', function () {
    beforeEach(function () {
      config.llm.deleteChatsJob.dryRun = true;
      config.llm.deleteChatsJob.lifespan = 10;
    });

    describe('when there are chats older than given days lifespan', function () {
      it('should not delete any chats', async function () {
        // given
        const firstChatId = randomUUID();
        databaseBuilder.factory.llm.buildChat({ id: firstChatId, startedAt: new Date('2020-01-01') });
        databaseBuilder.factory.llm.buildChatMessage({ chatId: firstChatId });
        await databaseBuilder.commit();

        // when
        await jobController.handle({
          dependencies: {
            logger: loggerStub,
            config,
          },
        });
        const [{ count: chatsInDb }] = await knex('chats').count();
        const [{ count: chatMessagesInDb }] = await knex('chat_messages').count();

        // then
        expect(chatsInDb).to.equal(1);
        expect(chatMessagesInDb).to.equal(1);
        expect(loggerStub.info).to.have.been.calledWithMatch(/About to delete 1 chat/);
        expect(loggerStub.info).to.have.been.calledWith('Dry run is enabled, not proceeding with deletion');
        expect(loggerStub.info).to.have.callCount(2);
        expect(loggerStub.error).to.have.callCount(0);
      });
    });

    describe('when there are no chats older than given lifespan', function () {
      it('should not delete any chats', async function () {
        // given
        databaseBuilder.factory.llm.buildChatMessage();
        await databaseBuilder.commit();

        // when
        await jobController.handle({
          dependencies: {
            logger: loggerStub,
            config,
          },
        });
        const [{ count: chatsInDb }] = await knex('chats').count();
        const [{ count: chatMessagesInDb }] = await knex('chat_messages').count();

        // then
        expect(chatsInDb).to.equal(1);
        expect(chatMessagesInDb).to.equal(1);
        expect(loggerStub.info).to.have.been.calledWithMatch(/About to delete 0 chat/);
        expect(loggerStub.info).to.have.been.calledWith('Dry run is enabled, not proceeding with deletion');
        expect(loggerStub.info).to.have.callCount(2);
        expect(loggerStub.error).to.have.callCount(0);
      });
    });
  });

  describe('when dryRun is false', function () {
    beforeEach(function () {
      config.llm.deleteChatsJob.dryRun = false;
      config.llm.deleteChatsJob.lifespan = 10;
      config.llm.deleteChatsJob.chunkSize = 1;
    });

    describe('when there are chats older than given days lifespan', function () {
      it('should delete chats older than that lifespan', async function () {
        // given
        const moldyChatId = randomUUID();
        databaseBuilder.factory.llm.buildChat({ id: moldyChatId, startedAt: new Date('2020-01-01') });
        databaseBuilder.factory.llm.buildChatMessage({ chatId: moldyChatId });

        const expiredForSureChatId = randomUUID();
        const expiredForSureChatDate = new Date();
        expiredForSureChatDate.setDate(expiredForSureChatDate.getDate() - 15);
        databaseBuilder.factory.llm.buildChat({ id: expiredForSureChatId, startedAt: expiredForSureChatDate });
        databaseBuilder.factory.llm.buildChatMessage({ chatId: expiredForSureChatId });

        const justExpiredChatId = randomUUID();
        const justExpiredChatDate = new Date();
        justExpiredChatDate.setDate(justExpiredChatDate.getDate() - 10);
        databaseBuilder.factory.llm.buildChat({ id: justExpiredChatId, startedAt: justExpiredChatDate });
        databaseBuilder.factory.llm.buildChatMessage({ chatId: justExpiredChatId });

        const barelySavedChatId = randomUUID();
        const barelySavedChatDate = new Date();
        barelySavedChatDate.setDate(barelySavedChatDate.getDate() - 10);
        barelySavedChatDate.setHours(barelySavedChatDate.getHours() + 1);
        databaseBuilder.factory.llm.buildChat({ id: barelySavedChatId, startedAt: barelySavedChatDate });
        databaseBuilder.factory.llm.buildChatMessage({ chatId: barelySavedChatId });

        const recentChatId = randomUUID();
        databaseBuilder.factory.llm.buildChat({ id: recentChatId, startedAt: new Date() });
        databaseBuilder.factory.llm.buildChatMessage({ chatId: recentChatId });

        await databaseBuilder.commit();

        // when
        await jobController.handle({
          dependencies: {
            logger: loggerStub,
            config,
          },
        });
        const [{ count: chatsInDb }] = await knex('chats').count();
        const [{ count: chatMessagesInDb }] = await knex('chat_messages').count();

        // then
        expect(chatsInDb).to.equal(2);
        expect(chatMessagesInDb).to.equal(2);
        expect(loggerStub.info).to.have.been.calledWithMatch(/About to delete 3 chat/);
        expect(loggerStub.debug).to.have.been.calledWith({ count: 1 }, 'Chats count to be deleted in chunk');
        expect(loggerStub.debug).to.have.been.calledWith('No more chats to delete');
        expect(loggerStub.info).to.have.been.calledWith({ totalChatsDeletedCount: 3 }, 'DONE');
        expect(loggerStub.info).to.have.callCount(2);
        expect(loggerStub.debug).to.have.callCount(4);
        expect(loggerStub.error).to.have.callCount(0);
      });
    });

    describe('when there are no chats older than given lifespan', function () {
      it('should not delete any chats', async function () {
        // given
        const barelySavedChatId = randomUUID();
        const barelySavedChatDate = new Date();
        barelySavedChatDate.setDate(barelySavedChatDate.getDate() - 10);
        barelySavedChatDate.setHours(barelySavedChatDate.getHours() + 1);
        databaseBuilder.factory.llm.buildChat({ id: barelySavedChatId, startedAt: barelySavedChatDate });
        databaseBuilder.factory.llm.buildChatMessage({ chatId: barelySavedChatId });

        const recentChatId = randomUUID();
        databaseBuilder.factory.llm.buildChat({ id: recentChatId, startedAt: new Date() });
        databaseBuilder.factory.llm.buildChatMessage({ chatId: recentChatId });

        await databaseBuilder.commit();

        // when
        await jobController.handle({
          dependencies: {
            logger: loggerStub,
            config,
          },
        });
        const [{ count: chatsInDb }] = await knex('chats').count();
        const [{ count: chatMessagesInDb }] = await knex('chat_messages').count();

        // then
        expect(chatsInDb).to.equal(2);
        expect(chatMessagesInDb).to.equal(2);
        expect(loggerStub.info).to.have.been.calledWithMatch(/About to delete 0 chat/);
        expect(loggerStub.debug).to.have.been.calledWith('No more chats to delete');
        expect(loggerStub.info).to.have.been.calledWith({ totalChatsDeletedCount: 0 }, 'DONE');
        expect(loggerStub.info).to.have.callCount(2);
        expect(loggerStub.debug).to.have.callCount(1);
        expect(loggerStub.error).to.have.callCount(0);
      });
    });
  });
});
