import nock from 'nock';

import { Chat } from '../../../../../src/llm/domain/models/Chat.js';
import { Configuration } from '../../../../../src/llm/domain/models/Configuration.js';
import { startChat } from '../../../../../src/llm/domain/usecases/start-chat.js';
import { chatRepository, configurationRepository } from '../../../../../src/llm/infrastructure/repositories/index.js';

import { knex } from '../../../../tooling/databases.js';

describe('LLM | Integration | Domain | UseCases | start-chat', function () {
  describe('#startChat', function () {
    let randomUUID;

    beforeEach(async function () {
      randomUUID = () => '123e4567-e89b-12d3-a456-426614174000';
    });

    context('when config object provided', function () {
      let configuration;

      beforeEach(function () {
        configuration = new Configuration({
          challenge: {
            inputMaxChars: 456,
            inputMaxPrompts: 789,
          },
          attachment: {
            name: 'file.txt',
            context: '**coucou**',
          },
        });
      });

      it('should return the newly created chat', async function () {
        // when
        const chat = await startChat({ configuration, randomUUID, chatRepository });

        // then
        expect(chat).to.deepEqualInstance(
          new Chat({
            id: '123e4567-e89b-12d3-a456-426614174000',
            configuration: new Configuration({}), // Configuration’s properties are not enumerable
            totalInputTokens: 0,
            totalOutputTokens: 0,
          }),
        );
      });
    });

    context('when config object not provided', function () {
      let configurationId, userId, llmApiScope, config;

      beforeEach(function () {
        configurationId = 'uneConfigQuiExist';
        userId = 123456;
        config = {
          challenge: {
            inputMaxChars: 456,
            inputMaxPrompts: 789,
          },
          attachment: {
            name: 'file.txt',
            context: '**coucou**',
          },
        };
        llmApiScope = nock('https://llm-test.pix.fr/api').get('/configurations/uneConfigQuiExist').reply(200, config);
      });

      it('should return the newly created chat', async function () {
        // given
        const chatId = '123e4567-e89b-12d3-a456-426614174000';
        const moduleId = randomUUID();

        // when
        const chat = await startChat({
          configurationId,
          userId,
          assessmentId: 11,
          challengeId: 33,
          passageId: 22,
          moduleId,
          randomUUID,
          chatRepository,
          configurationRepository,
        });

        // then
        expect(chat).to.deepEqualInstance(
          new Chat({
            id: '123e4567-e89b-12d3-a456-426614174000',
            userId: 123456,
            assessmentId: 11,
            challengeId: 33,
            passageId: 22,
            moduleId,
            configurationId: 'uneConfigQuiExist',
            configuration: new Configuration({}), // Configuration’s properties are not enumerable
            totalInputTokens: 0,
            totalOutputTokens: 0,
          }),
        );
        expect(llmApiScope.isDone()).to.be.true;
        const { chatDB, messagesDB } = await getChatAndMessagesFromDB(chatId);
        expect(chatDB).to.deep.equal({
          id: chatId,
          userId: 123456,
          assessmentId: 11,
          challengeId: '33',
          moduleId,
          passageId: 22,
          configId: 'uneConfigQuiExist',
          haveVictoryConditionsBeenFulfilled: false,
          configContent: {
            challenge: {
              inputMaxChars: 456,
              inputMaxPrompts: 789,
            },
            attachment: {
              name: 'file.txt',
              context: '**coucou**',
            },
          },
          totalInputTokens: 0,
          totalOutputTokens: 0,
        });
        expect(messagesDB).to.be.empty;
      });
    });
  });
});

async function getChatAndMessagesFromDB(chatId) {
  return {
    chatDB: await knex('chats')
      .select(
        'id',
        'assessmentId',
        'challengeId',
        'userId',
        'configId',
        'configContent',
        'moduleId',
        'passageId',
        'haveVictoryConditionsBeenFulfilled',
        'totalInputTokens',
        'totalOutputTokens',
      )
      .first(),
    messagesDB: await knex('chat_messages')
      .select('index', 'emitter', 'attachmentName', 'attachmentContext', 'content', 'wasModerated')
      .where({ chatId })
      .orderBy('index'),
  };
}
