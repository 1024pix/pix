import { randomUUID } from 'node:crypto';
import { Readable } from 'node:stream';

import nock from 'nock';
import sinon from 'sinon';

import {
  LLMApiError,
  NoAttachmentNeededError,
  NoAttachmentNorMessageProvidedError,
} from '../../../../../src/llm/domain/errors.js';
import { Chat, Message } from '../../../../../src/llm/domain/models/Chat.js';
import { Configuration } from '../../../../../src/llm/domain/models/Configuration.js';
import { promptChat } from '../../../../../src/llm/domain/usecases/prompt-chat.js';
import { chatRepository, promptRepository } from '../../../../../src/llm/infrastructure/repositories/index.js';
import { LLMResponseHandler } from '../../../../../src/llm/infrastructure/streaming/llm-response-handler.js';
import { redisMutex } from '../../../../../src/shared/infrastructure/mutex/RedisMutex.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';
import { waitForStreamFinalizationToBeDone } from '../../../../tooling/test-utils/wait.js';

describe('LLM | Integration | Domain | UseCases | prompt-chat', function () {
  let dependencies, chatId, llmResponseHandler, resultChunks;

  beforeEach(function () {
    chatId = randomUUID();
    ({ llmResponseHandler, resultChunks } = setupResponseStream());
    dependencies = {
      promptRepository,
      chatRepository,
      redisMutex,
      llmResponseHandler,
    };
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
        it('should write the llm response in the stream and persist the exchange', async function () {
          // given
          const chat = new Chat({
            id: chatId,
            userId: 123,
            configurationId,
            configuration,
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
          await promptChat({
            chatId,
            userId: 123,
            message: 'un message',
            attachmentName: null,
            ...dependencies,
          });
          await waitForStreamFinalizationToBeDone();
          const llmResponse = resultChunks.join('');

          // then
          expect(llmResponse).to.deep.equal(
            "data: coucou c'est super\n\ndata: \ndata: le couscous c plutot bon\n\ndata:  mais la paella c pas mal aussi\ndata: \n\n",
          );
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
            haveVictoryConditionsBeenFulfilled: false,
            totalInputTokens: 0,
            totalOutputTokens: 0,
          });
          expect(messagesDB[0]).to.deep.include({
            index: 0,
            content: 'coucou user1',
            emitter: 'user',
            wasModerated: null,
            attachmentName: null,
          });
          expect(messagesDB[1]).to.deep.include({
            index: 1,
            content: 'coucou LLM1',
            emitter: 'assistant',
            wasModerated: null,
            attachmentName: null,
          });
          expect(messagesDB[2]).to.deep.include({
            index: 2,
            content: 'un message',
            emitter: 'user',
            wasModerated: false,
            attachmentName: null,
          });
          expect(messagesDB[3]).to.deep.include({
            index: 3,
            content: "coucou c'est super\nle couscous c plutot bon mais la paella c pas mal aussi\n",
            emitter: 'assistant',
            wasModerated: null,
            attachmentName: null,
          });
          expect(llmPostPromptScope.isDone()).to.be.true;
        });

        it('should release chat resource', async function () {
          // given
          const chat = new Chat({
            id: chatId,
            userId: 123,
            configurationId,
            configuration,
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
          await waitForStreamFinalizationToBeDone();

          // then
          const { llmResponseHandler: secondLlmResponseHandler } = setupResponseStream();
          await promptChat({
            chatId,
            userId: 123,
            message: 'un autre message',
            attachmentName: null,
            ...dependencies,
            llmResponseHandler: secondLlmResponseHandler,
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
            haveVictoryConditionsBeenFulfilled: false,
            totalInputTokens: 0,
            totalOutputTokens: 0,
          });
          expect(messagesDB[0]).to.deep.include({
            index: 0,
            content: 'coucou user1',
            emitter: 'user',
            wasModerated: null,
            attachmentName: null,
          });
          expect(messagesDB[1]).to.deep.include({
            index: 1,
            content: 'coucou LLM1',
            emitter: 'assistant',
            wasModerated: null,
            attachmentName: null,
          });
          expect(messagesDB[2]).to.deep.include({
            index: 2,
            content: 'un message',
            emitter: 'user',
            wasModerated: false,
            attachmentName: null,
          });
          expect(messagesDB[3]).to.deep.include({
            index: 3,
            content: "coucou c'est super\nle couscous c plutot bon mais la paella c pas mal aussi\n",
            emitter: 'assistant',
            wasModerated: null,
            attachmentName: null,
          });
          expect(messagesDB[4]).to.deep.include({
            index: 4,
            content: 'un autre message',
            emitter: 'user',
            wasModerated: false,
            attachmentName: null,
          });
          expect(messagesDB[5]).to.deep.include({
            index: 5,
            content: "coucou c'est vraiment super",
            emitter: 'assistant',
            wasModerated: null,
            attachmentName: null,
          });
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
              haveVictoryConditionsBeenFulfilled: false,
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
          context('when the context for the valid attachmentName has already been added', function () {
            it(
              'should write the attachment-failure event and the llm response in the stream while ' +
                'persisting the user message with attachment and content but not actually forwarding the attachment to the llm',
              async function () {
                // given
                const chat = new Chat({
                  id: chatId,
                  userId: 123,
                  configurationId,
                  configuration: configurationWithAttachment,
                  messages: [
                    buildBasicUserMessage('coucou user1', 0),
                    buildBasicAssistantMessage('coucou LLM1', 1),
                    new Message({
                      index: 2,
                      attachmentName: 'expected_file.txt',
                      emitter: 'user',
                      content: null,
                    }),
                    buildBasicUserMessage('coucou user2', 3),
                    buildBasicAssistantMessage('coucou LLM2', 4),
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
                await promptChat({
                  chatId,
                  userId: 123,
                  message: 'un message',
                  attachmentName: 'wrong_file.txt',
                  ...dependencies,
                });
                await waitForStreamFinalizationToBeDone();
                const llmResponse = resultChunks.join('');

                // then
                const attachmentMessage = 'event: attachment-failure\ndata: \n\n';
                const llmMessage =
                  "data: coucou c'est super\n\ndata: \ndata: le couscous c plutot bon\n\ndata:  mais la paella c pas mal aussi\ndata: \n\n";
                expect(llmResponse).to.deep.equal(attachmentMessage + llmMessage);

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
                  haveVictoryConditionsBeenFulfilled: false,
                  totalInputTokens: 0,
                  totalOutputTokens: 0,
                });
                expect(messagesDB[0]).to.deep.include({
                  index: 0,
                  content: 'coucou user1',
                  emitter: 'user',
                  wasModerated: null,
                  attachmentName: null,
                });
                expect(messagesDB[1]).to.deep.include({
                  index: 1,
                  content: 'coucou LLM1',
                  emitter: 'assistant',
                  wasModerated: null,
                  attachmentName: null,
                });
                expect(messagesDB[2]).to.deep.include({
                  index: 2,
                  attachmentName: 'expected_file.txt',
                  content: null,
                  emitter: 'user',
                  wasModerated: null,
                });
                expect(messagesDB[3]).to.deep.include({
                  index: 3,
                  content: 'coucou user2',
                  emitter: 'user',
                  attachmentName: null,
                  wasModerated: null,
                });
                expect(messagesDB[4]).to.deep.include({
                  index: 4,
                  content: 'coucou LLM2',
                  emitter: 'assistant',
                  attachmentName: null,
                  wasModerated: null,
                });
                expect(messagesDB[5]).to.deep.include({
                  index: 5,
                  attachmentName: 'wrong_file.txt',
                  content: 'un message',
                  emitter: 'user',
                  wasModerated: false,
                });
                expect(messagesDB[6]).to.deep.include({
                  index: 6,
                  content: "coucou c'est super\nle couscous c plutot bon mais la paella c pas mal aussi\n",
                  emitter: 'assistant',
                  wasModerated: null,
                  attachmentName: null,
                });
                expect(llmPostPromptScope.isDone()).to.be.true;
              },
            );
          });

          context('when the context for the valid attachmentName has not been added yet', function () {
            it('should only write the attachment-failure event in the stream, it will not forward the prompt to the llm but still persist the new message', async function () {
              // given
              const chat = new Chat({
                id: chatId,
                userId: 123,
                configurationId,
                configuration: configurationWithAttachment,
                haveVictoryConditionsBeenFulfilled: false,
                messages: [buildBasicUserMessage('coucou user1', 0), buildBasicAssistantMessage('coucou LLM1', 1)],
              });
              await createChat(chat.toDTO());

              // when
              await promptChat({
                chatId,
                userId: 123,
                message: 'un message',
                attachmentName: 'wrong_file.txt',
                ...dependencies,
              });
              await waitForStreamFinalizationToBeDone();
              const llmResponse = resultChunks.join('');

              // then
              const attachmentMessage = 'event: attachment-failure\ndata: \n\n';
              expect(llmResponse).to.deep.equal(attachmentMessage);

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
                haveVictoryConditionsBeenFulfilled: false,
                totalInputTokens: 0,
                totalOutputTokens: 0,
              });
              expect(messagesDB[0]).to.deep.include({
                index: 0,
                content: 'coucou user1',
                emitter: 'user',
                attachmentName: null,
                wasModerated: null,
              });
              expect(messagesDB[1]).to.deep.include({
                index: 1,
                content: 'coucou LLM1',
                emitter: 'assistant',
                attachmentName: null,
                wasModerated: null,
              });
              expect(messagesDB[2]).to.deep.include({
                index: 2,
                attachmentName: 'wrong_file.txt',
                content: 'un message',
                emitter: 'user',
                wasModerated: false,
              });
            });
          });
        });

        context('when attachmentName is the expected one for the given configuration', function () {
          context('when the context for this attachmentName has already been added', function () {
            it(
              'should write the attachment-success event and the llm response in the stream while ' +
                "only forwarding the message content to the llm with the history's attachment context and not a new attachment context",
              async function () {
                // given
                const chat = new Chat({
                  id: chatId,
                  userId: 123,
                  configurationId,
                  configuration: configurationWithAttachment,
                  haveVictoryConditionsBeenFulfilled: false,
                  messages: [
                    buildBasicUserMessage('coucou user1', 0),
                    buildBasicAssistantMessage('coucou LLM1', 1),
                    new Message({
                      index: 2,
                      attachmentName: 'expected_file.txt',
                      content: null,
                      emitter: 'user',
                    }),
                    buildBasicUserMessage('coucou user2', 3),
                    buildBasicAssistantMessage('coucou LLM2', 4),
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
                await promptChat({
                  chatId,
                  userId: 123,
                  message: 'un message',
                  attachmentName: 'expected_file.txt',
                  ...dependencies,
                });
                await waitForStreamFinalizationToBeDone();
                const llmResponse = resultChunks.join('');

                // then
                const attachmentMessage = 'event: attachment-success\ndata: \n\n';
                const llmMessage =
                  "data: coucou c'est super\n\ndata: \ndata: le couscous c plutot bon\n\ndata:  mais la paella c pas mal aussi\ndata: \n\n";
                expect(llmResponse).to.deep.equal(attachmentMessage + llmMessage);
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
                  haveVictoryConditionsBeenFulfilled: false,
                  totalInputTokens: 0,
                  totalOutputTokens: 0,
                });
                expect(messagesDB[0]).to.deep.include({
                  index: 0,
                  content: 'coucou user1',
                  emitter: 'user',
                  attachmentName: null,
                  wasModerated: null,
                });
                expect(messagesDB[1]).to.deep.include({
                  index: 1,
                  content: 'coucou LLM1',
                  emitter: 'assistant',
                  attachmentName: null,
                  wasModerated: null,
                });
                expect(messagesDB[2]).to.deep.include({
                  index: 2,
                  attachmentName: 'expected_file.txt',
                  emitter: 'user',
                  wasModerated: null,
                  content: null,
                });
                expect(messagesDB[3]).to.deep.include({
                  index: 3,
                  content: 'coucou user2',
                  emitter: 'user',
                  attachmentName: null,
                  wasModerated: null,
                });
                expect(messagesDB[4]).to.deep.include({
                  index: 4,
                  content: 'coucou LLM2',
                  emitter: 'assistant',
                  attachmentName: null,
                  wasModerated: null,
                });
                expect(messagesDB[5]).to.deep.include({
                  index: 5,
                  attachmentName: 'expected_file.txt',
                  content: 'un message',
                  emitter: 'user',
                  wasModerated: false,
                });
                expect(messagesDB[6]).to.deep.include({
                  index: 6,
                  content: "coucou c'est super\nle couscous c plutot bon mais la paella c pas mal aussi\n",
                  emitter: 'assistant',
                  attachmentName: null,
                  wasModerated: null,
                });
                expect(llmPostPromptScope.isDone()).to.be.true;
              },
            );
          });

          context('when the context for this attachmentName has not been added yet', function () {
            it(
              'should write the attachment-success event and the llm response in the stream while ' +
                'adding the attachment context in the conversation and persisting the message but not the fake exchange',
              async function () {
                // given
                const chat = new Chat({
                  id: chatId,
                  userId: 123,
                  configurationId,
                  configuration: configurationWithAttachment,
                  haveVictoryConditionsBeenFulfilled: false,
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
                await promptChat({
                  chatId,
                  userId: 123,
                  message: 'un message',
                  attachmentName: 'expected_file.txt',
                  ...dependencies,
                });
                await waitForStreamFinalizationToBeDone();
                const llmResponse = resultChunks.join('');

                // then
                const attachmentMessage = 'event: attachment-success\ndata: \n\n';
                const llmMessage =
                  "data: coucou c'est super\n\ndata: \ndata: le couscous c plutot bon\n\ndata:  mais la paella c pas mal aussi\ndata: \n\n";
                expect(llmResponse).to.deep.equal(attachmentMessage + llmMessage);

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
                  haveVictoryConditionsBeenFulfilled: false,
                  totalInputTokens: 0,
                  totalOutputTokens: 0,
                });
                expect(messagesDB[0]).to.deep.include({
                  index: 0,
                  content: 'coucou user1',
                  emitter: 'user',
                  attachmentName: null,
                  wasModerated: null,
                });
                expect(messagesDB[1]).to.deep.include({
                  index: 1,
                  content: 'coucou LLM1',
                  emitter: 'assistant',
                  attachmentName: null,
                  wasModerated: null,
                });
                expect(messagesDB[2]).to.deep.include({
                  index: 2,
                  attachmentName: 'expected_file.txt',
                  emitter: 'user',
                  wasModerated: false,
                  content: 'un message',
                });
                expect(messagesDB[3]).to.deep.include({
                  index: 3,
                  content: "coucou c'est super\nle couscous c plutot bon mais la paella c pas mal aussi\n",
                  emitter: 'assistant',
                  attachmentName: null,
                  wasModerated: null,
                });
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
            haveVictoryConditionsBeenFulfilled: false,
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
              haveVictoryConditionsBeenFulfilled: false,
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
          context('when the context for the valid attachmentName has already been added', function () {
            it('should only write the attachment-failure event in the stream and persist the user message which will not be forwarded the LLM', async function () {
              // given
              const chat = new Chat({
                id: chatId,
                userId: 123,
                configurationId,
                configuration: configurationWithAttachment,
                haveVictoryConditionsBeenFulfilled: false,
                messages: [
                  buildBasicUserMessage('coucou user1', 0),
                  buildBasicAssistantMessage('coucou LLM1', 1),
                  new Message({
                    index: 2,
                    attachmentName: 'expected_file.txt',
                    content: null,
                    emitter: 'user',
                  }),
                  buildBasicUserMessage('coucou user2', 3),
                  buildBasicAssistantMessage('coucou LLM2', 4),
                ],
              });
              await createChat(chat.toDTO());

              // when
              await promptChat({
                chatId,
                userId: 123,
                message: null,
                attachmentName: 'wrong_file.txt',
                ...dependencies,
              });
              await waitForStreamFinalizationToBeDone();
              const llmResponse = resultChunks.join('');

              // then
              const attachmentMessage = 'event: attachment-failure\ndata: \n\n';
              expect(llmResponse).to.deep.equal(attachmentMessage);
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
                haveVictoryConditionsBeenFulfilled: false,
                totalInputTokens: 0,
                totalOutputTokens: 0,
              });
              expect(messagesDB[0]).to.deep.include({
                index: 0,
                content: 'coucou user1',
                emitter: 'user',
                attachmentName: null,
                wasModerated: null,
              });
              expect(messagesDB[1]).to.deep.include({
                index: 1,
                content: 'coucou LLM1',
                emitter: 'assistant',
                attachmentName: null,
                wasModerated: null,
              });
              expect(messagesDB[2]).to.deep.include({
                index: 2,
                attachmentName: 'expected_file.txt',
                emitter: 'user',
                content: null,
                wasModerated: null,
              });
              expect(messagesDB[3]).to.deep.include({
                index: 3,
                content: 'coucou user2',
                emitter: 'user',
                attachmentName: null,
                wasModerated: null,
              });
              expect(messagesDB[4]).to.deep.include({
                index: 4,
                content: 'coucou LLM2',
                emitter: 'assistant',
                attachmentName: null,
                wasModerated: null,
              });
              expect(messagesDB[5]).to.deep.include({
                index: 5,
                attachmentName: 'wrong_file.txt',
                content: null,
                emitter: 'user',
                wasModerated: false,
              });
            });
          });

          context('when the context for the valid attachmentName has not been added yet', function () {
            it('should only write the attachment-failure event in the stream but still persist the new message', async function () {
              // given
              const chat = new Chat({
                id: chatId,
                userId: 123,
                configurationId,
                configuration: configurationWithAttachment,
                haveVictoryConditionsBeenFulfilled: false,
                messages: [buildBasicUserMessage('coucou user1', 0), buildBasicAssistantMessage('coucou LLM1', 1)],
              });
              await createChat(chat.toDTO());

              // when
              await promptChat({
                chatId,
                userId: 123,
                message: null,
                attachmentName: 'wrong_file.txt',
                ...dependencies,
              });
              await waitForStreamFinalizationToBeDone();
              const llmResponse = resultChunks.join('');

              // then
              const attachmentMessage = 'event: attachment-failure\ndata: \n\n';
              expect(llmResponse).to.deep.equal(attachmentMessage);
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
                haveVictoryConditionsBeenFulfilled: false,
                totalInputTokens: 0,
                totalOutputTokens: 0,
              });
              expect(messagesDB).to.deep.equal([
                {
                  index: 0,
                  content: 'coucou user1',
                  emitter: 'user',
                  attachmentName: null,
                  wasModerated: null,
                },
                {
                  index: 1,
                  content: 'coucou LLM1',
                  emitter: 'assistant',
                  attachmentName: null,
                  wasModerated: null,
                },
                {
                  index: 2,
                  attachmentName: 'wrong_file.txt',
                  content: null,
                  emitter: 'user',
                  wasModerated: false,
                },
              ]);
            });
          });
        });

        context('when attachmentName is the expected one for the given configuration', function () {
          context('when the context for this attachmentName has already been added', function () {
            it(
              'should only write the attachment-success event in the stream while ' +
                'persisting the user message but not forwarding it to the llm ',
              async function () {
                // given
                const chat = new Chat({
                  id: chatId,
                  userId: 123,
                  configurationId,
                  configuration: configurationWithAttachment,
                  haveVictoryConditionsBeenFulfilled: true,
                  messages: [
                    buildBasicUserMessage('coucou user1', 0),
                    buildBasicAssistantMessage('coucou LLM1', 1),
                    new Message({
                      index: 2,
                      attachmentName: 'expected_file.txt',
                      content: null,
                      emitter: 'user',
                    }),
                    buildBasicUserMessage('coucou user2', 3),
                    buildBasicAssistantMessage('coucou LLM2', 4),
                  ],
                });
                await createChat(chat.toDTO());

                // when
                await promptChat({
                  chatId,
                  userId: 123,
                  message: null,
                  attachmentName: 'expected_file.txt',
                  ...dependencies,
                });
                await waitForStreamFinalizationToBeDone();
                const llmResponse = resultChunks.join('');

                // then
                expect(llmResponse).to.deep.equal('event: attachment-success\ndata: \n\n');
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
                  haveVictoryConditionsBeenFulfilled: true,
                  totalInputTokens: 0,
                  totalOutputTokens: 0,
                });
                expect(messagesDB).to.deep.equal([
                  {
                    index: 0,
                    content: 'coucou user1',
                    emitter: 'user',
                    attachmentName: null,
                    wasModerated: null,
                  },
                  {
                    index: 1,
                    content: 'coucou LLM1',
                    emitter: 'assistant',
                    attachmentName: null,
                    wasModerated: null,
                  },
                  {
                    index: 2,
                    attachmentName: 'expected_file.txt',
                    content: null,
                    emitter: 'user',
                    wasModerated: null,
                  },
                  {
                    index: 3,
                    content: 'coucou user2',
                    emitter: 'user',
                    attachmentName: null,
                    wasModerated: null,
                  },
                  {
                    index: 4,
                    content: 'coucou LLM2',
                    emitter: 'assistant',
                    attachmentName: null,
                    wasModerated: null,
                  },
                  {
                    index: 5,
                    attachmentName: 'expected_file.txt',
                    content: null,
                    emitter: 'user',
                    wasModerated: false,
                  },
                ]);
              },
            );
          });

          context('when the context for this attachmentName has not been added yet', function () {
            it(
              'should only write the attachment-success event while ' +
                'adding the attachment context in the conversation',
              async function () {
                // given
                const chat = new Chat({
                  id: chatId,
                  userId: 123,
                  configurationId: 'uneConfigQuiExist',
                  configuration: configurationWithAttachment,
                  haveVictoryConditionsBeenFulfilled: false,
                  messages: [buildBasicUserMessage('coucou user1', 0), buildBasicAssistantMessage('coucou LLM1', 1)],
                });
                await createChat(chat.toDTO());

                // when
                await promptChat({
                  chatId,
                  userId: 123,
                  message: null,
                  attachmentName: 'expected_file.txt',
                  ...dependencies,
                });
                await waitForStreamFinalizationToBeDone();
                const llmResponse = resultChunks.join('');

                // then
                expect(llmResponse).to.deep.equal('event: attachment-success\ndata: \n\n');
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
                  haveVictoryConditionsBeenFulfilled: false,
                  totalInputTokens: 0,
                  totalOutputTokens: 0,
                });
                expect(messagesDB[0]).to.deep.include({
                  index: 0,
                  content: 'coucou user1',
                  emitter: 'user',
                  attachmentName: null,
                  wasModerated: null,
                });
                expect(messagesDB[1]).to.deep.include({
                  index: 1,
                  content: 'coucou LLM1',
                  emitter: 'assistant',
                  attachmentName: null,
                  wasModerated: null,
                });
                expect(messagesDB[2]).to.deep.include({
                  index: 2,
                  attachmentName: 'expected_file.txt',
                  content: null,
                  emitter: 'user',
                  wasModerated: false,
                });
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
          haveVictoryConditionsBeenFulfilled: false,
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
        await promptChat({
          chatId,
          userId: 123,
          message: 'un message',
          attachmentName: null,
          ...dependencies,
        });
        await waitForStreamFinalizationToBeDone();
        const llmResponse = resultChunks.join('');

        // then
        expect(llmResponse).to.deep.equal(
          "data: coucou c'est super\n\ndata: \ndata: le couscous c plutot bon\n\ndata:  mais la paella c pas mal aussi\ndata: \n\nevent: victory-conditions-success\ndata: \n\n",
        );
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
          haveVictoryConditionsBeenFulfilled: true,
          totalInputTokens: 0,
          totalOutputTokens: 0,
        });
        expect(messagesDB[0]).to.deep.include({
          index: 0,
          content: 'coucou user1',
          emitter: 'user',
          attachmentName: null,
          wasModerated: null,
        });
        expect(messagesDB[1]).to.deep.include({
          index: 1,
          content: 'coucou LLM1',
          emitter: 'assistant',
          attachmentName: null,
          wasModerated: null,
        });
        expect(messagesDB[2]).to.deep.include({
          index: 2,
          content: 'un message',
          emitter: 'user',
          wasModerated: false,
          attachmentName: null,
        });
        expect(messagesDB[3]).to.deep.include({
          index: 3,
          content: "coucou c'est super\nle couscous c plutot bon mais la paella c pas mal aussi\n",
          emitter: 'assistant',
          attachmentName: null,
          wasModerated: null,
        });
        expect(llmPostPromptScope.isDone()).to.be.true;
      });

      it('should update the token consumption if such information was provided in the stream response', async function () {
        // given
        const chat = new Chat({
          id: chatId,
          userId: 123,
          configurationId,
          configuration,
          haveVictoryConditionsBeenFulfilled: false,
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
        await promptChat({
          chatId,
          userId: 123,
          message: 'un message',
          attachmentName: null,
          ...dependencies,
        });
        await waitForStreamFinalizationToBeDone();
        const llmResponse = resultChunks.join('');

        // then
        expect(llmResponse).to.deep.equal(
          "data: coucou c'est super\n\ndata: \ndata: le couscous c plutot bon\n\ndata:  mais la paella c pas mal aussi\ndata: \n\nevent: victory-conditions-success\ndata: \n\n",
        );
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
          haveVictoryConditionsBeenFulfilled: true,
          totalInputTokens: 4_000,
          totalOutputTokens: 7_000,
        });
        expect(messagesDB[0]).to.deep.include({
          index: 0,
          content: 'coucou user1',
          emitter: 'user',
          attachmentName: null,
          wasModerated: null,
        });
        expect(messagesDB[1]).to.deep.include({
          index: 1,
          content: 'coucou LLM1',
          emitter: 'assistant',
          attachmentName: null,
          wasModerated: null,
        });
        expect(messagesDB[2]).to.deep.include({
          index: 2,
          content: 'un message',
          emitter: 'user',
          wasModerated: false,
          attachmentName: null,
        });
        expect(messagesDB[3]).to.deep.include({
          index: 3,
          content: "coucou c'est super\nle couscous c plutot bon mais la paella c pas mal aussi\n",
          emitter: 'assistant',
          attachmentName: null,
          wasModerated: null,
        });
        expect(llmPostPromptScope.isDone()).to.be.true;
      });

      it('should mark the current user message if user message has been moderated, according to the stream response', async function () {
        // given
        const chat = new Chat({
          id: chatId,
          userId: 123,
          configurationId,
          configuration,
          haveVictoryConditionsBeenFulfilled: false,
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
        await promptChat({
          chatId,
          userId: 123,
          message: "C'est quoi un chat tout terrain ? Un cat-cat !!",
          attachmentName: null,
          ...dependencies,
        });
        await waitForStreamFinalizationToBeDone();
        const llmResponse = resultChunks.join('');

        // then
        expect(llmResponse).to.deep.equal('event: user-message-moderated\ndata: \n\n');
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
          haveVictoryConditionsBeenFulfilled: false,
          totalInputTokens: 0,
          totalOutputTokens: 0,
        });
        expect(messagesDB[0]).to.deep.include({
          index: 0,
          content: 'coucou user1',
          emitter: 'user',
          attachmentName: null,
          wasModerated: null,
        });
        expect(messagesDB[1]).to.deep.include({
          index: 1,
          content: 'coucou LLM1',
          emitter: 'assistant',
          attachmentName: null,
          wasModerated: null,
        });
        expect(messagesDB[2]).to.deep.include({
          index: 2,
          content: "C'est quoi un chat tout terrain ? Un cat-cat !!",
          emitter: 'user',
          wasModerated: true,
          attachmentName: null,
        });
        expect(llmPostPromptScope.isDone()).to.be.true;
      });
    });

    context('debug', function () {
      context('when chat is a preview chat', function () {
        it('should write information regarding token consumption in the stream', async function () {
          // given
          const chat = new Chat({
            id: chatId,
            configurationId,
            configuration,
            haveVictoryConditionsBeenFulfilled: false,
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
          await promptChat({
            chatId,
            userId: 123,
            message: 'un message',
            attachmentName: null,
            ...dependencies,
          });
          await waitForStreamFinalizationToBeDone();
          const llmResponse = resultChunks.join('');

          // then
          expect(llmResponse).to.deep.equal(
            "data: coucou c'est super\n\ndata: \ndata: le couscous c plutot bon\n\ndata:  mais la paella c pas mal aussi\ndata: \n\nevent: debug-input-tokens\ndata: 3000\n\nevent: debug-output-tokens\ndata: 5000\n\n",
          );
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
            haveVictoryConditionsBeenFulfilled: false,
            totalInputTokens: 3000,
            totalOutputTokens: 5000,
            userId: null,
          });
          expect(messagesDB[0]).to.deep.include({
            index: 0,
            content: 'coucou user1',
            emitter: 'user',
            attachmentName: null,
            wasModerated: null,
          });
          expect(messagesDB[1]).to.deep.include({
            index: 1,
            content: 'coucou LLM1',
            emitter: 'assistant',
            attachmentName: null,
            wasModerated: null,
          });
          expect(messagesDB[2]).to.deep.include({
            index: 2,
            content: 'un message',
            emitter: 'user',
            wasModerated: false,
            attachmentName: null,
          });
          expect(messagesDB[3]).to.deep.include({
            index: 3,
            content: "coucou c'est super\nle couscous c plutot bon mais la paella c pas mal aussi\n",
            emitter: 'assistant',
            attachmentName: null,
            wasModerated: null,
          });
          expect(llmPostPromptScope.isDone()).to.be.true;
        });
      });

      context('when chat is not a preview chat', function () {
        it('should not write any information regarding token consumption in the stream', async function () {
          // given
          const chat = new Chat({
            id: chatId,
            userId: 123,
            configurationId,
            configuration,
            haveVictoryConditionsBeenFulfilled: false,
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
          await promptChat({
            chatId,
            userId: 123,
            message: 'un message',
            attachmentName: null,
            ...dependencies,
          });
          await waitForStreamFinalizationToBeDone();
          const llmResponse = resultChunks.join('');

          // then
          expect(llmResponse).to.deep.equal(
            "data: coucou c'est super\n\ndata: \ndata: le couscous c plutot bon\n\ndata:  mais la paella c pas mal aussi\ndata: \n\n",
          );
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
            haveVictoryConditionsBeenFulfilled: false,
            totalInputTokens: 0,
            totalOutputTokens: 0,
          });
          expect(messagesDB[0]).to.deep.include({
            index: 0,
            content: 'coucou user1',
            emitter: 'user',
            attachmentName: null,
            wasModerated: null,
          });
          expect(messagesDB[1]).to.deep.include({
            index: 1,
            content: 'coucou LLM1',
            emitter: 'assistant',
            attachmentName: null,
            wasModerated: null,
          });
          expect(messagesDB[2]).to.deep.include({
            index: 2,
            content: 'un message',
            emitter: 'user',
            wasModerated: false,
            attachmentName: null,
          });
          expect(messagesDB[3]).to.deep.include({
            index: 3,
            content: "coucou c'est super\nle couscous c plutot bon mais la paella c pas mal aussi\n",
            emitter: 'assistant',
            attachmentName: null,
            wasModerated: null,
          });
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

    it('should write a stream which will contain the partial llm response and the error, but persist nothing', async function () {
      // given
      const chat = new Chat({
        id: chatId,
        userId: 123,
        configurationId,
        configuration,
        haveVictoryConditionsBeenFulfilled: false,
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
      const logger = { error: sinon.stub() };

      // when
      await promptChat({
        chatId,
        userId: 123,
        message: 'un message',
        attachmentName: null,
        logger,
        ...dependencies,
      });
      await waitForStreamFinalizationToBeDone();
      const llmResponse = resultChunks.join('');

      // then
      expect(llmResponse).to.deep.equal(
        "data: coucou c'est super\n\ndata: \ndata: le couscous c plutot bon\n\nevent: error\ndata: \n\n",
      );
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
        haveVictoryConditionsBeenFulfilled: false,
        totalInputTokens: 0,
        totalOutputTokens: 0,
      });
      expect(messagesDB).to.deep.equal([
        {
          index: 0,
          content: 'coucou user1',
          emitter: 'user',
          attachmentName: null,
          wasModerated: null,
        },
        {
          index: 1,
          content: 'coucou LLM1',
          emitter: 'assistant',
          attachmentName: null,
          wasModerated: null,
        },
      ]);
      expect(llmPostPromptScope.isDone()).to.be.true;
      expect(logger.error).to.have.been.calledOnce;
      expect(logger.error).to.have.been.calledOnceWith(
        {
          err: sinon.match.instanceOf(LLMApiError),
          context: 'prompt-chat',
          data: {
            chatId,
            lastUserMessage: sinon.match.object,
            llmResponseMetadata: sinon.match.object,
          },
        },
        'error in runFlow',
      );
    });
  });
});

function buildBasicUserMessage(content, index) {
  return new Message({
    index,
    content,
    emitter: 'user',
  });
}

function buildBasicAssistantMessage(content, index) {
  return new Message({
    index,
    content,
    emitter: 'assistant',
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
      wasModerated: messageDTO.wasModerated ?? null,
      attachmentName: messageDTO.attachmentName ?? null,
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
        'haveVictoryConditionsBeenFulfilled',
        'totalInputTokens',
        'totalOutputTokens',
      )
      .first(),
    messagesDB: await knex('chat_messages')
      .select('index', 'emitter', 'attachmentName', 'content', 'wasModerated')
      .where({ chatId })
      .orderBy('index'),
  };
}

function setupResponseStream() {
  const resultChunks = [];
  const responseStream = new WritableStream({
    write(chunk) {
      resultChunks.push(chunk);
    },
  });
  const llmResponseHandler = new LLMResponseHandler(responseStream);

  return { llmResponseHandler, resultChunks };
}
