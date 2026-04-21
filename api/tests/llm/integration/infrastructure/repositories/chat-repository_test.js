import { randomUUID } from 'node:crypto';

import sinon from 'sinon';

import { Chat, Message } from '../../../../../src/llm/domain/models/Chat.js';
import { Configuration } from '../../../../../src/llm/domain/models/Configuration.js';
import { get, save } from '../../../../../src/llm/infrastructure/repositories/chat-repository.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';

describe('LLM | Integration | Infrastructure | Repositories | chat', function () {
  describe('#save', function () {
    let clock, now;

    beforeEach(function () {
      clock = sinon.useFakeTimers(new Date('2025-09-26'));
      now = new Date(clock.now);
    });

    afterEach(function () {
      clock.restore();
    });

    context('when there is no chats or messages existing in database with chat id passed in parameter', function () {
      it('should save the chat and messages correctly in database', async function () {
        // given
        const uuid = randomUUID();
        const moduleId = randomUUID();
        const chat = new Chat({
          id: uuid,
          userId: 123,
          passageId: 234,
          moduleId,
          configurationId: 'some-config-id',
          configuration: new Configuration({
            challenge: {
              inputMaxChars: 500,
              inputMaxPrompts: 4,
            },
            attachment: {
              name: 'test.csv',
              context: 'le contexte',
            },
          }),
          haveVictoryConditionsBeenFulfilled: true,
          messages: [
            new Message({
              index: 0,
              content: 'je suis user',
              emitter: 'user',
              attachmentName: 'attachmentName',
            }),
            new Message({
              index: 1,
              content: 'je suis LLM',
              emitter: 'assistant',
            }),
            new Message({
              index: 2,
              content: 'message modéré',
              emitter: 'user',
              wasModerated: true,
            }),
          ],
        });
        const chatDTO = chat.toDTO();

        // when
        await save(chat);

        // then
        const insertedChat = await knex.select().from('chats').where({ id: chat.id }).first();
        const messages = await knex.select().from('chat_messages').where({ chatId: chat.id }).orderBy('index');

        expect(insertedChat).to.deep.include({
          id: chatDTO.id,
          userId: chatDTO.userId,
          passageId: chatDTO.passageId,
          moduleId: chatDTO.moduleId,
          configContent: chatDTO.configuration,
          configId: chatDTO.configurationId,
          haveVictoryConditionsBeenFulfilled: true,
          startedAt: now,
          updatedAt: now,
        });

        expect(messages).to.have.lengthOf(3);
        expect(messages[0]).to.deep.include({
          chatId: chatDTO.id,
          index: 0,
          emitter: 'user',
          content: 'je suis user',
          attachmentName: 'attachmentName',
          wasModerated: null,
        });

        expect(messages[1]).to.deep.include({
          chatId: chatDTO.id,
          index: 1,
          emitter: 'assistant',
          content: 'je suis LLM',
          wasModerated: null,
        });

        expect(messages[2]).to.deep.include({
          chatId: chatDTO.id,
          index: 2,
          emitter: 'user',
          content: 'message modéré',
          wasModerated: true,
        });
      });
    });

    context('when there is already a chat with no messages existing in database', function () {
      let databaseChat;

      beforeEach(async function () {
        databaseChat = databaseBuilder.factory.buildChat();
        await databaseBuilder.commit();
      });

      it('should save a chat with same chat id correctly without updating the startedAt field', async function () {
        // given
        await clock.tickAsync('01:00:00');
        const updatedAtWithDifferentDateFromStartedAt = new Date(clock.now);
        const chat = new Chat({
          ...databaseChat,
          configuration: new Configuration(databaseChat.configContent),
          totalInputTokens: 3,
          totalOutputTokens: 4,
          messages: [],
        });

        // when
        await save(chat);

        // then
        const insertedChat = await knex.select().from('chats').where({ id: databaseChat.id }).first();

        expect(insertedChat).to.deep.include({
          ...databaseChat,
          totalInputTokens: 3,
          totalOutputTokens: 4,
          haveVictoryConditionsBeenFulfilled: false,
          updatedAt: updatedAtWithDifferentDateFromStartedAt,
          startedAt: now,
        });
      });
    });

    context('when there is already a chat with messages existing in database', function () {
      let databaseChat, firstDatabaseChatMessage, secondDatabaseChatMessage;

      beforeEach(async function () {
        databaseChat = databaseBuilder.factory.buildChat();
        firstDatabaseChatMessage = databaseBuilder.factory.buildChatMessage({ chatId: databaseChat.id });
        secondDatabaseChatMessage = databaseBuilder.factory.buildChatMessage({
          chatId: databaseChat.id,
          index: 1,
          emitter: 'assistant',
        });

        await databaseBuilder.commit();
      });

      it('should save only new messages related to the chat with same chat id', async function () {
        const firstMessage = new Message({
          ...firstDatabaseChatMessage,
          emitter: 'user',
        });
        const secondMessage = new Message({
          ...secondDatabaseChatMessage,
          emitter: 'assistant',
          content: 'Content not to be saved',
        });
        const thirdMessage = new Message({
          index: 2,
          content: 'contenu qui respecte les conditions de victoires : merguez',
          emitter: 'user',
        });

        const chat = new Chat({
          ...databaseChat,
          configuration: new Configuration(databaseChat.configContent),
          totalInputTokens: 3,
          totalOutputTokens: 4,
          messages: [firstMessage, secondMessage, thirdMessage],
        });

        // when
        await save(chat);

        // then
        const messages = await knex.select().from('chat_messages').where({ chatId: chat.id }).orderBy('index');

        expect(messages).to.have.lengthOf(3);
        expect(messages[0]).deep.include(firstDatabaseChatMessage);
        expect(messages[1]).deep.include(secondDatabaseChatMessage);
        expect(messages[1].content).to.not.equal('Content not to be saved');
        expect(messages[2]).to.deep.include({
          chatId: databaseChat.id,
          index: 2,
          emitter: 'user',
          content: thirdMessage.content,
          wasModerated: null,
          requestId: null,
        });
      });
    });
  });

  describe('#get', function () {
    it('should return null when chat is not found', async function () {
      // when
      const chat = await get(randomUUID());

      // then
      expect(chat).to.be.null;
    });

    it('should return the Chat model when chat is found', async function () {
      // given
      const chatId = databaseBuilder.factory.buildChat({
        assessmentId: 123,
        userId: 456,
        challengeId: 'recCHallengeA',
        configId: 'someConfigId',
        configContent: {
          challenge: {
            victoryConditions: {
              expectations: [
                {
                  type: 'answer_does_not_contain',
                  value: 'saucisse',
                },
              ],
            },
          },
        },
        haveVictoryConditionsBeenFulfilled: true,
        moduleId: null,
        passageId: null,
        totalInputTokens: 1500,
        totalOutputTokens: 2500,
      }).id;
      databaseBuilder.factory.buildChatMessage({
        attachmentName: 'attachmentA',
        chatId,
        content: 'Voici le fichier :',
        emitter: 'user',
        index: 0,
        wasModerated: false,
      });
      databaseBuilder.factory.buildChatMessage({
        attachmentName: null,
        chatId,
        content: 'Les arc en ciels c super bo',
        emitter: 'assistant',
        index: 1,
        wasModerated: null,
      });
      databaseBuilder.factory.buildChatMessage({ content: 'je ne fais pas partie du chat du test !! ' });
      await databaseBuilder.commit();

      // when
      const chat = await get(chatId);

      // then
      expect(chat).to.deepEqualInstance(
        new Chat({
          id: chatId,
          userId: 456,
          assessmentId: 123,
          challengeId: 'recCHallengeA',
          passageId: null,
          moduleId: null,
          configurationId: 'someConfigId',
          configuration: new Configuration({
            challenge: {
              victoryConditions: {
                expectations: [
                  {
                    type: 'answer_does_not_contain',
                    value: 'saucisse',
                  },
                ],
              },
            },
          }),
          messages: [
            new Message({
              attachmentName: 'attachmentA',
              chatId,
              content: 'Voici le fichier :',
              emitter: 'user',
              index: 0,
              wasModerated: false,
            }),
            new Message({
              attachmentName: null,
              chatId,
              content: 'Les arc en ciels c super bo',
              emitter: 'assistant',
              index: 1,
              wasModerated: null,
            }),
          ],
          haveVictoryConditionsBeenFulfilled: true,
          totalInputTokens: 1500,
          totalOutputTokens: 2500,
        }),
      );
    });
  });
});
