import { randomUUID } from 'node:crypto';
import { Readable } from 'node:stream';

import {
  ChatForbiddenError,
  ChatNotFoundError,
  MaxPromptsReachedError,
  NoAttachmentNeededError,
  NoAttachmentNorMessageProvidedError,
  PromptAlreadyOngoingError,
  TooLargeMessageInputError,
} from '../../../../../src/llm/domain/errors.js';
import { Chat, Message } from '../../../../../src/llm/domain/models/Chat.js';
import { Configuration } from '../../../../../src/llm/domain/models/Configuration.js';
import { promptChat } from '../../../../../src/llm/domain/usecases/prompt-chat.js';
import { chatRepository, promptRepository } from '../../../../../src/llm/infrastructure/repositories/index.js';
import * as toEventStream from '../../../../../src/llm/infrastructure/streaming/to-event-stream.js';
import { redisMutex } from '../../../../../src/shared/infrastructure/mutex/RedisMutex.js';
import {
  catchErr,
  databaseBuilder,
  expect,
  knex,
  nock,
  waitForStreamFinalizationToBeDone,
} from '../../../../test-helper.js';

describe('LLM | Integration | Domain | UseCases | prompt-chat', function () {
  let dependencies, chatId;

  beforeEach(function () {
    chatId = randomUUID();
    dependencies = {
      promptRepository,
      chatRepository,
      toEventStream,
      redisMutex,
    };
  });

  context('when no chat id provided', function () {
    it('should throw a ChatNotFoundError', async function () {
      // when
      const err = await catchErr(promptChat)({ chatId: null, message: 'un message', userId: 12345, ...dependencies });

      // then
      expect(err).to.be.instanceOf(ChatNotFoundError);
      expect(err.message).to.equal('The chat of id "null id provided" does not exist');
    });
  });

  context('when prompt is already ongoing for given chat', function () {
    it('should throw a PromptAlreadyOngoingError', async function () {
      // when
      const chatId = randomUUID();
      await dependencies.redisMutex.lock(chatId);
      const err = await catchErr(promptChat)({ chatId, message: 'un message', userId: 12345, ...dependencies });

      // then
      expect(err).to.be.instanceOf(PromptAlreadyOngoingError);
      expect(err.message).to.equal(`A prompt is already ongoing for chat with id ${chatId}`);
    });
  });

  context('when chatId does not refer to an existing chat', function () {
    it('should throw a ChatNotFoundError', async function () {
      const anotherChatId = randomUUID();
      const chat = new Chat({
        id: chatId,
        userId: 123,
        configurationId: 'uneConfigQuiExist',
        configuration: new Configuration({
          llm: {},
          challenge: {
            inputMaxChars: 5,
          },
        }),
        hasAttachmentContextBeenAdded: false,
        messages: [],
      });
      await createChat(chat.toDTO());

      // when
      const err = await catchErr(promptChat)({
        chatId: anotherChatId,
        message: 'un message',
        userId: 12345,
        ...dependencies,
      });

      // then
      expect(err).to.be.instanceOf(ChatNotFoundError);
      expect(err.message).to.equal(`The chat of id "${anotherChatId}" does not exist`);
    });
  });

  context('when user does not own the chat', function () {
    it('should throw a ChatForbiddenError', async function () {
      // given
      const chat = new Chat({
        id: chatId,
        userId: 123456,
        configurationId: 'uneConfigQuiExist',
        configuration: new Configuration({ llm: {} }),
        hasAttachmentContextBeenAdded: false,
        messages: [],
      });
      await createChat(chat.toDTO());

      // when
      const err = await catchErr(promptChat)({
        chatId,
        userId: 12345,
        message: 'un message',
        ...dependencies,
      });

      // then
      expect(err).to.be.instanceOf(ChatForbiddenError);
      expect(err.message).to.equal('User has not the right to use this chat');
    });
  });

  context('checking maxChars limit', function () {
    it('should throw a TooLargeMessageInputError when maxChars is exceeded', async function () {
      // given
      const chat = new Chat({
        id: chatId,
        userId: 123,
        configurationId: 'uneConfigQuiExist',
        configuration: new Configuration({
          llm: {},
          challenge: {
            inputMaxChars: 5,
          },
        }),
        hasAttachmentContextBeenAdded: false,
        messages: [],
      });
      await createChat(chat.toDTO());

      // when
      const err = await catchErr(promptChat)({
        chatId,
        userId: 123,
        message: 'un message',
        ...dependencies,
      });

      // then
      expect(err).to.be.instanceOf(TooLargeMessageInputError);
      expect(err.message).to.equal("You've reached the max characters input");
    });
  });

  context('checking maxPrompts limit', function () {
    it.skip('should ignore messages from LLM when checking for maxPrompts limit', async function () {
      // given
      const chat = new Chat({
        id: chatId,
        userId: 123,
        configurationId: 'uneConfigQuiExist',
        configuration: new Configuration({
          llm: {},
          challenge: {
            inputMaxPrompts: 2,
          },
        }),
        hasAttachmentContextBeenAdded: false,
        messages: [
          buildBasicAssistantMessage('coucou LLM1', 0),
          buildBasicAssistantMessage('coucou LLM2', 1),
          buildBasicUserMessage('coucou user', 2),
        ],
      });
      await createChat(chat.toDTO());
      const llmPostPromptScope = nock('https://llm-test.pix.fr/api')
        .post('/chat', {
          configuration: {
            llm: {},
            challenge: {
              inputMaxPrompts: 2,
            },
          },
          history: [
            { content: 'coucou LLM1', role: 'assistant' },
            { content: 'coucou LLM2', role: 'assistant' },
            { content: 'coucou user', role: 'user' },
          ],
          prompt: 'un message',
        })
        .reply(201, Readable.from(['19:{"message":"salut"}']));

      // when
      const stream = await promptChat({
        chatId,
        userId: 123,
        message: 'un message',
        ...dependencies,
      });

      // then
      const parts = [];
      const decoder = new TextDecoder();
      for await (const chunk of stream) {
        parts.push(decoder.decode(chunk));
      }
      await waitForStreamFinalizationToBeDone();
      const llmResponse = parts.join('');
      expect(llmResponse).to.deep.equal('data: salut\n\n');
      expect(llmPostPromptScope.isDone()).to.be.true;
    });

    it('should throw a MaxPromptsReachedError when user prompts exceed max', async function () {
      // given
      const chat = new Chat({
        id: chatId,
        userId: 123,
        configurationId: 'uneConfigQuiExist',
        configuration: new Configuration({
          challenge: {
            inputMaxPrompts: 2,
          },
        }),
        hasAttachmentContextBeenAdded: false,
        messages: [
          buildBasicUserMessage('coucou user1', 0),
          buildBasicAssistantMessage('coucou LLM2', 1),
          buildBasicUserMessage('coucou user2', 2),
        ],
      });
      await createChat(chat.toDTO());

      // when
      const err = await catchErr(promptChat)({ chatId, userId: 123, message: 'un message', ...dependencies });

      // then
      expect(err).to.be.instanceOf(MaxPromptsReachedError);
      expect(err.message).to.equal("You've reached the max prompts authorized");
    });
  });

  context('success cases', function () {
    let configuration, configurationWithAttachment;
    const configurationId = 'uneConfigQuiExist';

    beforeEach(function () {
      configuration = new Configuration({
        challenge: {
          inputMaxPrompts: 100,
          inputMaxChars: 255,
        },
      });
      configurationWithAttachment = new Configuration({
        challenge: {
          inputMaxPrompts: 100,
          inputMaxChars: 255,
        },
        attachment: {
          name: 'expected_file.txt',
          context: 'add me in the chat !',
        },
      });
    });

    context('when a prompt is provided', function () {
      context('when no attachmentName is provided', function () {
        it('should return a stream which will contain the llm response', async function () {
          // given
          const chat = new Chat({
            id: chatId,
            userId: 123,
            configurationId,
            configuration,
            hasAttachmentContextBeenAdded: false,
            messages: [buildBasicUserMessage('coucou user1', 0), buildBasicAssistantMessage('coucou LLM1', 1)],
          });
          await createChat(chat.toDTO());
          const llmPostPromptScope = nock('https://llm-test.pix.fr/api')
            .post('/chat', {
              configuration: {
                challenge: {
                  inputMaxPrompts: 100,
                  inputMaxChars: 255,
                },
              },
              history: [
                { content: 'coucou user1', role: 'user' },
                { content: 'coucou LLM1', role: 'assistant' },
              ],
              prompt: 'un message',
            })
            .reply(
              201,
              Readable.from([
                '60:{"ceci":"nest pas important","message":"coucou c\'est super"}',
                '40:{"message":"\\nle couscous c plutot bon"}47:{"message":" mais la paella c pas mal aussi\\n"}',
                '29:{"jecrois":{"que":"jaifini"}}',
              ]),
            );

          // when
          const stream = await promptChat({
            chatId,
            userId: 123,
            message: 'un message',
            attachmentName: null,
            ...dependencies,
          });

          // then
          const parts = [];
          const decoder = new TextDecoder();
          for await (const chunk of stream) {
            parts.push(decoder.decode(chunk));
          }
          await waitForStreamFinalizationToBeDone();
          const llmResponse = parts.join('');
          const llmMessage =
            "data: coucou c'est super\n\ndata: \ndata: le couscous c plutot bon\n\ndata:  mais la paella c pas mal aussi\ndata: \n\n";
          const promptsLeft = 'event: user-prompts-left\ndata: 98\n\n';
          expect(llmResponse).to.deep.equal(llmMessage + promptsLeft);
          const { chatDB, messagesDB } = await getChatAndMessagesFromDB(chatId);
          expect(chatDB).to.deep.equal({
            id: chatId,
            userId: 123,
            configId: 'uneConfigQuiExist',
            configContent: {
              challenge: {
                inputMaxPrompts: 100,
                inputMaxChars: 255,
              },
            },
            hasAttachmentContextBeenAdded: false,
            totalInputTokens: 0,
            totalOutputTokens: 0,
          });
          expect(messagesDB).to.deep.equal([
            {
              index: 0,
              content: 'coucou user1',
              emitter: 'user',
              shouldBeRenderedInPreview: true,
              shouldBeForwardedToLLM: true,
              shouldBeCountedAsAPrompt: true,
              wasModerated: null,
              hasErrorOccurred: null,
              attachmentName: null,
              attachmentContext: null,
              hasAttachmentBeenSubmittedAlongWithAPrompt: false,
              haveVictoryConditionsBeenFulfilled: false,
            },
            {
              index: 1,
              content: 'coucou LLM1',
              emitter: 'assistant',
              shouldBeRenderedInPreview: true,
              shouldBeForwardedToLLM: true,
              shouldBeCountedAsAPrompt: false,
              wasModerated: null,
              hasErrorOccurred: null,
              attachmentName: null,
              attachmentContext: null,
              hasAttachmentBeenSubmittedAlongWithAPrompt: false,
              haveVictoryConditionsBeenFulfilled: false,
            },
            {
              index: 2,
              content: 'un message',
              emitter: 'user',
              shouldBeRenderedInPreview: true,
              shouldBeForwardedToLLM: true,
              shouldBeCountedAsAPrompt: true,
              wasModerated: false,
              hasErrorOccurred: null,
              attachmentName: null,
              attachmentContext: null,
              hasAttachmentBeenSubmittedAlongWithAPrompt: false,
              haveVictoryConditionsBeenFulfilled: false,
            },
            {
              index: 3,
              content: "coucou c'est super\nle couscous c plutot bon mais la paella c pas mal aussi\n",
              emitter: 'assistant',
              shouldBeRenderedInPreview: true,
              shouldBeForwardedToLLM: true,
              shouldBeCountedAsAPrompt: false,
              hasErrorOccurred: false,
              wasModerated: null,
              attachmentName: null,
              attachmentContext: null,
              hasAttachmentBeenSubmittedAlongWithAPrompt: false,
              haveVictoryConditionsBeenFulfilled: false,
            },
          ]);
          expect(llmPostPromptScope.isDone()).to.be.true;
        });
        it('should release chat resource', async function () {
          // given
          const chat = new Chat({
            id: chatId,
            userId: 123,
            configurationId,
            configuration,
            hasAttachmentContextBeenAdded: false,
            messages: [buildBasicUserMessage('coucou user1', 0), buildBasicAssistantMessage('coucou LLM1', 1)],
          });
          await createChat(chat.toDTO());
          const llmPostPromptScope = nock('https://llm-test.pix.fr/api')
            .post('/chat', {
              configuration: {
                challenge: {
                  inputMaxPrompts: 100,
                  inputMaxChars: 255,
                },
              },
              history: [
                { content: 'coucou user1', role: 'user' },
                { content: 'coucou LLM1', role: 'assistant' },
              ],
              prompt: 'un message',
            })
            .reply(
              201,
              Readable.from([
                '60:{"ceci":"nest pas important","message":"coucou c\'est super"}',
                '40:{"message":"\\nle couscous c plutot bon"}47:{"message":" mais la paella c pas mal aussi\\n"}',
                '29:{"jecrois":{"que":"jaifini"}}',
              ]),
            )
            .post('/chat')
            .reply(201, Readable.from(['69:{"ceci":"nest pas important","message":"coucou c\'est vraiment super"}']));

          // when
          await promptChat({
            chatId,
            userId: 123,
            message: 'un message',
            attachmentName: null,
            ...dependencies,
          });

          // then
          await waitForStreamFinalizationToBeDone();
          await promptChat({
            chatId,
            userId: 123,
            message: 'un autre message',
            attachmentName: null,
            ...dependencies,
          });
          await waitForStreamFinalizationToBeDone();

          const { chatDB, messagesDB } = await getChatAndMessagesFromDB(chatId);
          expect(chatDB).to.deep.equal({
            id: chatId,
            userId: 123,
            configId: 'uneConfigQuiExist',
            configContent: {
              challenge: {
                inputMaxPrompts: 100,
                inputMaxChars: 255,
              },
            },
            hasAttachmentContextBeenAdded: false,
            totalInputTokens: 0,
            totalOutputTokens: 0,
          });
          expect(messagesDB).to.deep.equal([
            {
              index: 0,
              content: 'coucou user1',
              emitter: 'user',
              shouldBeRenderedInPreview: true,
              shouldBeForwardedToLLM: true,
              shouldBeCountedAsAPrompt: true,
              wasModerated: null,
              hasErrorOccurred: null,
              attachmentName: null,
              attachmentContext: null,
              hasAttachmentBeenSubmittedAlongWithAPrompt: false,
              haveVictoryConditionsBeenFulfilled: false,
            },
            {
              index: 1,
              content: 'coucou LLM1',
              emitter: 'assistant',
              shouldBeRenderedInPreview: true,
              shouldBeForwardedToLLM: true,
              shouldBeCountedAsAPrompt: false,
              wasModerated: null,
              hasErrorOccurred: null,
              attachmentName: null,
              attachmentContext: null,
              hasAttachmentBeenSubmittedAlongWithAPrompt: false,
              haveVictoryConditionsBeenFulfilled: false,
            },
            {
              index: 2,
              content: 'un message',
              emitter: 'user',
              shouldBeRenderedInPreview: true,
              shouldBeForwardedToLLM: true,
              shouldBeCountedAsAPrompt: true,
              wasModerated: false,
              hasErrorOccurred: null,
              attachmentName: null,
              attachmentContext: null,
              hasAttachmentBeenSubmittedAlongWithAPrompt: false,
              haveVictoryConditionsBeenFulfilled: false,
            },
            {
              index: 3,
              content: "coucou c'est super\nle couscous c plutot bon mais la paella c pas mal aussi\n",
              emitter: 'assistant',
              shouldBeRenderedInPreview: true,
              shouldBeForwardedToLLM: true,
              shouldBeCountedAsAPrompt: false,
              hasErrorOccurred: false,
              wasModerated: null,
              attachmentName: null,
              attachmentContext: null,
              hasAttachmentBeenSubmittedAlongWithAPrompt: false,
              haveVictoryConditionsBeenFulfilled: false,
            },
            {
              index: 4,
              content: 'un autre message',
              emitter: 'user',
              shouldBeRenderedInPreview: true,
              shouldBeForwardedToLLM: true,
              shouldBeCountedAsAPrompt: true,
              wasModerated: false,
              hasErrorOccurred: null,
              attachmentName: null,
              attachmentContext: null,
              hasAttachmentBeenSubmittedAlongWithAPrompt: false,
              haveVictoryConditionsBeenFulfilled: false,
            },
            {
              index: 5,
              content: "coucou c'est vraiment super",
              emitter: 'assistant',
              shouldBeRenderedInPreview: true,
              shouldBeForwardedToLLM: true,
              shouldBeCountedAsAPrompt: false,
              hasErrorOccurred: false,
              wasModerated: null,
              attachmentName: null,
              attachmentContext: null,
              hasAttachmentBeenSubmittedAlongWithAPrompt: false,
              haveVictoryConditionsBeenFulfilled: false,
            },
          ]);
          expect(llmPostPromptScope.isDone()).to.be.true;
        });
      });

      context('when attachmentName is provided', function () {
        context('when no attachmentName is expected for the given configuration', function () {
          it('should throw a NoAttachmentNeededError', async function () {
            // given
            const chat = new Chat({
              id: chatId,
              userId: 123,
              configurationId,
              configuration,
              hasAttachmentContextBeenAdded: false,
              messages: [
                buildBasicUserMessage('coucou user1', 0),
                buildBasicAssistantMessage('coucou LLM2', 1),
                buildBasicUserMessage('coucou user2', 2),
              ],
            });
            await createChat(chat.toDTO());

            // when
            const err = await catchErr(promptChat)({
              chatId,
              userId: 123,
              message: 'un message',
              attachmentName: 'un_attachment.pdf',
              ...dependencies,
            });

            // then
            expect(err).to.be.instanceOf(NoAttachmentNeededError);
            expect(err.message).to.equal(
              'Attachment has been provided but is not expected for the given configuration',
            );
          });
        });

        context('when attachmentName is not the expected one for the given configuration', function () {
          context('when the context for this attachmentName has already been added', function () {
            it(
              'should return a stream which will contain the attachment event and the llm response while ' +
                'adding a fictional wrong attachment message from user that will not be send to llm, just persisted',
              async function () {
                // given
                const chat = new Chat({
                  id: chatId,
                  userId: 123,
                  configurationId,
                  configuration: configurationWithAttachment,
                  hasAttachmentContextBeenAdded: true,
                  messages: [
                    buildBasicUserMessage('coucou user1', 0),
                    buildBasicAssistantMessage('coucou LLM1', 1),
                    new Message({
                      index: 2,
                      attachmentName: 'expected_file.txt',
                      isFromUser: true,
                      shouldBeRenderedInPreview: true,
                      shouldBeForwardedToLLM: true,
                      shouldBeCountedAsAPrompt: false,
                      hasAttachmentBeenSubmittedAlongWithAPrompt: true,
                    }),
                    new Message({
                      index: 3,
                      attachmentName: 'expected_file.txt',
                      attachmentContext: 'add me in the chat !',
                      isFromUser: false,
                      shouldBeRenderedInPreview: false,
                      shouldBeForwardedToLLM: true,
                      shouldBeCountedAsAPrompt: false,
                    }),
                    buildBasicUserMessage('coucou user2', 4),
                    buildBasicAssistantMessage('coucou LLM2', 5),
                  ],
                });
                await createChat(chat.toDTO());
                const llmPostPromptScope = nock('https://llm-test.pix.fr/api')
                  .post('/chat', {
                    configuration: {
                      challenge: {
                        inputMaxPrompts: 100,
                        inputMaxChars: 255,
                      },
                      attachment: {
                        name: 'expected_file.txt',
                        context: 'add me in the chat !',
                      },
                    },
                    history: [
                      { content: 'coucou user1', role: 'user' },
                      { content: 'coucou LLM1', role: 'assistant' },
                      {
                        content:
                          "<system_notification>L'utilisateur a téléversé une pièce jointe : <attachment_name>expected_file.txt</attachment_name></system_notification>",
                        role: 'user',
                      },
                      {
                        content:
                          '<read_attachment_tool>Lecture de la pièce jointe, expected_file.txt : <attachment_content>add me in the chat !</attachment_content></read_attachment_tool>',
                        role: 'assistant',
                      },
                      { content: 'coucou user2', role: 'user' },
                      { content: 'coucou LLM2', role: 'assistant' },
                    ],
                    prompt: 'un message',
                  })
                  .reply(
                    201,
                    Readable.from([
                      '60:{"ceci":"nest pas important","message":"coucou c\'est super"}',
                      '40:{"message":"\\nle couscous c plutot bon"}47:{"message":" mais la paella c pas mal aussi\\n"}',
                      '29:{"jecrois":{"que":"jaifini"}}',
                    ]),
                  );

                // when
                const stream = await promptChat({
                  chatId,
                  userId: 123,
                  message: 'un message',
                  attachmentName: 'wrong_file.txt',
                  ...dependencies,
                });

                // then
                const parts = [];
                const decoder = new TextDecoder();
                for await (const chunk of stream) {
                  parts.push(decoder.decode(chunk));
                }
                await waitForStreamFinalizationToBeDone();
                const llmResponse = parts.join('');
                const attachmentMessage = 'event: attachment-failure\ndata: \n\n';
                const llmMessage =
                  "data: coucou c'est super\n\ndata: \ndata: le couscous c plutot bon\n\ndata:  mais la paella c pas mal aussi\ndata: \n\n";
                const promptsLeft = 'event: user-prompts-left\ndata: 97\n\n';
                expect(llmResponse).to.deep.equal(attachmentMessage + llmMessage + promptsLeft);

                const { chatDB, messagesDB } = await getChatAndMessagesFromDB(chatId);
                expect(chatDB).to.deep.equal({
                  id: chatId,
                  userId: 123,
                  configId: 'uneConfigQuiExist',
                  configContent: {
                    challenge: {
                      inputMaxPrompts: 100,
                      inputMaxChars: 255,
                    },
                    attachment: {
                      name: 'expected_file.txt',
                      context: 'add me in the chat !',
                    },
                  },
                  hasAttachmentContextBeenAdded: true,
                  totalInputTokens: 0,
                  totalOutputTokens: 0,
                });
                expect(messagesDB).to.deep.equal([
                  {
                    index: 0,
                    content: 'coucou user1',
                    emitter: 'user',
                    shouldBeRenderedInPreview: true,
                    shouldBeForwardedToLLM: true,
                    shouldBeCountedAsAPrompt: true,
                    wasModerated: null,
                    hasErrorOccurred: null,
                    hasAttachmentBeenSubmittedAlongWithAPrompt: false,
                    haveVictoryConditionsBeenFulfilled: false,
                    attachmentContext: null,
                    attachmentName: null,
                  },
                  {
                    index: 1,
                    content: 'coucou LLM1',
                    emitter: 'assistant',
                    shouldBeRenderedInPreview: true,
                    shouldBeForwardedToLLM: true,
                    shouldBeCountedAsAPrompt: false,
                    wasModerated: null,
                    hasErrorOccurred: null,
                    hasAttachmentBeenSubmittedAlongWithAPrompt: false,
                    haveVictoryConditionsBeenFulfilled: false,
                    attachmentContext: null,
                    attachmentName: null,
                  },
                  {
                    index: 2,
                    attachmentName: 'expected_file.txt',
                    attachmentContext: null,
                    content: null,
                    emitter: 'user',
                    shouldBeRenderedInPreview: true,
                    shouldBeForwardedToLLM: true,
                    shouldBeCountedAsAPrompt: false,
                    hasAttachmentBeenSubmittedAlongWithAPrompt: true,
                    haveVictoryConditionsBeenFulfilled: false,
                    wasModerated: null,
                    hasErrorOccurred: null,
                  },
                  {
                    index: 3,
                    content: null,
                    attachmentName: 'expected_file.txt',
                    attachmentContext: 'add me in the chat !',
                    emitter: 'assistant',
                    shouldBeRenderedInPreview: false,
                    shouldBeForwardedToLLM: true,
                    shouldBeCountedAsAPrompt: false,
                    hasAttachmentBeenSubmittedAlongWithAPrompt: false,
                    haveVictoryConditionsBeenFulfilled: false,
                    hasErrorOccurred: null,
                    wasModerated: null,
                  },
                  {
                    index: 4,
                    content: 'coucou user2',
                    emitter: 'user',
                    shouldBeRenderedInPreview: true,
                    shouldBeForwardedToLLM: true,
                    shouldBeCountedAsAPrompt: true,
                    attachmentContext: null,
                    attachmentName: null,
                    hasAttachmentBeenSubmittedAlongWithAPrompt: false,
                    haveVictoryConditionsBeenFulfilled: false,
                    hasErrorOccurred: null,
                    wasModerated: null,
                  },
                  {
                    index: 5,
                    content: 'coucou LLM2',
                    emitter: 'assistant',
                    shouldBeRenderedInPreview: true,
                    shouldBeForwardedToLLM: true,
                    shouldBeCountedAsAPrompt: false,
                    attachmentContext: null,
                    attachmentName: null,
                    hasAttachmentBeenSubmittedAlongWithAPrompt: false,
                    haveVictoryConditionsBeenFulfilled: false,
                    hasErrorOccurred: null,
                    wasModerated: null,
                  },
                  {
                    index: 6,
                    attachmentName: 'wrong_file.txt',
                    content: null,
                    emitter: 'user',
                    shouldBeForwardedToLLM: false,
                    shouldBeRenderedInPreview: true,
                    shouldBeCountedAsAPrompt: false,
                    hasAttachmentBeenSubmittedAlongWithAPrompt: true,
                    haveVictoryConditionsBeenFulfilled: false,
                    attachmentContext: null,
                    hasErrorOccurred: null,
                    wasModerated: null,
                  },
                  {
                    index: 7,
                    content: 'un message',
                    emitter: 'user',
                    shouldBeForwardedToLLM: true,
                    shouldBeRenderedInPreview: true,
                    shouldBeCountedAsAPrompt: true,
                    wasModerated: false,
                    hasAttachmentBeenSubmittedAlongWithAPrompt: false,
                    haveVictoryConditionsBeenFulfilled: false,
                    attachmentContext: null,
                    hasErrorOccurred: null,
                    attachmentName: null,
                  },
                  {
                    index: 8,
                    content: "coucou c'est super\nle couscous c plutot bon mais la paella c pas mal aussi\n",
                    emitter: 'assistant',
                    shouldBeForwardedToLLM: true,
                    shouldBeRenderedInPreview: true,
                    shouldBeCountedAsAPrompt: false,
                    hasErrorOccurred: false,
                    wasModerated: null,
                    hasAttachmentBeenSubmittedAlongWithAPrompt: false,
                    haveVictoryConditionsBeenFulfilled: false,
                    attachmentContext: null,
                    attachmentName: null,
                  },
                ]);
                expect(llmPostPromptScope.isDone()).to.be.true;
              },
            );
          });

          context('when the context for this attachmentName has not been added yet', function () {
            it('should return a stream which will contain only the attachment-failure event, it will not forward the prompt to the llm but still persist the new message', async function () {
              // given
              const chat = new Chat({
                id: chatId,
                userId: 123,
                configurationId,
                configuration: configurationWithAttachment,
                hasAttachmentContextBeenAdded: false,
                messages: [buildBasicUserMessage('coucou user1', 0), buildBasicAssistantMessage('coucou LLM1', 1)],
              });
              await createChat(chat.toDTO());

              // when
              const stream = await promptChat({
                chatId,
                userId: 123,
                message: 'un message',
                attachmentName: 'wrong_file.txt',
                ...dependencies,
              });

              // then
              const parts = [];
              const decoder = new TextDecoder();
              for await (const chunk of stream) {
                parts.push(decoder.decode(chunk));
              }
              await waitForStreamFinalizationToBeDone();
              const llmResponse = parts.join('');
              const attachmentMessage = 'event: attachment-failure\ndata: \n\n';
              const promptsLeft = 'event: user-prompts-left\ndata: 98\n\n';
              expect(llmResponse).to.deep.equal(attachmentMessage + promptsLeft);

              const { chatDB, messagesDB } = await getChatAndMessagesFromDB(chatId);
              expect(chatDB).to.deep.equal({
                id: chatId,
                userId: 123,
                configId: 'uneConfigQuiExist',
                configContent: {
                  challenge: {
                    inputMaxPrompts: 100,
                    inputMaxChars: 255,
                  },
                  attachment: {
                    name: 'expected_file.txt',
                    context: 'add me in the chat !',
                  },
                },
                hasAttachmentContextBeenAdded: false,
                totalInputTokens: 0,
                totalOutputTokens: 0,
              });
              expect(messagesDB).to.deep.equal([
                {
                  index: 0,
                  content: 'coucou user1',
                  emitter: 'user',
                  shouldBeRenderedInPreview: true,
                  shouldBeForwardedToLLM: true,
                  shouldBeCountedAsAPrompt: true,
                  attachmentName: null,
                  attachmentContext: null,
                  hasAttachmentBeenSubmittedAlongWithAPrompt: false,
                  hasErrorOccurred: null,
                  haveVictoryConditionsBeenFulfilled: false,
                  wasModerated: null,
                },
                {
                  index: 1,
                  content: 'coucou LLM1',
                  emitter: 'assistant',
                  shouldBeRenderedInPreview: true,
                  shouldBeForwardedToLLM: true,
                  shouldBeCountedAsAPrompt: false,
                  attachmentName: null,
                  attachmentContext: null,
                  hasAttachmentBeenSubmittedAlongWithAPrompt: false,
                  hasErrorOccurred: null,
                  haveVictoryConditionsBeenFulfilled: false,
                  wasModerated: null,
                },
                {
                  index: 2,
                  attachmentName: 'wrong_file.txt',
                  content: null,
                  emitter: 'user',
                  shouldBeRenderedInPreview: true,
                  shouldBeForwardedToLLM: false,
                  shouldBeCountedAsAPrompt: false,
                  hasAttachmentBeenSubmittedAlongWithAPrompt: true,
                  attachmentContext: null,
                  hasErrorOccurred: null,
                  haveVictoryConditionsBeenFulfilled: false,
                  wasModerated: null,
                },
                {
                  index: 3,
                  content: 'un message',
                  emitter: 'user',
                  shouldBeRenderedInPreview: true,
                  shouldBeForwardedToLLM: false,
                  shouldBeCountedAsAPrompt: false,
                  wasModerated: false,
                  attachmentName: null,
                  attachmentContext: null,
                  hasAttachmentBeenSubmittedAlongWithAPrompt: false,
                  hasErrorOccurred: null,
                  haveVictoryConditionsBeenFulfilled: false,
                },
              ]);
            });
          });
        });

        context('when attachmentName is the expected one for the given configuration', function () {
          context('when the context for this attachmentName has already been added', function () {
            it(
              'should return a stream which will contain the attachment event and the llm response while ' +
                'only adding a fictional user message that will not be send to the LLM, but persisted. Thus, it should re-send the context to the LLM',
              async function () {
                // given
                const chat = new Chat({
                  id: chatId,
                  userId: 123,
                  configurationId,
                  configuration: configurationWithAttachment,
                  hasAttachmentContextBeenAdded: true,
                  messages: [
                    buildBasicUserMessage('coucou user1', 0),
                    buildBasicAssistantMessage('coucou LLM1', 1),
                    new Message({
                      index: 2,
                      attachmentName: 'expected_file.txt',
                      isFromUser: true,
                      shouldBeRenderedInPreview: true,
                      shouldBeForwardedToLLM: true,
                      shouldBeCountedAsAPrompt: false,
                      hasAttachmentBeenSubmittedAlongWithAPrompt: true,
                    }),
                    new Message({
                      index: 3,
                      attachmentName: 'expected_file.txt',
                      attachmentContext: 'add me in the chat !',
                      isFromUser: false,
                      shouldBeRenderedInPreview: false,
                      shouldBeForwardedToLLM: true,
                      shouldBeCountedAsAPrompt: false,
                    }),
                    buildBasicUserMessage('coucou user2', 4),
                    buildBasicAssistantMessage('coucou LLM2', 5),
                  ],
                });
                await createChat(chat.toDTO());
                const llmPostPromptScope = nock('https://llm-test.pix.fr/api')
                  .post('/chat', {
                    configuration: {
                      challenge: {
                        inputMaxPrompts: 100,
                        inputMaxChars: 255,
                      },
                      attachment: {
                        name: 'expected_file.txt',
                        context: 'add me in the chat !',
                      },
                    },
                    history: [
                      { content: 'coucou user1', role: 'user' },
                      { content: 'coucou LLM1', role: 'assistant' },
                      {
                        content:
                          "<system_notification>L'utilisateur a téléversé une pièce jointe : <attachment_name>expected_file.txt</attachment_name></system_notification>",
                        role: 'user',
                      },
                      {
                        content:
                          '<read_attachment_tool>Lecture de la pièce jointe, expected_file.txt : <attachment_content>add me in the chat !</attachment_content></read_attachment_tool>',
                        role: 'assistant',
                      },
                      { content: 'coucou user2', role: 'user' },
                      { content: 'coucou LLM2', role: 'assistant' },
                    ],
                    prompt: 'un message',
                  })
                  .reply(
                    201,
                    Readable.from([
                      '60:{"ceci":"nest pas important","message":"coucou c\'est super"}',
                      '40:{"message":"\\nle couscous c plutot bon"}47:{"message":" mais la paella c pas mal aussi\\n"}',
                      '29:{"jecrois":{"que":"jaifini"}}',
                    ]),
                  );

                // when
                const stream = await promptChat({
                  chatId,
                  userId: 123,
                  message: 'un message',
                  attachmentName: 'expected_file.txt',
                  ...dependencies,
                });

                // then
                const parts = [];
                const decoder = new TextDecoder();
                for await (const chunk of stream) {
                  parts.push(decoder.decode(chunk));
                }
                await waitForStreamFinalizationToBeDone();
                const llmResponse = parts.join('');
                const attachmentMessage = 'event: attachment-success\ndata: \n\n';
                const llmMessage =
                  "data: coucou c'est super\n\ndata: \ndata: le couscous c plutot bon\n\ndata:  mais la paella c pas mal aussi\ndata: \n\n";
                const promptsLeft = 'event: user-prompts-left\ndata: 97\n\n';
                expect(llmResponse).to.deep.equal(attachmentMessage + llmMessage + promptsLeft);
                const { chatDB, messagesDB } = await getChatAndMessagesFromDB(chatId);

                expect(chatDB).to.deep.equal({
                  id: chatId,
                  userId: 123,
                  configId: 'uneConfigQuiExist',
                  configContent: {
                    challenge: {
                      inputMaxPrompts: 100,
                      inputMaxChars: 255,
                    },
                    attachment: {
                      name: 'expected_file.txt',
                      context: 'add me in the chat !',
                    },
                  },
                  hasAttachmentContextBeenAdded: true,
                  totalInputTokens: 0,
                  totalOutputTokens: 0,
                });
                expect(messagesDB).to.deep.equal([
                  {
                    index: 0,
                    content: 'coucou user1',
                    emitter: 'user',
                    shouldBeRenderedInPreview: true,
                    shouldBeForwardedToLLM: true,
                    shouldBeCountedAsAPrompt: true,
                    attachmentName: null,
                    attachmentContext: null,
                    hasAttachmentBeenSubmittedAlongWithAPrompt: false,
                    hasErrorOccurred: null,
                    haveVictoryConditionsBeenFulfilled: false,
                    wasModerated: null,
                  },
                  {
                    index: 1,
                    content: 'coucou LLM1',
                    emitter: 'assistant',
                    shouldBeRenderedInPreview: true,
                    shouldBeForwardedToLLM: true,
                    shouldBeCountedAsAPrompt: false,
                    attachmentName: null,
                    attachmentContext: null,
                    hasAttachmentBeenSubmittedAlongWithAPrompt: false,
                    hasErrorOccurred: null,
                    haveVictoryConditionsBeenFulfilled: false,
                    wasModerated: null,
                  },
                  {
                    index: 2,
                    attachmentName: 'expected_file.txt',
                    emitter: 'user',
                    shouldBeRenderedInPreview: true,
                    shouldBeForwardedToLLM: true,
                    shouldBeCountedAsAPrompt: false,
                    hasAttachmentBeenSubmittedAlongWithAPrompt: true,
                    attachmentContext: null,
                    hasErrorOccurred: null,
                    wasModerated: null,
                    haveVictoryConditionsBeenFulfilled: false,
                    content: null,
                  },
                  {
                    index: 3,
                    attachmentName: 'expected_file.txt',
                    attachmentContext: 'add me in the chat !',
                    emitter: 'assistant',
                    shouldBeRenderedInPreview: false,
                    shouldBeForwardedToLLM: true,
                    shouldBeCountedAsAPrompt: false,
                    hasAttachmentBeenSubmittedAlongWithAPrompt: false,
                    hasErrorOccurred: null,
                    haveVictoryConditionsBeenFulfilled: false,
                    wasModerated: null,
                    content: null,
                  },
                  {
                    index: 4,
                    content: 'coucou user2',
                    emitter: 'user',
                    shouldBeRenderedInPreview: true,
                    shouldBeForwardedToLLM: true,
                    shouldBeCountedAsAPrompt: true,
                    attachmentName: null,
                    attachmentContext: null,
                    hasAttachmentBeenSubmittedAlongWithAPrompt: false,
                    hasErrorOccurred: null,
                    haveVictoryConditionsBeenFulfilled: false,
                    wasModerated: null,
                  },
                  {
                    index: 5,
                    content: 'coucou LLM2',
                    emitter: 'assistant',
                    shouldBeRenderedInPreview: true,
                    shouldBeForwardedToLLM: true,
                    shouldBeCountedAsAPrompt: false,
                    attachmentName: null,
                    attachmentContext: null,
                    hasAttachmentBeenSubmittedAlongWithAPrompt: false,
                    hasErrorOccurred: null,
                    haveVictoryConditionsBeenFulfilled: false,
                    wasModerated: null,
                  },
                  {
                    index: 6,
                    attachmentName: 'expected_file.txt',
                    emitter: 'user',
                    shouldBeRenderedInPreview: true,
                    shouldBeForwardedToLLM: false,
                    shouldBeCountedAsAPrompt: false,
                    hasAttachmentBeenSubmittedAlongWithAPrompt: true,
                    attachmentContext: null,
                    hasErrorOccurred: null,
                    haveVictoryConditionsBeenFulfilled: false,
                    wasModerated: null,
                    content: null,
                  },
                  {
                    index: 7,
                    content: 'un message',
                    emitter: 'user',
                    shouldBeRenderedInPreview: true,
                    shouldBeForwardedToLLM: true,
                    shouldBeCountedAsAPrompt: true,
                    wasModerated: false,
                    attachmentName: null,
                    attachmentContext: null,
                    hasAttachmentBeenSubmittedAlongWithAPrompt: false,
                    hasErrorOccurred: null,
                    haveVictoryConditionsBeenFulfilled: false,
                  },
                  {
                    index: 8,
                    content: "coucou c'est super\nle couscous c plutot bon mais la paella c pas mal aussi\n",
                    emitter: 'assistant',
                    shouldBeRenderedInPreview: true,
                    shouldBeForwardedToLLM: true,
                    shouldBeCountedAsAPrompt: false,
                    hasErrorOccurred: false,
                    attachmentName: null,
                    attachmentContext: null,
                    hasAttachmentBeenSubmittedAlongWithAPrompt: false,
                    haveVictoryConditionsBeenFulfilled: false,
                    wasModerated: null,
                  },
                ]);
                expect(llmPostPromptScope.isDone()).to.be.true;
              },
            );
          });

          context('when the context for this attachmentName has not been added yet', function () {
            it(
              'should return a stream which will contain the attachment event and the llm response while ' +
                'adding the attachment context in the conversation',
              async function () {
                // given
                const chat = new Chat({
                  id: chatId,
                  userId: 123,
                  configurationId,
                  configuration: configurationWithAttachment,
                  hasAttachmentContextBeenAdded: false,
                  messages: [buildBasicUserMessage('coucou user1', 0), buildBasicAssistantMessage('coucou LLM1', 1)],
                });
                await createChat(chat.toDTO());
                const llmPostPromptScope = nock('https://llm-test.pix.fr/api')
                  .post('/chat', {
                    configuration: {
                      challenge: {
                        inputMaxPrompts: 100,
                        inputMaxChars: 255,
                      },
                      attachment: {
                        name: 'expected_file.txt',
                        context: 'add me in the chat !',
                      },
                    },
                    history: [
                      { content: 'coucou user1', role: 'user' },
                      { content: 'coucou LLM1', role: 'assistant' },
                      {
                        content:
                          "<system_notification>L'utilisateur a téléversé une pièce jointe : <attachment_name>expected_file.txt</attachment_name></system_notification>",
                        role: 'user',
                      },
                      {
                        content:
                          '<read_attachment_tool>Lecture de la pièce jointe, expected_file.txt : <attachment_content>add me in the chat !</attachment_content></read_attachment_tool>',
                        role: 'assistant',
                      },
                    ],
                    prompt: 'un message',
                  })
                  .reply(
                    201,
                    Readable.from([
                      '60:{"ceci":"nest pas important","message":"coucou c\'est super"}',
                      '40:{"message":"\\nle couscous c plutot bon"}47:{"message":" mais la paella c pas mal aussi\\n"}',
                      '29:{"jecrois":{"que":"jaifini"}}',
                    ]),
                  );

                // when
                const stream = await promptChat({
                  chatId,
                  userId: 123,
                  message: 'un message',
                  attachmentName: 'expected_file.txt',
                  ...dependencies,
                });

                // then
                const parts = [];
                const decoder = new TextDecoder();
                for await (const chunk of stream) {
                  parts.push(decoder.decode(chunk));
                }
                await waitForStreamFinalizationToBeDone();
                const llmResponse = parts.join('');
                const attachmentMessage = 'event: attachment-success\ndata: \n\n';
                const llmMessage =
                  "data: coucou c'est super\n\ndata: \ndata: le couscous c plutot bon\n\ndata:  mais la paella c pas mal aussi\ndata: \n\n";
                const promptsLeft = 'event: user-prompts-left\ndata: 98\n\n';
                expect(llmResponse).to.deep.equal(attachmentMessage + llmMessage + promptsLeft);

                const { chatDB, messagesDB } = await getChatAndMessagesFromDB(chatId);
                expect(chatDB).to.deep.equal({
                  id: chatId,
                  userId: 123,
                  configId: 'uneConfigQuiExist',
                  configContent: {
                    challenge: {
                      inputMaxPrompts: 100,
                      inputMaxChars: 255,
                    },
                    attachment: {
                      name: 'expected_file.txt',
                      context: 'add me in the chat !',
                    },
                  },
                  hasAttachmentContextBeenAdded: true,
                  totalInputTokens: 0,
                  totalOutputTokens: 0,
                });
                expect(messagesDB).to.deep.equal([
                  {
                    index: 0,
                    content: 'coucou user1',
                    emitter: 'user',
                    shouldBeRenderedInPreview: true,
                    shouldBeForwardedToLLM: true,
                    shouldBeCountedAsAPrompt: true,
                    attachmentName: null,
                    attachmentContext: null,
                    hasAttachmentBeenSubmittedAlongWithAPrompt: false,
                    haveVictoryConditionsBeenFulfilled: false,
                    hasErrorOccurred: null,
                    wasModerated: null,
                  },
                  {
                    index: 1,
                    content: 'coucou LLM1',
                    emitter: 'assistant',
                    shouldBeRenderedInPreview: true,
                    shouldBeForwardedToLLM: true,
                    shouldBeCountedAsAPrompt: false,
                    attachmentName: null,
                    attachmentContext: null,
                    hasAttachmentBeenSubmittedAlongWithAPrompt: false,
                    haveVictoryConditionsBeenFulfilled: false,
                    hasErrorOccurred: null,
                    wasModerated: null,
                  },
                  {
                    index: 2,
                    attachmentName: 'expected_file.txt',
                    emitter: 'user',
                    shouldBeRenderedInPreview: true,
                    shouldBeForwardedToLLM: true,
                    shouldBeCountedAsAPrompt: false,
                    hasAttachmentBeenSubmittedAlongWithAPrompt: true,
                    attachmentContext: null,
                    hasErrorOccurred: null,
                    haveVictoryConditionsBeenFulfilled: false,
                    wasModerated: null,
                    content: null,
                  },
                  {
                    index: 3,
                    attachmentName: 'expected_file.txt',
                    attachmentContext: 'add me in the chat !',
                    emitter: 'assistant',
                    shouldBeRenderedInPreview: false,
                    shouldBeForwardedToLLM: true,
                    shouldBeCountedAsAPrompt: false,
                    hasAttachmentBeenSubmittedAlongWithAPrompt: false,
                    hasErrorOccurred: null,
                    haveVictoryConditionsBeenFulfilled: false,
                    wasModerated: null,
                    content: null,
                  },
                  {
                    index: 4,
                    content: 'un message',
                    emitter: 'user',
                    shouldBeRenderedInPreview: true,
                    shouldBeForwardedToLLM: true,
                    shouldBeCountedAsAPrompt: true,
                    wasModerated: false,
                    attachmentName: null,
                    attachmentContext: null,
                    hasAttachmentBeenSubmittedAlongWithAPrompt: false,
                    hasErrorOccurred: null,
                    haveVictoryConditionsBeenFulfilled: false,
                  },
                  {
                    index: 5,
                    content: "coucou c'est super\nle couscous c plutot bon mais la paella c pas mal aussi\n",
                    emitter: 'assistant',
                    shouldBeRenderedInPreview: true,
                    shouldBeForwardedToLLM: true,
                    shouldBeCountedAsAPrompt: false,
                    hasErrorOccurred: false,
                    attachmentName: null,
                    attachmentContext: null,
                    hasAttachmentBeenSubmittedAlongWithAPrompt: false,
                    haveVictoryConditionsBeenFulfilled: false,
                    wasModerated: null,
                  },
                ]);
                expect(llmPostPromptScope.isDone()).to.be.true;
              },
            );
          });
        });
      });
    });

    context('when no prompt is provided', function () {
      context('when no attachmentName is provided', function () {
        it('should throw a NoAttachmentNorMessageProvidedError', async function () {
          // given
          const chat = new Chat({
            id: chatId,
            userId: 123,
            configurationId: 'uneConfigQuiExist',
            configuration: new Configuration({}),
            hasAttachmentContextBeenAdded: false,
            messages: [buildBasicUserMessage('coucou user1', 0), buildBasicAssistantMessage('coucou LLM2', 1)],
          });
          await createChat(chat.toDTO());

          // when
          const err = await catchErr(promptChat)({
            chatId,
            userId: 123,
            message: null,
            attachmentName: null,
            ...dependencies,
          });

          // then
          expect(err).to.be.instanceOf(NoAttachmentNorMessageProvidedError);
          expect(err.message).to.equal('At least a message or an attachment, if applicable, must be provided');
        });
      });

      context('when attachmentName is provided', function () {
        context('when no attachmentName is expected for the given configuration', function () {
          it('should throw a NoAttachmentNeededError', async function () {
            // given
            const chat = new Chat({
              id: chatId,
              userId: 123,
              configurationId,
              configuration,
              hasAttachmentContextBeenAdded: false,
              messages: [
                buildBasicUserMessage('coucou user1', 0),
                buildBasicAssistantMessage('coucou LLM2', 1),
                buildBasicUserMessage('coucou user2', 2),
              ],
            });
            await createChat(chat.toDTO());

            // when
            const err = await catchErr(promptChat)({
              chatId,
              userId: 123,
              message: null,
              attachmentName: 'un_attachment.pdf',
              ...dependencies,
            });

            // then
            expect(err).to.be.instanceOf(NoAttachmentNeededError);
            expect(err.message).to.equal(
              'Attachment has been provided but is not expected for the given configuration',
            );
          });
        });

        context('when attachmentName is not the expected one for the given configuration', function () {
          context('when the context for the expected attachmentName has already been added', function () {
            it('should return a stream which will contain the attachment event and add a fictional wrong attachment message from user that will not be send to the LLM but persisted', async function () {
              // given
              const chat = new Chat({
                id: chatId,
                userId: 123,
                configurationId,
                configuration: configurationWithAttachment,
                hasAttachmentContextBeenAdded: true,
                messages: [
                  buildBasicUserMessage('coucou user1', 0),
                  buildBasicAssistantMessage('coucou LLM1', 1),
                  new Message({
                    index: 2,
                    attachmentName: 'expected_file.txt',
                    isFromUser: true,
                    shouldBeRenderedInPreview: true,
                    shouldBeForwardedToLLM: true,
                    shouldBeCountedAsAPrompt: false,
                    hasAttachmentBeenSubmittedAlongWithAPrompt: true,
                  }),
                  new Message({
                    index: 3,
                    attachmentName: 'expected_file.txt',
                    attachmentContext: 'add me in the chat !',
                    isFromUser: false,
                    shouldBeRenderedInPreview: false,
                    shouldBeForwardedToLLM: true,
                    shouldBeCountedAsAPrompt: false,
                  }),
                  buildBasicUserMessage('coucou user2', 4),
                  buildBasicAssistantMessage('coucou LLM2', 5),
                ],
              });
              await createChat(chat.toDTO());

              // when
              const stream = await promptChat({
                chatId,
                userId: 123,
                message: null,
                attachmentName: 'wrong_file.txt',
                ...dependencies,
              });
              // then
              const parts = [];
              const decoder = new TextDecoder();
              for await (const chunk of stream) {
                parts.push(decoder.decode(chunk));
              }
              await waitForStreamFinalizationToBeDone();
              const llmResponse = parts.join('');
              const attachmentMessage = 'event: attachment-failure\ndata: \n\n';
              const promptsLeft = 'event: user-prompts-left\ndata: 98\n\n';
              expect(llmResponse).to.deep.equal(attachmentMessage + promptsLeft);
              const { chatDB, messagesDB } = await getChatAndMessagesFromDB(chatId);
              expect(chatDB).to.deep.equal({
                id: chatId,
                userId: 123,
                configId: 'uneConfigQuiExist',
                configContent: {
                  challenge: {
                    inputMaxPrompts: 100,
                    inputMaxChars: 255,
                  },
                  attachment: {
                    name: 'expected_file.txt',
                    context: 'add me in the chat !',
                  },
                },
                hasAttachmentContextBeenAdded: true,
                totalInputTokens: 0,
                totalOutputTokens: 0,
              });
              expect(messagesDB).to.deep.equal([
                {
                  index: 0,
                  content: 'coucou user1',
                  emitter: 'user',
                  shouldBeRenderedInPreview: true,
                  shouldBeForwardedToLLM: true,
                  shouldBeCountedAsAPrompt: true,
                  attachmentName: null,
                  attachmentContext: null,
                  hasAttachmentBeenSubmittedAlongWithAPrompt: false,
                  hasErrorOccurred: null,
                  haveVictoryConditionsBeenFulfilled: false,
                  wasModerated: null,
                },
                {
                  index: 1,
                  content: 'coucou LLM1',
                  emitter: 'assistant',
                  shouldBeRenderedInPreview: true,
                  shouldBeForwardedToLLM: true,
                  shouldBeCountedAsAPrompt: false,
                  attachmentName: null,
                  attachmentContext: null,
                  hasAttachmentBeenSubmittedAlongWithAPrompt: false,
                  hasErrorOccurred: null,
                  haveVictoryConditionsBeenFulfilled: false,
                  wasModerated: null,
                },
                {
                  index: 2,
                  attachmentName: 'expected_file.txt',
                  emitter: 'user',
                  content: null,
                  shouldBeRenderedInPreview: true,
                  shouldBeForwardedToLLM: true,
                  shouldBeCountedAsAPrompt: false,
                  hasAttachmentBeenSubmittedAlongWithAPrompt: true,
                  attachmentContext: null,
                  hasErrorOccurred: null,
                  haveVictoryConditionsBeenFulfilled: false,
                  wasModerated: null,
                },
                {
                  index: 3,
                  attachmentName: 'expected_file.txt',
                  attachmentContext: 'add me in the chat !',
                  content: null,
                  emitter: 'assistant',
                  shouldBeRenderedInPreview: false,
                  shouldBeForwardedToLLM: true,
                  shouldBeCountedAsAPrompt: false,
                  hasAttachmentBeenSubmittedAlongWithAPrompt: false,
                  hasErrorOccurred: null,
                  haveVictoryConditionsBeenFulfilled: false,
                  wasModerated: null,
                },
                {
                  index: 4,
                  content: 'coucou user2',
                  emitter: 'user',
                  shouldBeRenderedInPreview: true,
                  shouldBeForwardedToLLM: true,
                  shouldBeCountedAsAPrompt: true,
                  attachmentName: null,
                  attachmentContext: null,
                  hasAttachmentBeenSubmittedAlongWithAPrompt: false,
                  hasErrorOccurred: null,
                  haveVictoryConditionsBeenFulfilled: false,
                  wasModerated: null,
                },
                {
                  index: 5,
                  content: 'coucou LLM2',
                  emitter: 'assistant',
                  shouldBeRenderedInPreview: true,
                  shouldBeForwardedToLLM: true,
                  shouldBeCountedAsAPrompt: false,
                  attachmentName: null,
                  attachmentContext: null,
                  hasAttachmentBeenSubmittedAlongWithAPrompt: false,
                  hasErrorOccurred: null,
                  haveVictoryConditionsBeenFulfilled: false,
                  wasModerated: null,
                },
                {
                  index: 6,
                  attachmentName: 'wrong_file.txt',
                  content: null,
                  emitter: 'user',
                  shouldBeForwardedToLLM: false,
                  shouldBeRenderedInPreview: true,
                  shouldBeCountedAsAPrompt: true,
                  hasAttachmentBeenSubmittedAlongWithAPrompt: false,
                  attachmentContext: null,
                  hasErrorOccurred: null,
                  haveVictoryConditionsBeenFulfilled: false,
                  wasModerated: null,
                },
              ]);
            });
          });

          context('when the context for the expected attachmentName has not been added yet', function () {
            it('should return a stream which will contain only the attachment-failure event and still persist the new message', async function () {
              // given
              const chat = new Chat({
                id: chatId,
                userId: 123,
                configurationId,
                configuration: configurationWithAttachment,
                hasAttachmentContextBeenAdded: false,
                messages: [buildBasicUserMessage('coucou user1', 0), buildBasicAssistantMessage('coucou LLM1', 1)],
              });
              await createChat(chat.toDTO());

              // when
              const stream = await promptChat({
                chatId,
                userId: 123,
                message: null,
                attachmentName: 'wrong_file.txt',
                ...dependencies,
              });

              // then
              const parts = [];
              const decoder = new TextDecoder();
              for await (const chunk of stream) {
                parts.push(decoder.decode(chunk));
              }
              await waitForStreamFinalizationToBeDone();
              const llmResponse = parts.join('');
              const attachmentMessage = 'event: attachment-failure\ndata: \n\n';
              const promptsLeft = 'event: user-prompts-left\ndata: 98\n\n';
              expect(llmResponse).to.deep.equal(attachmentMessage + promptsLeft);
              const { chatDB, messagesDB } = await getChatAndMessagesFromDB(chatId);
              expect(chatDB).to.deep.equal({
                id: chatId,
                userId: 123,
                configId: 'uneConfigQuiExist',
                configContent: {
                  challenge: {
                    inputMaxPrompts: 100,
                    inputMaxChars: 255,
                  },
                  attachment: {
                    name: 'expected_file.txt',
                    context: 'add me in the chat !',
                  },
                },
                hasAttachmentContextBeenAdded: false,
                totalInputTokens: 0,
                totalOutputTokens: 0,
              });
              expect(messagesDB).to.deep.equal([
                {
                  index: 0,
                  content: 'coucou user1',
                  emitter: 'user',
                  shouldBeRenderedInPreview: true,
                  shouldBeForwardedToLLM: true,
                  shouldBeCountedAsAPrompt: true,
                  attachmentName: null,
                  attachmentContext: null,
                  hasAttachmentBeenSubmittedAlongWithAPrompt: false,
                  hasErrorOccurred: null,
                  haveVictoryConditionsBeenFulfilled: false,
                  wasModerated: null,
                },
                {
                  index: 1,
                  content: 'coucou LLM1',
                  emitter: 'assistant',
                  shouldBeRenderedInPreview: true,
                  shouldBeForwardedToLLM: true,
                  shouldBeCountedAsAPrompt: false,
                  attachmentName: null,
                  attachmentContext: null,
                  hasAttachmentBeenSubmittedAlongWithAPrompt: false,
                  hasErrorOccurred: null,
                  haveVictoryConditionsBeenFulfilled: false,
                  wasModerated: null,
                },
                {
                  index: 2,
                  attachmentName: 'wrong_file.txt',
                  content: null,
                  emitter: 'user',
                  shouldBeRenderedInPreview: true,
                  shouldBeForwardedToLLM: false,
                  shouldBeCountedAsAPrompt: true,
                  hasAttachmentBeenSubmittedAlongWithAPrompt: false,
                  attachmentContext: null,
                  hasErrorOccurred: null,
                  haveVictoryConditionsBeenFulfilled: false,
                  wasModerated: null,
                },
              ]);
            });
          });
        });

        context('when attachmentName is the expected one for the given configuration', function () {
          context('when the context for this attachmentName has already been added', function () {
            it(
              'should return a stream which will contain the attachment event while ' +
                'adding a fictional attachment user message that will not be send to the LLM but persisted. Thus,it wont send to the LLM the context once again',
              async function () {
                // given
                const chat = new Chat({
                  id: chatId,
                  userId: 123,
                  configurationId,
                  configuration: configurationWithAttachment,
                  hasAttachmentContextBeenAdded: true,
                  messages: [
                    buildBasicUserMessage('coucou user1', 0),
                    buildBasicAssistantMessage('coucou LLM1', 1),
                    new Message({
                      index: 2,
                      attachmentName: 'expected_file.txt',
                      isFromUser: true,
                      shouldBeRenderedInPreview: true,
                      shouldBeForwardedToLLM: true,
                      shouldBeCountedAsAPrompt: false,
                      hasAttachmentBeenSubmittedAlongWithAPrompt: true,
                    }),
                    new Message({
                      index: 3,
                      attachmentName: 'expected_file.txt',
                      attachmentContext: 'add me in the chat !',
                      isFromUser: false,
                      shouldBeRenderedInPreview: false,
                      shouldBeForwardedToLLM: true,
                      shouldBeCountedAsAPrompt: false,
                    }),
                    buildBasicUserMessage('coucou user2', 4),
                    buildBasicAssistantMessage('coucou LLM2', 5),
                  ],
                });
                await createChat(chat.toDTO());

                // when
                const stream = await promptChat({
                  chatId,
                  userId: 123,
                  message: null,
                  attachmentName: 'expected_file.txt',
                  ...dependencies,
                });

                // then
                const parts = [];
                const decoder = new TextDecoder();
                for await (const chunk of stream) {
                  parts.push(decoder.decode(chunk));
                }
                await waitForStreamFinalizationToBeDone();
                const llmResponse = parts.join('');
                const attachmentMessage = 'event: attachment-success\ndata: \n\n';
                const promptsLeft = 'event: user-prompts-left\ndata: 98\n\n';
                expect(llmResponse).to.deep.equal(attachmentMessage + promptsLeft);
                const { chatDB, messagesDB } = await getChatAndMessagesFromDB(chatId);
                expect(chatDB).to.deep.equal({
                  id: chatId,
                  userId: 123,
                  configId: 'uneConfigQuiExist',
                  configContent: {
                    challenge: {
                      inputMaxPrompts: 100,
                      inputMaxChars: 255,
                    },
                    attachment: {
                      name: 'expected_file.txt',
                      context: 'add me in the chat !',
                    },
                  },
                  hasAttachmentContextBeenAdded: true,
                  totalInputTokens: 0,
                  totalOutputTokens: 0,
                });
                expect(messagesDB).to.deep.equal([
                  {
                    index: 0,
                    content: 'coucou user1',
                    emitter: 'user',
                    shouldBeRenderedInPreview: true,
                    shouldBeForwardedToLLM: true,
                    shouldBeCountedAsAPrompt: true,
                    attachmentName: null,
                    attachmentContext: null,
                    hasAttachmentBeenSubmittedAlongWithAPrompt: false,
                    hasErrorOccurred: null,
                    haveVictoryConditionsBeenFulfilled: false,
                    wasModerated: null,
                  },
                  {
                    index: 1,
                    content: 'coucou LLM1',
                    emitter: 'assistant',
                    shouldBeRenderedInPreview: true,
                    shouldBeForwardedToLLM: true,
                    shouldBeCountedAsAPrompt: false,
                    attachmentName: null,
                    attachmentContext: null,
                    hasAttachmentBeenSubmittedAlongWithAPrompt: false,
                    hasErrorOccurred: null,
                    haveVictoryConditionsBeenFulfilled: false,
                    wasModerated: null,
                  },
                  {
                    index: 2,
                    attachmentName: 'expected_file.txt',
                    content: null,
                    emitter: 'user',
                    shouldBeRenderedInPreview: true,
                    shouldBeForwardedToLLM: true,
                    shouldBeCountedAsAPrompt: false,
                    hasAttachmentBeenSubmittedAlongWithAPrompt: true,
                    attachmentContext: null,
                    hasErrorOccurred: null,
                    haveVictoryConditionsBeenFulfilled: false,
                    wasModerated: null,
                  },
                  {
                    index: 3,
                    attachmentName: 'expected_file.txt',
                    attachmentContext: 'add me in the chat !',
                    content: null,
                    emitter: 'assistant',
                    shouldBeRenderedInPreview: false,
                    shouldBeForwardedToLLM: true,
                    shouldBeCountedAsAPrompt: false,
                    hasAttachmentBeenSubmittedAlongWithAPrompt: false,
                    hasErrorOccurred: null,
                    haveVictoryConditionsBeenFulfilled: false,
                    wasModerated: null,
                  },
                  {
                    index: 4,
                    content: 'coucou user2',
                    emitter: 'user',
                    shouldBeRenderedInPreview: true,
                    shouldBeForwardedToLLM: true,
                    shouldBeCountedAsAPrompt: true,
                    attachmentName: null,
                    attachmentContext: null,
                    hasAttachmentBeenSubmittedAlongWithAPrompt: false,
                    hasErrorOccurred: null,
                    haveVictoryConditionsBeenFulfilled: false,
                    wasModerated: null,
                  },
                  {
                    index: 5,
                    content: 'coucou LLM2',
                    emitter: 'assistant',
                    shouldBeRenderedInPreview: true,
                    shouldBeForwardedToLLM: true,
                    shouldBeCountedAsAPrompt: false,
                    attachmentName: null,
                    attachmentContext: null,
                    hasAttachmentBeenSubmittedAlongWithAPrompt: false,
                    hasErrorOccurred: null,
                    haveVictoryConditionsBeenFulfilled: false,
                    wasModerated: null,
                  },
                  {
                    index: 6,
                    attachmentName: 'expected_file.txt',
                    content: null,
                    emitter: 'user',
                    shouldBeRenderedInPreview: true,
                    shouldBeForwardedToLLM: false,
                    shouldBeCountedAsAPrompt: true,
                    hasAttachmentBeenSubmittedAlongWithAPrompt: false,
                    attachmentContext: null,
                    hasErrorOccurred: null,
                    haveVictoryConditionsBeenFulfilled: false,
                    wasModerated: null,
                  },
                ]);
              },
            );
          });

          context('when the context for this attachmentName has not been added yet', function () {
            it(
              'should return a stream which will contain the attachment event while ' +
                'adding the attachment context in the conversation',
              async function () {
                // given
                const chat = new Chat({
                  id: chatId,
                  userId: 123,
                  configurationId: 'uneConfigQuiExist',
                  configuration: configurationWithAttachment,
                  hasAttachmentContextBeenAdded: false,
                  messages: [buildBasicUserMessage('coucou user1', 0), buildBasicAssistantMessage('coucou LLM1', 1)],
                });
                await createChat(chat.toDTO());

                // when
                const stream = await promptChat({
                  chatId,
                  userId: 123,
                  message: null,
                  attachmentName: 'expected_file.txt',
                  ...dependencies,
                });

                // then
                const parts = [];
                const decoder = new TextDecoder();
                for await (const chunk of stream) {
                  parts.push(decoder.decode(chunk));
                }
                await waitForStreamFinalizationToBeDone();
                const llmResponse = parts.join('');
                const attachmentMessage = 'event: attachment-success\ndata: \n\n';
                const promptsLeft = 'event: user-prompts-left\ndata: 98\n\n';
                expect(llmResponse).to.deep.equal(attachmentMessage + promptsLeft);
                const { chatDB, messagesDB } = await getChatAndMessagesFromDB(chatId);
                expect(chatDB).to.deep.equal({
                  id: chatId,
                  userId: 123,
                  configId: 'uneConfigQuiExist',
                  configContent: {
                    challenge: {
                      inputMaxPrompts: 100,
                      inputMaxChars: 255,
                    },
                    attachment: {
                      name: 'expected_file.txt',
                      context: 'add me in the chat !',
                    },
                  },
                  hasAttachmentContextBeenAdded: true,
                  totalInputTokens: 0,
                  totalOutputTokens: 0,
                });
                expect(messagesDB).to.deep.equal([
                  {
                    index: 0,
                    content: 'coucou user1',
                    emitter: 'user',
                    shouldBeRenderedInPreview: true,
                    shouldBeForwardedToLLM: true,
                    shouldBeCountedAsAPrompt: true,
                    attachmentName: null,
                    attachmentContext: null,
                    hasAttachmentBeenSubmittedAlongWithAPrompt: false,
                    hasErrorOccurred: null,
                    haveVictoryConditionsBeenFulfilled: false,
                    wasModerated: null,
                  },
                  {
                    index: 1,
                    content: 'coucou LLM1',
                    emitter: 'assistant',
                    shouldBeRenderedInPreview: true,
                    shouldBeForwardedToLLM: true,
                    shouldBeCountedAsAPrompt: false,
                    attachmentName: null,
                    attachmentContext: null,
                    hasAttachmentBeenSubmittedAlongWithAPrompt: false,
                    hasErrorOccurred: null,
                    haveVictoryConditionsBeenFulfilled: false,
                    wasModerated: null,
                  },
                  {
                    index: 2,
                    attachmentName: 'expected_file.txt',
                    content: null,
                    emitter: 'user',
                    shouldBeRenderedInPreview: true,
                    shouldBeForwardedToLLM: true,
                    shouldBeCountedAsAPrompt: true,
                    hasAttachmentBeenSubmittedAlongWithAPrompt: false,
                    attachmentContext: null,
                    hasErrorOccurred: null,
                    haveVictoryConditionsBeenFulfilled: false,
                    wasModerated: null,
                  },
                  {
                    index: 3,
                    attachmentName: 'expected_file.txt',
                    attachmentContext: 'add me in the chat !',
                    content: null,
                    emitter: 'assistant',
                    shouldBeRenderedInPreview: false,
                    shouldBeForwardedToLLM: true,
                    shouldBeCountedAsAPrompt: false,
                    hasAttachmentBeenSubmittedAlongWithAPrompt: false,
                    hasErrorOccurred: null,
                    haveVictoryConditionsBeenFulfilled: false,
                    wasModerated: null,
                  },
                ]);
              },
            );
          });
        });
      });
    });

    context('stream capture', function () {
      it('should mark the current user message if victory conditions have been fulfilled, according to the stream response', async function () {
        // given
        const chat = new Chat({
          id: chatId,
          userId: 123,
          configurationId,
          configuration,
          hasAttachmentContextBeenAdded: false,
          messages: [buildBasicUserMessage('coucou user1', 0), buildBasicAssistantMessage('coucou LLM1', 1)],
        });
        await createChat(chat.toDTO());
        const llmPostPromptScope = nock('https://llm-test.pix.fr/api')
          .post('/chat', {
            configuration: {
              challenge: {
                inputMaxPrompts: 100,
                inputMaxChars: 255,
              },
            },
            history: [
              { content: 'coucou user1', role: 'user' },
              { content: 'coucou LLM1', role: 'assistant' },
            ],
            prompt: 'un message',
          })
          .reply(
            201,
            Readable.from([
              '60:{"ceci":"nest pas important","message":"coucou c\'est super"}',
              '40:{"message":"\\nle couscous c plutot bon"}47:{"message":" mais la paella c pas mal aussi\\n"}',
              '16:{"isValid":true}',
              '29:{"jecrois":{"que":"jaifini"}}',
            ]),
          );

        // when
        const stream = await promptChat({
          chatId,
          userId: 123,
          message: 'un message',
          attachmentName: null,
          ...dependencies,
        });

        // then
        const parts = [];
        const decoder = new TextDecoder();
        for await (const chunk of stream) {
          parts.push(decoder.decode(chunk));
        }
        await waitForStreamFinalizationToBeDone();
        const llmResponse = parts.join('');
        const llmMessage =
          "data: coucou c'est super\n\ndata: \ndata: le couscous c plutot bon\n\ndata:  mais la paella c pas mal aussi\ndata: \n\n";
        const victoryMessage = 'event: victory-conditions-success\ndata: \n\n';
        const promptsLeft = 'event: user-prompts-left\ndata: 98\n\n';
        expect(llmResponse).to.deep.equal(llmMessage + victoryMessage + promptsLeft);
        const { chatDB, messagesDB } = await getChatAndMessagesFromDB(chatId);
        expect(chatDB).to.deep.equal({
          id: chatId,
          userId: 123,
          configId: 'uneConfigQuiExist',
          configContent: {
            challenge: {
              inputMaxPrompts: 100,
              inputMaxChars: 255,
            },
          },
          hasAttachmentContextBeenAdded: false,
          totalInputTokens: 0,
          totalOutputTokens: 0,
        });
        expect(messagesDB).to.deep.equal([
          {
            index: 0,
            content: 'coucou user1',
            emitter: 'user',
            shouldBeRenderedInPreview: true,
            shouldBeForwardedToLLM: true,
            shouldBeCountedAsAPrompt: true,
            attachmentName: null,
            attachmentContext: null,
            hasAttachmentBeenSubmittedAlongWithAPrompt: false,
            haveVictoryConditionsBeenFulfilled: false,
            hasErrorOccurred: null,
            wasModerated: null,
          },
          {
            index: 1,
            content: 'coucou LLM1',
            emitter: 'assistant',
            shouldBeRenderedInPreview: true,
            shouldBeForwardedToLLM: true,
            shouldBeCountedAsAPrompt: false,
            attachmentName: null,
            attachmentContext: null,
            hasAttachmentBeenSubmittedAlongWithAPrompt: false,
            haveVictoryConditionsBeenFulfilled: false,
            hasErrorOccurred: null,
            wasModerated: null,
          },
          {
            index: 2,
            content: 'un message',
            emitter: 'user',
            shouldBeRenderedInPreview: true,
            shouldBeForwardedToLLM: true,
            shouldBeCountedAsAPrompt: true,
            haveVictoryConditionsBeenFulfilled: true,
            wasModerated: false,
            attachmentName: null,
            attachmentContext: null,
            hasAttachmentBeenSubmittedAlongWithAPrompt: false,
            hasErrorOccurred: null,
          },
          {
            index: 3,
            content: "coucou c'est super\nle couscous c plutot bon mais la paella c pas mal aussi\n",
            emitter: 'assistant',
            shouldBeRenderedInPreview: true,
            shouldBeForwardedToLLM: true,
            shouldBeCountedAsAPrompt: false,
            hasErrorOccurred: false,
            attachmentName: null,
            attachmentContext: null,
            hasAttachmentBeenSubmittedAlongWithAPrompt: false,
            haveVictoryConditionsBeenFulfilled: false,
            wasModerated: null,
          },
        ]);
        expect(llmPostPromptScope.isDone()).to.be.true;
      });

      it('should update the token consumption if such information was provided in the stream response', async function () {
        // given
        const chat = new Chat({
          id: chatId,
          userId: 123,
          configurationId,
          configuration,
          hasAttachmentContextBeenAdded: false,
          totalInputTokens: 1_000,
          totalOutputTokens: 2_000,
          messages: [buildBasicUserMessage('coucou user1', 0), buildBasicAssistantMessage('coucou LLM1', 1)],
        });
        await createChat(chat.toDTO());
        const llmPostPromptScope = nock('https://llm-test.pix.fr/api')
          .post('/chat', {
            configuration: {
              challenge: {
                inputMaxPrompts: 100,
                inputMaxChars: 255,
              },
            },
            history: [
              { content: 'coucou user1', role: 'user' },
              { content: 'coucou LLM1', role: 'assistant' },
            ],
            prompt: 'un message',
          })
          .reply(
            201,
            Readable.from([
              '60:{"ceci":"nest pas important","message":"coucou c\'est super"}',
              '40:{"message":"\\nle couscous c plutot bon"}47:{"message":" mais la paella c pas mal aussi\\n"}',
              '16:{"isValid":true}',
              '80:{"jecrois":{"que":"jaifini"},"usage":{"input_tokens":3000,"output_tokens":5000}}',
            ]),
          );

        // when
        const stream = await promptChat({
          chatId,
          userId: 123,
          message: 'un message',
          attachmentName: null,
          ...dependencies,
        });

        // then
        const parts = [];
        const decoder = new TextDecoder();
        for await (const chunk of stream) {
          parts.push(decoder.decode(chunk));
        }
        await waitForStreamFinalizationToBeDone();
        const llmResponse = parts.join('');
        const llmMessage =
          "data: coucou c'est super\n\ndata: \ndata: le couscous c plutot bon\n\ndata:  mais la paella c pas mal aussi\ndata: \n\n";
        const victoryMessage = 'event: victory-conditions-success\ndata: \n\n';
        const promptsLeft = 'event: user-prompts-left\ndata: 98\n\n';
        expect(llmResponse).to.deep.equal(llmMessage + victoryMessage + promptsLeft);
        const { chatDB, messagesDB } = await getChatAndMessagesFromDB(chatId);
        expect(chatDB).to.deep.equal({
          id: chatId,
          userId: 123,
          configId: 'uneConfigQuiExist',
          configContent: {
            challenge: {
              inputMaxPrompts: 100,
              inputMaxChars: 255,
            },
          },
          hasAttachmentContextBeenAdded: false,
          totalInputTokens: 4_000,
          totalOutputTokens: 7_000,
        });
        expect(messagesDB).to.deep.equal([
          {
            index: 0,
            content: 'coucou user1',
            emitter: 'user',
            shouldBeRenderedInPreview: true,
            shouldBeForwardedToLLM: true,
            shouldBeCountedAsAPrompt: true,
            attachmentName: null,
            attachmentContext: null,
            hasAttachmentBeenSubmittedAlongWithAPrompt: false,
            haveVictoryConditionsBeenFulfilled: false,
            hasErrorOccurred: null,
            wasModerated: null,
          },
          {
            index: 1,
            content: 'coucou LLM1',
            emitter: 'assistant',
            shouldBeRenderedInPreview: true,
            shouldBeForwardedToLLM: true,
            shouldBeCountedAsAPrompt: false,
            attachmentName: null,
            attachmentContext: null,
            hasAttachmentBeenSubmittedAlongWithAPrompt: false,
            haveVictoryConditionsBeenFulfilled: false,
            hasErrorOccurred: null,
            wasModerated: null,
          },
          {
            index: 2,
            content: 'un message',
            emitter: 'user',
            shouldBeRenderedInPreview: true,
            shouldBeForwardedToLLM: true,
            shouldBeCountedAsAPrompt: true,
            haveVictoryConditionsBeenFulfilled: true,
            wasModerated: false,
            attachmentName: null,
            attachmentContext: null,
            hasAttachmentBeenSubmittedAlongWithAPrompt: false,
            hasErrorOccurred: null,
          },
          {
            index: 3,
            content: "coucou c'est super\nle couscous c plutot bon mais la paella c pas mal aussi\n",
            emitter: 'assistant',
            shouldBeRenderedInPreview: true,
            shouldBeForwardedToLLM: true,
            shouldBeCountedAsAPrompt: false,
            hasErrorOccurred: false,
            attachmentName: null,
            attachmentContext: null,
            hasAttachmentBeenSubmittedAlongWithAPrompt: false,
            haveVictoryConditionsBeenFulfilled: false,
            wasModerated: null,
          },
        ]);
        expect(llmPostPromptScope.isDone()).to.be.true;
      });

      it('should mark the current user message if user message has been moderated, according to the stream response', async function () {
        // given
        const chat = new Chat({
          id: chatId,
          userId: 123,
          configurationId,
          configuration,
          hasAttachmentContextBeenAdded: false,
          messages: [buildBasicUserMessage('coucou user1', 0), buildBasicAssistantMessage('coucou LLM1', 1)],
        });
        await createChat(chat.toDTO());
        const llmPostPromptScope = nock('https://llm-test.pix.fr/api')
          .post('/chat', {
            configuration: {
              challenge: {
                inputMaxPrompts: 100,
                inputMaxChars: 255,
              },
            },
            history: [
              { content: 'coucou user1', role: 'user' },
              { content: 'coucou LLM1', role: 'assistant' },
            ],
            prompt: "C'est quoi un chat tout terrain ? Un cat-cat !!",
          })
          .reply(201, Readable.from(['21:{"wasModerated":true}']));

        // when
        const stream = await promptChat({
          chatId,
          userId: 123,
          message: "C'est quoi un chat tout terrain ? Un cat-cat !!",
          attachmentName: null,
          ...dependencies,
        });

        // then
        const parts = [];
        const decoder = new TextDecoder();
        for await (const chunk of stream) {
          parts.push(decoder.decode(chunk));
        }
        await waitForStreamFinalizationToBeDone();
        const llmResponse = parts.join('');
        const moderatedMessage = 'event: user-message-moderated\ndata: \n\n';
        const promptsLeft = 'event: user-prompts-left\ndata: 98\n\n';
        expect(llmResponse).to.deep.equal(moderatedMessage + promptsLeft);
        const { chatDB, messagesDB } = await getChatAndMessagesFromDB(chatId);
        expect(chatDB).to.deep.equal({
          id: chatId,
          userId: 123,
          configId: 'uneConfigQuiExist',
          configContent: {
            challenge: {
              inputMaxPrompts: 100,
              inputMaxChars: 255,
            },
          },
          hasAttachmentContextBeenAdded: false,
          totalInputTokens: 0,
          totalOutputTokens: 0,
        });
        expect(messagesDB).to.deep.equal([
          {
            index: 0,
            content: 'coucou user1',
            emitter: 'user',
            shouldBeRenderedInPreview: true,
            shouldBeForwardedToLLM: true,
            shouldBeCountedAsAPrompt: true,
            attachmentName: null,
            attachmentContext: null,
            hasAttachmentBeenSubmittedAlongWithAPrompt: false,
            haveVictoryConditionsBeenFulfilled: false,
            hasErrorOccurred: null,
            wasModerated: null,
          },
          {
            index: 1,
            content: 'coucou LLM1',
            emitter: 'assistant',
            shouldBeRenderedInPreview: true,
            shouldBeForwardedToLLM: true,
            shouldBeCountedAsAPrompt: false,
            attachmentName: null,
            attachmentContext: null,
            hasAttachmentBeenSubmittedAlongWithAPrompt: false,
            haveVictoryConditionsBeenFulfilled: false,
            hasErrorOccurred: null,
            wasModerated: null,
          },
          {
            index: 2,
            content: "C'est quoi un chat tout terrain ? Un cat-cat !!",
            emitter: 'user',
            shouldBeRenderedInPreview: true,
            shouldBeForwardedToLLM: false,
            shouldBeCountedAsAPrompt: true,
            wasModerated: true,
            attachmentName: null,
            attachmentContext: null,
            hasAttachmentBeenSubmittedAlongWithAPrompt: false,
            haveVictoryConditionsBeenFulfilled: false,
            hasErrorOccurred: null,
          },
        ]);
        expect(llmPostPromptScope.isDone()).to.be.true;
      });
    });

    context('debug', function () {
      context('when chat is a preview chat', function () {
        it('should return a stream which will contain, at the end, information regarding token consumption', async function () {
          // given
          const chat = new Chat({
            id: chatId,
            configurationId,
            configuration,
            hasAttachmentContextBeenAdded: false,
            messages: [buildBasicUserMessage('coucou user1', 0), buildBasicAssistantMessage('coucou LLM1', 1)],
          });
          await createChat(chat.toDTO());
          const llmPostPromptScope = nock('https://llm-test.pix.fr/api')
            .post('/chat', {
              configuration: {
                challenge: {
                  inputMaxPrompts: 100,
                  inputMaxChars: 255,
                },
              },
              history: [
                { content: 'coucou user1', role: 'user' },
                { content: 'coucou LLM1', role: 'assistant' },
              ],
              prompt: 'un message',
            })
            .reply(
              201,
              Readable.from([
                '60:{"ceci":"nest pas important","message":"coucou c\'est super"}',
                '40:{"message":"\\nle couscous c plutot bon"}47:{"message":" mais la paella c pas mal aussi\\n"}',
                '80:{"jecrois":{"que":"jaifini"},"usage":{"input_tokens":3000,"output_tokens":5000}}',
              ]),
            );

          // when
          const stream = await promptChat({
            chatId,
            userId: 123,
            message: 'un message',
            attachmentName: null,
            ...dependencies,
          });

          // then
          const parts = [];
          const decoder = new TextDecoder();
          for await (const chunk of stream) {
            parts.push(decoder.decode(chunk));
          }
          await waitForStreamFinalizationToBeDone();
          const llmResponse = parts.join('');
          const llmMessage =
            "data: coucou c'est super\n\ndata: \ndata: le couscous c plutot bon\n\ndata:  mais la paella c pas mal aussi\ndata: \n\n";
          const promptsLeft = 'event: user-prompts-left\ndata: 98\n\n';
          const debugInputTokens = 'event: debug-input-tokens\ndata: 3000\n\n';
          const debugOutputTokens = 'event: debug-output-tokens\ndata: 5000\n\n';
          expect(llmResponse).to.deep.equal(llmMessage + promptsLeft + debugInputTokens + debugOutputTokens);
          const { chatDB, messagesDB } = await getChatAndMessagesFromDB(chatId);
          expect(chatDB).to.deep.equal({
            id: chatId,
            configId: 'uneConfigQuiExist',
            configContent: {
              challenge: {
                inputMaxPrompts: 100,
                inputMaxChars: 255,
              },
            },
            hasAttachmentContextBeenAdded: false,
            totalInputTokens: 3000,
            totalOutputTokens: 5000,
            userId: null,
          });
          expect(messagesDB).to.deep.equal([
            {
              index: 0,
              content: 'coucou user1',
              emitter: 'user',
              shouldBeRenderedInPreview: true,
              shouldBeForwardedToLLM: true,
              shouldBeCountedAsAPrompt: true,
              attachmentName: null,
              attachmentContext: null,
              hasAttachmentBeenSubmittedAlongWithAPrompt: false,
              haveVictoryConditionsBeenFulfilled: false,
              hasErrorOccurred: null,
              wasModerated: null,
            },
            {
              index: 1,
              content: 'coucou LLM1',
              emitter: 'assistant',
              shouldBeRenderedInPreview: true,
              shouldBeForwardedToLLM: true,
              shouldBeCountedAsAPrompt: false,
              attachmentName: null,
              attachmentContext: null,
              hasAttachmentBeenSubmittedAlongWithAPrompt: false,
              haveVictoryConditionsBeenFulfilled: false,
              hasErrorOccurred: null,
              wasModerated: null,
            },
            {
              index: 2,
              content: 'un message',
              emitter: 'user',
              shouldBeRenderedInPreview: true,
              shouldBeForwardedToLLM: true,
              shouldBeCountedAsAPrompt: true,
              wasModerated: false,
              attachmentName: null,
              attachmentContext: null,
              hasAttachmentBeenSubmittedAlongWithAPrompt: false,
              haveVictoryConditionsBeenFulfilled: false,
              hasErrorOccurred: null,
            },
            {
              index: 3,
              content: "coucou c'est super\nle couscous c plutot bon mais la paella c pas mal aussi\n",
              emitter: 'assistant',
              shouldBeRenderedInPreview: true,
              shouldBeForwardedToLLM: true,
              shouldBeCountedAsAPrompt: false,
              hasErrorOccurred: false,
              attachmentName: null,
              attachmentContext: null,
              hasAttachmentBeenSubmittedAlongWithAPrompt: false,
              haveVictoryConditionsBeenFulfilled: false,
              wasModerated: null,
            },
          ]);
          expect(llmPostPromptScope.isDone()).to.be.true;
        });
      });

      context('when chat is not a preview chat', function () {
        it('should return a stream which will not contain, at the end, any information regarding token consumption', async function () {
          // given
          const chat = new Chat({
            id: chatId,
            userId: 123,
            configurationId,
            configuration,
            hasAttachmentContextBeenAdded: false,
            messages: [buildBasicUserMessage('coucou user1', 0), buildBasicAssistantMessage('coucou LLM1', 1)],
          });
          await createChat(chat.toDTO());
          const llmPostPromptScope = nock('https://llm-test.pix.fr/api')
            .post('/chat', {
              configuration: {
                challenge: {
                  inputMaxPrompts: 100,
                  inputMaxChars: 255,
                },
              },
              history: [
                { content: 'coucou user1', role: 'user' },
                { content: 'coucou LLM1', role: 'assistant' },
              ],
              prompt: 'un message',
            })
            .reply(
              201,
              Readable.from([
                '60:{"ceci":"nest pas important","message":"coucou c\'est super"}',
                '40:{"message":"\\nle couscous c plutot bon"}47:{"message":" mais la paella c pas mal aussi\\n"}',
                '78:{"jecrois":{"que":"jaifini"},"usage":{"inputTokens":3000,"outputTokens":5000}}',
              ]),
            );

          // when
          const stream = await promptChat({
            chatId,
            userId: 123,
            message: 'un message',
            attachmentName: null,
            ...dependencies,
          });

          // then
          const parts = [];
          const decoder = new TextDecoder();
          for await (const chunk of stream) {
            parts.push(decoder.decode(chunk));
          }
          await waitForStreamFinalizationToBeDone();
          const llmResponse = parts.join('');
          const llmMessage =
            "data: coucou c'est super\n\ndata: \ndata: le couscous c plutot bon\n\ndata:  mais la paella c pas mal aussi\ndata: \n\n";
          const promptsLeft = 'event: user-prompts-left\ndata: 98\n\n';
          expect(llmResponse).to.deep.equal(llmMessage + promptsLeft);
          const { chatDB, messagesDB } = await getChatAndMessagesFromDB(chatId);
          expect(chatDB).to.deep.equal({
            id: chatId,
            userId: 123,
            configId: 'uneConfigQuiExist',
            configContent: {
              challenge: {
                inputMaxPrompts: 100,
                inputMaxChars: 255,
              },
            },
            hasAttachmentContextBeenAdded: false,
            totalInputTokens: 0,
            totalOutputTokens: 0,
          });
          expect(messagesDB).to.deep.equal([
            {
              index: 0,
              content: 'coucou user1',
              emitter: 'user',
              shouldBeRenderedInPreview: true,
              shouldBeForwardedToLLM: true,
              shouldBeCountedAsAPrompt: true,
              attachmentName: null,
              attachmentContext: null,
              hasAttachmentBeenSubmittedAlongWithAPrompt: false,
              haveVictoryConditionsBeenFulfilled: false,
              hasErrorOccurred: null,
              wasModerated: null,
            },
            {
              index: 1,
              content: 'coucou LLM1',
              emitter: 'assistant',
              shouldBeRenderedInPreview: true,
              shouldBeForwardedToLLM: true,
              shouldBeCountedAsAPrompt: false,
              attachmentName: null,
              attachmentContext: null,
              hasAttachmentBeenSubmittedAlongWithAPrompt: false,
              haveVictoryConditionsBeenFulfilled: false,
              hasErrorOccurred: null,
              wasModerated: null,
            },
            {
              index: 2,
              content: 'un message',
              emitter: 'user',
              shouldBeRenderedInPreview: true,
              shouldBeForwardedToLLM: true,
              shouldBeCountedAsAPrompt: true,
              wasModerated: false,
              attachmentName: null,
              attachmentContext: null,
              hasAttachmentBeenSubmittedAlongWithAPrompt: false,
              haveVictoryConditionsBeenFulfilled: false,
              hasErrorOccurred: null,
            },
            {
              index: 3,
              content: "coucou c'est super\nle couscous c plutot bon mais la paella c pas mal aussi\n",
              emitter: 'assistant',
              shouldBeRenderedInPreview: true,
              shouldBeForwardedToLLM: true,
              shouldBeCountedAsAPrompt: false,
              hasErrorOccurred: false,
              attachmentName: null,
              attachmentContext: null,
              hasAttachmentBeenSubmittedAlongWithAPrompt: false,
              haveVictoryConditionsBeenFulfilled: false,
              wasModerated: null,
            },
          ]);
          expect(llmPostPromptScope.isDone()).to.be.true;
        });
      });
    });
  });

  context('when an error occurs in stream', function () {
    let configuration;
    const configurationId = 'uneConfigQuiExist';

    beforeEach(function () {
      configuration = new Configuration({
        challenge: {
          inputMaxPrompts: 100,
          inputMaxChars: 255,
        },
      });
    });

    it('should return a stream which will contain the partial llm response and the error', async function () {
      // given
      const chat = new Chat({
        id: chatId,
        userId: 123,
        configurationId,
        configuration,
        hasAttachmentContextBeenAdded: false,
        messages: [buildBasicUserMessage('coucou user1', 0), buildBasicAssistantMessage('coucou LLM1', 1)],
      });
      await createChat(chat.toDTO());
      const llmPostPromptScope = nock('https://llm-test.pix.fr/api')
        .post('/chat', {
          configuration: {
            challenge: {
              inputMaxPrompts: 100,
              inputMaxChars: 255,
            },
          },
          history: [
            { content: 'coucou user1', role: 'user' },
            { content: 'coucou LLM1', role: 'assistant' },
          ],
          prompt: 'un message',
        })
        .reply(
          201,
          Readable.from([
            '60:{"ceci":"nest pas important","message":"coucou c\'est super"}',
            '40:{"message":"\\nle couscous c plutot bon"}35:{"error":"une erreur est survenue"}',
          ]),
        );

      // when
      const stream = await promptChat({
        chatId,
        userId: 123,
        message: 'un message',
        attachmentName: null,
        ...dependencies,
      });

      // then
      const parts = [];
      const decoder = new TextDecoder();
      for await (const chunk of stream) {
        parts.push(decoder.decode(chunk));
      }
      await waitForStreamFinalizationToBeDone();
      const llmResponse = parts.join('');
      const llmMessage = "data: coucou c'est super\n\ndata: \ndata: le couscous c plutot bon\n\n";
      const errorMessage = 'event: error\ndata: \n\n';
      expect(llmResponse).to.deep.equal(llmMessage + errorMessage);
      const { chatDB, messagesDB } = await getChatAndMessagesFromDB(chatId);
      expect(chatDB).to.deep.equal({
        id: chatId,
        userId: 123,
        configId: 'uneConfigQuiExist',
        configContent: {
          challenge: {
            inputMaxPrompts: 100,
            inputMaxChars: 255,
          },
        },
        hasAttachmentContextBeenAdded: false,
        totalInputTokens: 0,
        totalOutputTokens: 0,
      });
      expect(messagesDB).to.deep.equal([
        {
          index: 0,
          content: 'coucou user1',
          emitter: 'user',
          shouldBeRenderedInPreview: true,
          shouldBeForwardedToLLM: true,
          shouldBeCountedAsAPrompt: true,
          attachmentName: null,
          attachmentContext: null,
          hasAttachmentBeenSubmittedAlongWithAPrompt: false,
          haveVictoryConditionsBeenFulfilled: false,
          hasErrorOccurred: null,
          wasModerated: null,
        },
        {
          index: 1,
          content: 'coucou LLM1',
          emitter: 'assistant',
          shouldBeRenderedInPreview: true,
          shouldBeForwardedToLLM: true,
          shouldBeCountedAsAPrompt: false,
          attachmentName: null,
          attachmentContext: null,
          hasAttachmentBeenSubmittedAlongWithAPrompt: false,
          haveVictoryConditionsBeenFulfilled: false,
          hasErrorOccurred: null,
          wasModerated: null,
        },
        {
          index: 2,
          content: 'un message',
          emitter: 'user',
          shouldBeRenderedInPreview: true,
          shouldBeForwardedToLLM: false,
          shouldBeCountedAsAPrompt: false,
          wasModerated: false,
          attachmentName: null,
          attachmentContext: null,
          hasAttachmentBeenSubmittedAlongWithAPrompt: false,
          haveVictoryConditionsBeenFulfilled: false,
          hasErrorOccurred: null,
        },
        {
          index: 3,
          content: "coucou c'est super\nle couscous c plutot bon",
          emitter: 'assistant',
          shouldBeRenderedInPreview: true,
          shouldBeForwardedToLLM: false,
          shouldBeCountedAsAPrompt: false,
          hasErrorOccurred: true,
          attachmentName: null,
          attachmentContext: null,
          hasAttachmentBeenSubmittedAlongWithAPrompt: false,
          haveVictoryConditionsBeenFulfilled: false,
          wasModerated: null,
        },
      ]);
      expect(llmPostPromptScope.isDone()).to.be.true;
    });
  });

  context('when error occured during usecase', function () {
    it('should release the lock', async function () {
      // given
      const chat = new Chat({
        id: chatId,
        userId: 123456,
        configurationId: 'uneConfigQuiExist',
        configuration: new Configuration({ llm: {} }),
        hasAttachmentContextBeenAdded: false,
        messages: [],
      });
      await createChat(chat.toDTO());

      // when
      const err = await catchErr(promptChat)({
        chatId,
        userId: 12345,
        message: 'un message',
        ...dependencies,
      });
      const sameError = await catchErr(promptChat)({
        chatId,
        userId: 12345,
        message: 'un message',
        ...dependencies,
      });

      // then
      expect(err).to.be.instanceOf(ChatForbiddenError);
      expect(err.message).to.equal('User has not the right to use this chat');
      expect(sameError).to.deepEqualInstance(err);
    });
  });
});

function buildBasicUserMessage(content, index) {
  return new Message({
    index,
    content,
    isFromUser: true,
    shouldBeRenderedInPreview: true,
    shouldBeForwardedToLLM: true,
    shouldBeCountedAsAPrompt: true,
  });
}

function buildBasicAssistantMessage(content, index) {
  return new Message({
    index,
    content,
    isFromUser: false,
    shouldBeRenderedInPreview: true,
    shouldBeForwardedToLLM: true,
    shouldBeCountedAsAPrompt: false,
  });
}

async function createChat(chatDTO) {
  databaseBuilder.factory.buildChat({
    ...chatDTO,
    configId: chatDTO.configurationId,
    configContent: chatDTO.configuration,
  });
  for (const messageDTO of chatDTO.messages) {
    databaseBuilder.factory.buildChatMessage({
      ...messageDTO,
      chatId: chatDTO.id,
      emitter: messageDTO.isFromUser ? 'user' : 'assistant',
      hasErrorOccurred: messageDTO.hasErrorOccurred ?? null,
      shouldBeCountedAsPrompt: messageDTO.shouldBeCountedAsAPrompt,
      wasModerated: messageDTO.wasModerated ?? null,
      content: messageDTO.attachmentName ? null : messageDTO.content,
      attachmentName: messageDTO.attachmentName ?? null,
      attachmentContext: messageDTO.attachmentContext ?? null,
    });
  }
  await databaseBuilder.commit();
}

async function getChatAndMessagesFromDB(chatId) {
  return {
    chatDB: await knex('chats')
      .select(
        'id',
        'userId',
        'configId',
        'configContent',
        'hasAttachmentContextBeenAdded',
        'totalInputTokens',
        'totalOutputTokens',
      )
      .first(),
    messagesDB: await knex('chat_messages')
      .select(
        'index',
        'emitter',
        'attachmentName',
        'attachmentContext',
        'hasAttachmentBeenSubmittedAlongWithAPrompt',
        'haveVictoryConditionsBeenFulfilled',
        'content',
        'shouldBeRenderedInPreview',
        'shouldBeForwardedToLLM',
        'shouldBeCountedAsAPrompt',
        'wasModerated',
        'hasErrorOccurred',
      )
      .where({ chatId })
      .orderBy('index'),
  };
}
