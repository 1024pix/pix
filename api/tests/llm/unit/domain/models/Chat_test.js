import {
  IncorrectMessagesOrderingError,
  MaxPromptsReachedError,
  NoAttachmentNeededError,
  NoAttachmentNorMessageProvidedError,
  TooLargeMessageInputError,
} from '../../../../../src/llm/domain/errors.js';
import { Chat, Message } from '../../../../../src/llm/domain/models/Chat.js';
import { Configuration } from '../../../../../src/llm/domain/models/Configuration.js';

import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('LLM | Unit | Domain | Models | Chat', function () {
  describe('#constructor', function () {
    it('should reorder messages according to their index', function () {
      const messages = [
        domainBuilder.llm.buildUserMessage({
          index: 2,
          content: 'que contient cette piece jointe ?',
          attachmentName: 'wrong_file.txt',
        }),
        domainBuilder.llm.buildAssistantMessage({ index: 1, content: 'oui bien sur' }),
        domainBuilder.llm.buildUserMessage({ index: 0, content: 'Peux tu m aider ?' }),
        domainBuilder.llm.buildAssistantMessage({ index: 3, content: 'je sais pas ce que c' }),
      ];
      const configuration = domainBuilder.llm.buildConfiguration({ attachmentName: 'right_file.txt' });
      const chat = new Chat({
        id: 'fael-le-filou',
        userId: 123,
        assessmentId: 456,
        challengeId: 'recChallengeABC123',
        configuration,
        haveVictoryConditionsBeenFulfilled: null,
        messages,
        totalInputTokens: 456,
        totalOutputTokens: 456,
      });

      expect(chat.messages).to.deepEqualArray([
        domainBuilder.llm.buildUserMessage({ index: 0, content: 'Peux tu m aider ?' }),
        domainBuilder.llm.buildAssistantMessage({ index: 1, content: 'oui bien sur' }),
        domainBuilder.llm.buildUserMessage({
          index: 2,
          content: 'que contient cette piece jointe ?',
          attachmentName: 'wrong_file.txt',
        }),
        domainBuilder.llm.buildAssistantMessage({ index: 3, content: 'je sais pas ce que c' }),
      ]);
    });
  });
  describe('#get hasAttachmentContextBeenAdded', function () {
    context('when there are no user messages with the expected attachment', function () {
      it('returns false', function () {
        const messages = [
          domainBuilder.llm.buildUserMessage({ index: 0, content: 'Peux tu m aider ?' }),
          domainBuilder.llm.buildAssistantMessage({ index: 1, content: 'oui bien sur' }),
          domainBuilder.llm.buildUserMessage({
            index: 2,
            content: 'que contient cette piece jointe ?',
            attachmentName: 'wrong_file.txt',
          }),
          domainBuilder.llm.buildAssistantMessage({ index: 3, content: 'je sais pas ce que c' }),
        ];
        const configuration = domainBuilder.llm.buildConfiguration({ attachmentName: 'right_file.txt' });
        const chat = domainBuilder.llm.buildChat({ messages, configuration });

        expect(chat.hasAttachmentContextBeenAdded).to.be.false;
      });
    });

    context('when there is a user message with the expected attachment', function () {
      it('returns true', function () {
        const messages = [
          domainBuilder.llm.buildUserMessage({ index: 0, content: 'Peux tu m aider ?' }),
          domainBuilder.llm.buildAssistantMessage({ index: 1, content: 'oui bien sur' }),
          domainBuilder.llm.buildUserMessage({
            index: 2,
            content: 'que contient cette piece jointe ?',
            attachmentName: 'right_file.txt',
          }),
          domainBuilder.llm.buildAssistantMessage({ index: 3, content: 'je sais pas ce que c' }),
        ];
        const configuration = domainBuilder.llm.buildConfiguration({ attachmentName: 'right_file.txt' });
        const chat = domainBuilder.llm.buildChat({ messages, configuration });

        expect(chat.hasAttachmentContextBeenAdded).to.be.true;
      });
    });

    context('when configuration does not expect an attachment to be transmitted', function () {
      it('throws', function () {
        const messages = [
          domainBuilder.llm.buildUserMessage({ index: 0, content: 'Peux tu m aider ?' }),
          domainBuilder.llm.buildAssistantMessage({ index: 1, content: 'oui bien sur' }),
        ];
        const configuration = domainBuilder.llm.buildConfiguration({ attachmentName: null });
        const chat = domainBuilder.llm.buildChat({ messages, configuration });

        expect(() => chat.hasAttachmentContextBeenAdded).to.throw(
          'Configuration must have an attachment config setup to call this getter',
        );
      });
    });
  });
  describe('#get hasVictoryConditions', function () {
    context('when chat has victory conditions', function () {
      it('should return true', function () {
        // given
        const chat = new Chat({
          id: 'some-chat-id',
          configuration: new Configuration({
            challenge: { victoryConditions: { expectations: ['super_victory_condition'] } },
          }),
          messages: [],
        });

        // then
        expect(chat).to.have.property('hasVictoryConditions', true);
      });
    });
    context('when chat has no victory conditions', function () {
      it('should return false', function () {
        // given
        const chat = new Chat({
          id: 'some-chat-id',
          configuration: new Configuration({}),
          messages: [],
        });

        // then
        expect(chat).to.have.property('hasVictoryConditions', false);
      });
    });
  });

  describe('#get isPreview', function () {
    context('when userId is defined', function () {
      it('returns false', function () {
        const chat = domainBuilder.llm.buildChat({ userId: 789 });

        expect(chat.isPreview).to.be.false;
      });
    });

    context('when userId is not defined', function () {
      it('returns true', function () {
        const chat = domainBuilder.llm.buildChat({ userId: null });

        expect(chat.isPreview).to.be.true;
      });
    });
  });

  describe('#get currentUserPromptsCount', function () {
    context('when the expected attachment has already been added to context', function () {
      let configuration, messages;
      beforeEach(function () {
        configuration = domainBuilder.llm.buildConfiguration({ attachmentName: 'recette_patate.pdf' });
        messages = [
          domainBuilder.llm.buildUserMessage({
            index: 0,
            content: 'G besoin de cb de patates',
            attachmentName: 'recette_patate.pdf',
          }),
          domainBuilder.llm.buildAssistantMessage({ index: 1, content: '3 !' }),
        ];
      });

      context('after user sends a message with content but not attachment', function () {
        it('should count', function () {
          messages.push(domainBuilder.llm.buildUserMessage({ index: 2, content: 'wow, merci', attachmentName: null }));
          const chat = domainBuilder.llm.buildChat({ configuration, messages });

          expect(chat.currentUserPromptsCount).to.equal(2);
        });
      });

      context('after user sends a message with content and wrong attachment', function () {
        it('should count', function () {
          messages.push(
            domainBuilder.llm.buildUserMessage({
              index: 2,
              content: 'wow, merci, et dans cette recette ?',
              attachmentName: 'recette_haricots.pdf',
            }),
          );
          const chat = domainBuilder.llm.buildChat({ configuration, messages });

          expect(chat.currentUserPromptsCount).to.equal(2);
        });
      });

      context('after user sends a message with content and right attachment', function () {
        it('should count', function () {
          messages.push(
            domainBuilder.llm.buildUserMessage({
              index: 2,
              content: 'wow, merci, et dans cette recette ?',
              attachmentName: 'recette_patate.pdf',
            }),
          );
          const chat = domainBuilder.llm.buildChat({ configuration, messages });

          expect(chat.currentUserPromptsCount).to.equal(2);
        });
      });

      context('after user sends a message with no content and wrong attachment', function () {
        it('should NOT count', function () {
          messages.push(
            domainBuilder.llm.buildUserMessage({
              index: 2,
              content: null,
              attachmentName: 'recette_chaussettes.pdf',
            }),
          );
          const chat = domainBuilder.llm.buildChat({ configuration, messages });

          expect(chat.currentUserPromptsCount).to.equal(1);
        });
      });

      context('after user sends a message with no content and right attachment', function () {
        it('should NOT count', function () {
          messages.push(
            domainBuilder.llm.buildUserMessage({
              index: 2,
              content: null,
              attachmentName: 'recette_patate.pdf',
            }),
          );
          const chat = domainBuilder.llm.buildChat({ configuration, messages });

          expect(chat.currentUserPromptsCount).to.equal(1);
        });
      });
    });

    context('when the expected attachment has not already been added to context', function () {
      let configuration, messages;
      beforeEach(function () {
        configuration = domainBuilder.llm.buildConfiguration({ attachmentName: 'recette_patate.pdf' });
        messages = [
          domainBuilder.llm.buildUserMessage({
            index: 0,
            content: 'G besoin de cb de patates',
            attachmentName: null,
          }),
          domainBuilder.llm.buildAssistantMessage({ index: 1, content: 'Beaucoup' }),
        ];
      });

      context('after user sends a message with content but not attachment', function () {
        it('should count', function () {
          messages.push(domainBuilder.llm.buildUserMessage({ index: 2, content: 'wow, merci', attachmentName: null }));
          const chat = domainBuilder.llm.buildChat({ configuration, messages });

          expect(chat.currentUserPromptsCount).to.equal(2);
        });
      });

      context('after user sends a message with content and wrong attachment', function () {
        it('should count', function () {
          messages.push(
            domainBuilder.llm.buildUserMessage({
              index: 2,
              content: 'wow, merci, et dans cette recette ?',
              attachmentName: 'recette_haricots.pdf',
            }),
          );
          const chat = domainBuilder.llm.buildChat({ configuration, messages });

          expect(chat.currentUserPromptsCount).to.equal(2);
        });
      });

      context('after user sends a message with content and right attachment', function () {
        it('should count', function () {
          messages.push(
            domainBuilder.llm.buildUserMessage({
              index: 2,
              content: 'wow, merci, et dans cette recette ?',
              attachmentName: 'recette_patate.pdf',
            }),
          );
          const chat = domainBuilder.llm.buildChat({ configuration, messages });

          expect(chat.currentUserPromptsCount).to.equal(2);
        });
      });

      context('after user sends a message with no content and wrong attachment', function () {
        it('should count', function () {
          messages.push(
            domainBuilder.llm.buildUserMessage({
              index: 2,
              content: null,
              attachmentName: 'recette_chaussettes.pdf',
            }),
          );
          const chat = domainBuilder.llm.buildChat({ configuration, messages });

          expect(chat.currentUserPromptsCount).to.equal(2);
        });
      });

      context('after user sends a message with no content and right attachment', function () {
        it('should count', function () {
          messages.push(
            domainBuilder.llm.buildUserMessage({
              index: 2,
              content: null,
              attachmentName: 'recette_patate.pdf',
            }),
          );
          const chat = domainBuilder.llm.buildChat({ configuration, messages });

          expect(chat.currentUserPromptsCount).to.equal(2);
        });
      });
    });
  });

  describe('#get messagesForInference', function () {
    context('when the conversation only contains simple messages', function () {
      it('should return a list of messages for inference', function () {
        const messages = [
          domainBuilder.llm.buildUserMessage(),
          domainBuilder.llm.buildAssistantMessage(),
          domainBuilder.llm.buildUserMessage({ index: 2, content: 'super, merci chatpix' }),
        ];
        const chat = domainBuilder.llm.buildChat({ messages });

        const messagesForInference = chat.messagesForInference;
        expect(messagesForInference.length).to.equal(3);
        expect(messagesForInference[0].content).to.equal(messages[0].content);
        expect(messagesForInference[0].role).to.equal(messages[0].emitter);
        expect(messagesForInference[1].content).to.equal(messages[1].content);
        expect(messagesForInference[1].role).to.equal(messages[1].emitter);
        expect(messagesForInference[2].content).to.equal(messages[2].content);
        expect(messagesForInference[2].role).to.equal(messages[2].emitter);
      });
    });

    context('when some user messages have been moderated', function () {
      it('should return the list of messages not moderated', function () {
        const messages = [
          domainBuilder.llm.buildUserMessage(),
          domainBuilder.llm.buildAssistantMessage(),
          domainBuilder.llm.buildUserMessage({
            index: 2,
            content: 'Je vais écrire un truc méchant!',
            wasModerated: true,
          }),
          domainBuilder.llm.buildUserMessage({ index: 3, content: 'mais non je suis pipou' }),
        ];
        const chat = domainBuilder.llm.buildChat({ messages });

        const messagesForInference = chat.messagesForInference;
        expect(messagesForInference.length).to.equal(3);
        expect(messagesForInference[0].content).to.equal(messages[0].content);
        expect(messagesForInference[0].role).to.equal(messages[0].emitter);
        expect(messagesForInference[1].content).to.equal(messages[1].content);
        expect(messagesForInference[1].role).to.equal(messages[1].emitter);
        expect(messagesForInference[2].content).to.equal(messages[3].content);
        expect(messagesForInference[2].role).to.equal(messages[3].emitter);
      });
    });

    context('when the expected attachment has been sent by the user', function () {
      let configuration, messages, validAttachmentUserMessage, validAttachmentAssistantMessage;
      beforeEach(function () {
        configuration = domainBuilder.llm.buildConfiguration({
          attachmentName: 'recette_patate.pdf',
          attachmentContext: `Soupe de patates aux poireaux :
          Ingrédients:
          - 3 patates
          - 2 poireaux
          `,
        });
        messages = [
          domainBuilder.llm.buildUserMessage({
            index: 0,
            attachmentName: 'recette_patate.pdf',
            content: null,
          }),
        ];
        validAttachmentUserMessage =
          "<system_notification>L'utilisateur a téléversé une pièce jointe : <attachment_name>recette_patate.pdf</attachment_name></system_notification>";
        validAttachmentAssistantMessage = `<read_attachment_tool>Lecture de la pièce jointe, recette_patate.pdf : <attachment_content>Soupe de patates aux poireaux :
          Ingrédients:
          - 3 patates
          - 2 poireaux
          </attachment_content></read_attachment_tool>`;
      });

      context('when the user sends a message with content only', function () {
        it('should still have the attachment in context', function () {
          messages.push(
            domainBuilder.llm.buildUserMessage({ index: 1, content: 'Combien de patates ?', attachmentName: null }),
          );
          const chat = domainBuilder.llm.buildChat({ configuration, messages });

          const messagesForInference = chat.messagesForInference;
          expect(messagesForInference[0].content).to.equal(validAttachmentUserMessage);
          expect(messagesForInference[0].role).to.equal('user');
          expect(messagesForInference[1].content).to.equal(validAttachmentAssistantMessage);
          expect(messagesForInference[1].role).to.equal('assistant');
          expect(messagesForInference[2].content).to.equal('Combien de patates ?');
          expect(messagesForInference[2].role).to.equal('user');
          expect(messagesForInference.length).to.equal(3);
        });
      });

      context('when the user sends a message with only wrong attachment', function () {
        context('when the user sends another message afterwards', function () {
          it('should not include the wrong attachment message', function () {
            messages.push(
              domainBuilder.llm.buildUserMessage({ index: 1, attachmentName: 'chocolat.txt', content: null }),
              domainBuilder.llm.buildUserMessage({ index: 2, content: 'Combien de poireaux ?' }),
            );
            const chat = domainBuilder.llm.buildChat({ configuration, messages });

            const messagesForInference = chat.messagesForInference;
            expect(messagesForInference[0].content).to.equal(validAttachmentUserMessage);
            expect(messagesForInference[0].role).to.equal('user');
            expect(messagesForInference[1].content).to.equal(validAttachmentAssistantMessage);
            expect(messagesForInference[1].role).to.equal('assistant');
            expect(messagesForInference[2].content).to.equal('Combien de poireaux ?');
            expect(messagesForInference[2].role).to.equal('user');
            expect(messagesForInference.length).to.equal(3);
          });
        });
      });

      context('when the user sends a message with wrong attachment and content', function () {
        it('should ignore the attachment and include the message content', function () {
          messages.push(
            domainBuilder.llm.buildUserMessage({
              index: 1,
              attachmentName: 'erreur.txt',
              content: 'Et combien de grammes de sel ?',
            }),
          );
          const chat = domainBuilder.llm.buildChat({ configuration, messages });

          const messagesForInference = chat.messagesForInference;
          expect(messagesForInference[0].content).to.equal(validAttachmentUserMessage);
          expect(messagesForInference[0].role).to.equal('user');
          expect(messagesForInference[1].content).to.equal(validAttachmentAssistantMessage);
          expect(messagesForInference[1].role).to.equal('assistant');
          expect(messagesForInference[2].content).to.equal('Et combien de grammes de sel ?');
          expect(messagesForInference[2].role).to.equal('user');
          expect(messagesForInference.length).to.equal(3);
        });
      });

      context('when the user sends a message with only valid attachment', function () {
        context('when the user sends another message afterwards', function () {
          it('should not include a new valid attachment message', function () {
            messages.push(
              domainBuilder.llm.buildUserMessage({ index: 1, attachmentName: 'recette_patate.pdf', content: null }),
              domainBuilder.llm.buildUserMessage({ index: 2, content: 'Combien de poireaux ?' }),
            );
            const chat = domainBuilder.llm.buildChat({ configuration, messages });

            const messagesForInference = chat.messagesForInference;
            expect(messagesForInference[0].content).to.equal(validAttachmentUserMessage);
            expect(messagesForInference[0].role).to.equal('user');
            expect(messagesForInference[1].content).to.equal(validAttachmentAssistantMessage);
            expect(messagesForInference[1].role).to.equal('assistant');
            expect(messagesForInference[2].content).to.equal('Combien de poireaux ?');
            expect(messagesForInference[2].role).to.equal('user');
            expect(messagesForInference.length).to.equal(3);
          });
        });
      });

      context('when the user sends a message with valid attachment and content', function () {
        it('should ignore the attachment and include the message content', function () {
          messages.push(
            domainBuilder.llm.buildUserMessage({
              index: 1,
              attachmentName: 'recette_patate.pdf',
              content: 'Et combien de grammes de sel ?',
            }),
          );
          const chat = domainBuilder.llm.buildChat({ configuration, messages });

          const messagesForInference = chat.messagesForInference;
          expect(messagesForInference[0].content).to.equal(validAttachmentUserMessage);
          expect(messagesForInference[0].role).to.equal('user');
          expect(messagesForInference[1].content).to.equal(validAttachmentAssistantMessage);
          expect(messagesForInference[1].role).to.equal('assistant');
          expect(messagesForInference[2].content).to.equal('Et combien de grammes de sel ?');
          expect(messagesForInference[2].role).to.equal('user');
          expect(messagesForInference.length).to.equal(3);
        });
      });
    });

    context('when the expected attachment has not been sent by the user', function () {
      let configuration, validAttachmentUserMessage, validAttachmentAssistantMessage;
      beforeEach(function () {
        configuration = domainBuilder.llm.buildConfiguration({
          attachmentName: 'recette_patate.pdf',
          attachmentContext: `Soupe de patates aux poireaux :
          Ingrédients:
          - 3 patates
          - 2 poireaux
          `,
        });
        validAttachmentUserMessage =
          "<system_notification>L'utilisateur a téléversé une pièce jointe : <attachment_name>recette_patate.pdf</attachment_name></system_notification>";
        validAttachmentAssistantMessage = `<read_attachment_tool>Lecture de la pièce jointe, recette_patate.pdf : <attachment_content>Soupe de patates aux poireaux :
          Ingrédients:
          - 3 patates
          - 2 poireaux
          </attachment_content></read_attachment_tool>`;
      });

      context('when the user sends a message with only wrong attachment', function () {
        context('when the user sends another message afterwards', function () {
          it('should not include the wrong attachment message', function () {
            const messages = [
              domainBuilder.llm.buildUserMessage({ index: 0, attachmentName: 'chocolat.txt', content: null }),
              domainBuilder.llm.buildUserMessage({ index: 1, content: 'Combien de poireaux ?' }),
            ];
            const chat = domainBuilder.llm.buildChat({ configuration, messages });

            const messagesForInference = chat.messagesForInference;
            expect(messagesForInference[0].content).to.equal('Combien de poireaux ?');
            expect(messagesForInference[0].role).to.equal('user');
            expect(messagesForInference.length).to.equal(1);
          });
        });
      });

      context('when the user sends a message with wrong attachment and content', function () {
        context('when the user sends another message afterwards', function () {
          it('should not include the wrong attachment message', function () {
            const messages = [
              domainBuilder.llm.buildUserMessage({
                index: 0,
                attachmentName: 'wrong.pdf',
                content: 'Combien de patates ?',
              }),
              domainBuilder.llm.buildUserMessage({ index: 1, content: 'Ah mince' }),
            ];
            const chat = domainBuilder.llm.buildChat({ configuration, messages });

            const messagesForInference = chat.messagesForInference;
            expect(messagesForInference[0].content).to.equal('Ah mince');
            expect(messagesForInference[0].role).to.equal('user');
            expect(messagesForInference.length).to.equal(1);
          });
        });
      });

      context('when the user sends a message with only valid attachment', function () {
        context('when the user sends another message afterwards', function () {
          it('should include the valid attachment message', function () {
            const messages = [
              domainBuilder.llm.buildUserMessage({ index: 0, attachmentName: 'recette_patate.pdf', content: null }),
              domainBuilder.llm.buildUserMessage({ index: 1, content: 'Combien de poireaux ?' }),
            ];
            const chat = domainBuilder.llm.buildChat({ configuration, messages });

            const messagesForInference = chat.messagesForInference;
            expect(messagesForInference[0].content).to.equal(validAttachmentUserMessage);
            expect(messagesForInference[0].role).to.equal('user');
            expect(messagesForInference[1].content).to.equal(validAttachmentAssistantMessage);
            expect(messagesForInference[1].role).to.equal('assistant');
            expect(messagesForInference[2].content).to.equal('Combien de poireaux ?');
            expect(messagesForInference[2].role).to.equal('user');
            expect(messagesForInference.length).to.equal(3);
          });
        });
      });

      context('when the user sends a message with valid attachment and content', function () {
        it('should include the attachment and message content', function () {
          const messages = [
            domainBuilder.llm.buildUserMessage({
              attachmentName: 'recette_patate.pdf',
              content: 'Combien de patates ?',
            }),
          ];
          const chat = domainBuilder.llm.buildChat({ configuration, messages });

          const messagesForInference = chat.messagesForInference;
          expect(messagesForInference[0].content).to.equal(validAttachmentUserMessage);
          expect(messagesForInference[0].role).to.equal('user');
          expect(messagesForInference[1].content).to.equal(validAttachmentAssistantMessage);
          expect(messagesForInference[1].role).to.equal('assistant');
          expect(messagesForInference[2].content).to.equal('Combien de patates ?');
          expect(messagesForInference[2].role).to.equal('user');
          expect(messagesForInference.length).to.equal(3);
        });
      });
    });
  });

  describe('#get shouldSendForInference', function () {
    const configuration = domainBuilder.llm.buildConfiguration({ attachmentName: 'concentration.pdf' });

    context('when attachment context is already loaded', function () {
      context('when last user message only has a content', function () {
        it('should return true', function () {
          const messages = [
            domainBuilder.llm.buildUserMessage({ index: 0, attachmentName: 'concentration.pdf', content: null }),
            domainBuilder.llm.buildUserMessage({ index: 1, content: 'On mange quoi ?' }),
          ];
          const chat = domainBuilder.llm.buildChat({ configuration, messages });

          expect(chat.shouldSendForInference).to.equal(true);
        });
      });

      context('when last user message has a content and a valid attachment', function () {
        it('should return true', function () {
          const messages = [
            domainBuilder.llm.buildUserMessage({ index: 0, attachmentName: 'concentration.pdf', content: null }),
            domainBuilder.llm.buildUserMessage({
              index: 1,
              attachmentName: 'concentration.pdf',
              content: 'On mange quoi ?',
            }),
          ];
          const chat = domainBuilder.llm.buildChat({ configuration, messages });

          expect(chat.shouldSendForInference).to.equal(true);
        });
      });

      context('when last user message has no content and a valid attachment', function () {
        it('should return false', function () {
          const messages = [
            domainBuilder.llm.buildUserMessage({ index: 0, attachmentName: 'concentration.pdf', content: null }),
            domainBuilder.llm.buildUserMessage({ index: 1, attachmentName: 'concentration.pdf', content: null }),
          ];
          const chat = domainBuilder.llm.buildChat({ configuration, messages });

          expect(chat.shouldSendForInference).to.equal(false);
        });
      });

      context('when last user message has a content and a wrong attachment', function () {
        it('should return true', function () {
          const messages = [
            domainBuilder.llm.buildUserMessage({ index: 0, attachmentName: 'concentration.pdf', content: null }),
            domainBuilder.llm.buildUserMessage({ index: 1, attachmentName: 'nul.pdf', content: 'On mange quoi ?' }),
          ];
          const chat = domainBuilder.llm.buildChat({ configuration, messages });

          expect(chat.shouldSendForInference).to.equal(true);
        });
      });

      context('when last user message has no content and a wrong attachment', function () {
        it('should return false', function () {
          const messages = [
            domainBuilder.llm.buildUserMessage({ index: 0, attachmentName: 'concentration.pdf', content: null }),
            domainBuilder.llm.buildUserMessage({ index: 1, attachmentName: 'menu_gouter.pdf', content: null }),
          ];
          const chat = domainBuilder.llm.buildChat({ configuration, messages });

          expect(chat.shouldSendForInference).to.equal(false);
        });
      });
    });

    context('when attachment context is not already loaded', function () {
      context('when last user message only has a content', function () {
        it('should return true', function () {
          const messages = [domainBuilder.llm.buildUserMessage({ content: 'On mange quoi ?' })];
          const chat = domainBuilder.llm.buildChat({ configuration, messages });

          expect(chat.shouldSendForInference).to.equal(true);
        });
      });

      context('when last user message has a content and a valid attachment', function () {
        it('should return true', function () {
          const messages = [
            domainBuilder.llm.buildUserMessage({ attachmentName: 'concentration.pdf', content: 'On mange quoi ?' }),
          ];
          const chat = domainBuilder.llm.buildChat({ configuration, messages });

          expect(chat.shouldSendForInference).to.equal(true);
        });
      });

      context('when last user message has no content and a valid attachment', function () {
        it('should return false', function () {
          const messages = [domainBuilder.llm.buildUserMessage({ attachmentName: 'concentration.pdf', content: null })];
          const chat = domainBuilder.llm.buildChat({ configuration, messages });

          expect(chat.shouldSendForInference).to.equal(false);
        });
      });

      context('when last user message has a content and a wrong attachment', function () {
        it('should return false', function () {
          const messages = [
            domainBuilder.llm.buildUserMessage({ attachmentName: 'nul.pdf', content: 'On mange quoi ?' }),
          ];
          const chat = domainBuilder.llm.buildChat({ configuration, messages });

          expect(chat.shouldSendForInference).to.equal(false);
        });
      });

      context('when last user message has no content and a wrong attachment', function () {
        it('should return false', function () {
          const messages = [domainBuilder.llm.buildUserMessage({ attachmentName: 'nul.pdf', content: null })];
          const chat = domainBuilder.llm.buildChat({ configuration, messages });

          expect(chat.shouldSendForInference).to.equal(false);
        });
      });
    });

    context('when there are no messages', function () {
      it('should return false', function () {
        const chat = domainBuilder.llm.buildChat({ configuration, messages: [] });

        expect(chat.shouldSendForInference).to.equal(false);
      });
    });

    context('when the last message is a user message with a content and no attachment', function () {
      it('should return true', function () {
        const messages = [domainBuilder.llm.buildUserMessage({ content: "C'est l'heure de s'arrêter pour le goûter" })];
        const chat = domainBuilder.llm.buildChat({ configuration, messages });

        expect(chat.shouldSendForInference).to.equal(true);
      });
    });
  });

  describe('#get lastAttachmentStatus', function () {
    const configuration = domainBuilder.llm.buildConfiguration({ attachmentName: 'test.pdf' });

    context('when last user message has a valid attachment', function () {
      it('should return SUCCESS', function () {
        const messages = [domainBuilder.llm.buildUserMessage({ content: 'Ok', attachmentName: 'test.pdf' })];
        const chat = domainBuilder.llm.buildChat({ configuration, messages });

        expect(chat.lastAttachmentStatus).to.equal(Chat.ATTACHMENT_STATUS.SUCCESS);
      });
    });

    context('when last user message has a wrong attachment', function () {
      it('should return FAILURE', function () {
        const messages = [domainBuilder.llm.buildUserMessage({ content: 'Pas ok', attachmentName: 'nul.txt' })];
        const chat = domainBuilder.llm.buildChat({ configuration, messages });

        expect(chat.lastAttachmentStatus).to.equal(Chat.ATTACHMENT_STATUS.FAILURE);
      });
    });

    context('when last user message has no attachment', function () {
      it('should return NONE', function () {
        const messages = [domainBuilder.llm.buildUserMessage({ content: 'Salut' })];
        const chat = domainBuilder.llm.buildChat({ configuration, messages });

        expect(chat.lastAttachmentStatus).to.equal(Chat.ATTACHMENT_STATUS.NONE);
      });
    });

    context('when no attachment is expected', function () {
      it('should return NONE', function () {
        const chat = domainBuilder.llm.buildChat({
          messages: [domainBuilder.llm.buildUserMessage({ content: 'Salut ' })],
        });

        expect(chat.lastAttachmentStatus).to.equal(Chat.ATTACHMENT_STATUS.NONE);
      });
    });
  });

  describe('#get lastUserMessage', function () {
    context('when there are messages', function () {
      it('should get the last user message', function () {
        const messages = [
          domainBuilder.llm.buildUserMessage({ index: 0, content: 'Salut' }),
          domainBuilder.llm.buildAssistantMessage({ index: 1, content: 'Bonjour !' }),
          domainBuilder.llm.buildUserMessage({ index: 2, content: 'Ça va ?' }),
          domainBuilder.llm.buildAssistantMessage({ index: 3, content: 'Plus maintenant.' }),
          domainBuilder.llm.buildUserMessage({ index: 4, content: 'Méchant va !' }),
        ];
        const chat = domainBuilder.llm.buildChat({ messages });

        const lastUserMessage = chat.lastUserMessage;

        expect(lastUserMessage).to.deepEqualInstance(
          domainBuilder.llm.buildUserMessage({ index: 4, content: 'Méchant va !' }),
        );
      });

      context('when last message is an assistant message', function () {
        it('should return last USER message', function () {
          const chat = domainBuilder.llm.buildChat({
            messages: [
              domainBuilder.llm.buildUserMessage({ index: 0, content: 'Salut' }),
              domainBuilder.llm.buildAssistantMessage({ index: 1, content: 'Bonjour !' }),
            ],
          });

          const lastUserMessage = chat.lastUserMessage;

          expect(lastUserMessage).to.deepEqualInstance(
            domainBuilder.llm.buildUserMessage({ index: 0, content: 'Salut' }),
          );
        });
      });
    });

    context('when there are no messages', function () {
      it('should return undefined', function () {
        const chat = domainBuilder.llm.buildChat({ messages: [] });

        expect(chat.lastUserMessage).to.be.undefined;
      });
    });
  });

  describe('#addUserMessage', function () {
    context('when neither content nor attachmentName are provided', function () {
      it('throws', function () {
        const chat = domainBuilder.llm.buildChat();
        expect(() => chat.addUserMessage(null, null)).to.throw(NoAttachmentNorMessageProvidedError);
      });
    });

    context('when adding an user message with an attachmentName', function () {
      context('no attachment is expected in the configuration', function () {
        it('throws', function () {
          const configuration = domainBuilder.llm.buildConfiguration({ attachmentName: null });
          const chat = domainBuilder.llm.buildChat({ configuration });
          expect(() => chat.addUserMessage(null, 'foo.txt')).to.throw(NoAttachmentNeededError);
        });
      });

      context('an attachment is expected in the configuration', function () {
        it('adds the message', function () {
          const configuration = domainBuilder.llm.buildConfiguration({ attachmentName: 'foo.txt' });
          const chat = domainBuilder.llm.buildChat({ configuration });

          chat.addUserMessage('patate', 'foo.txt');

          expect(chat.messages[0]).to.deepEqualInstance(
            new Message({
              index: 0,
              content: 'patate',
              attachmentName: 'foo.txt',
              emitter: 'user',
              wasModerated: null,
            }),
          );
        });
      });
    });

    context('when message content exceeds configuration inputMaxChars', function () {
      it('throws', function () {
        const configuration = domainBuilder.llm.buildConfiguration({ inputMaxChars: 10 });
        const chat = domainBuilder.llm.buildChat({ configuration });

        expect(() => chat.addUserMessage('Mon tonton tond ton tonton et ton tonton est tout tondu', null)).to.throw(
          TooLargeMessageInputError,
        );
      });
    });

    context('when user message count exceeds configuration inputMaxPrompts', function () {
      it('throws', function () {
        const configuration = domainBuilder.llm.buildConfiguration({ inputMaxPrompts: 1 });
        const messages = [
          domainBuilder.llm.buildUserMessage({ index: 0, content: 'Peux tu m aider ?' }),
          domainBuilder.llm.buildAssistantMessage({ index: 1, content: 'oui bien sur' }),
        ];
        const chat = domainBuilder.llm.buildChat({ messages, configuration });

        expect(() => chat.addUserMessage('Mon tonton tond ton tonton et ton tonton est tout tondu', null)).to.throw(
          MaxPromptsReachedError,
        );
      });
    });

    context('when chat already contains some messages', function () {
      context('when previous message is already a user message', function () {
        context('when previous message is a message with content only', function () {
          it('throws', function () {
            const messages = [domainBuilder.llm.buildUserMessage({ content: 'Peux tu m aider ?' })];
            const chat = domainBuilder.llm.buildChat({ messages });

            expect(() => chat.addUserMessage('Peux tu m aider ?')).to.throw(IncorrectMessagesOrderingError);
          });
        });

        context('when previous message is a message with an attachment', function () {
          it('should add the new user message', function () {
            const messages = [domainBuilder.llm.buildUserMessage({ attachmentName: 'aide.txt', content: null })];
            const configuration = domainBuilder.llm.buildConfiguration({ attachmentName: 'aide.txt' });
            const chat = domainBuilder.llm.buildChat({ messages, configuration });

            chat.addUserMessage("Peux-tu m'aider ?");

            expect(chat.messages[0]).to.deepEqualInstance(
              new Message({
                index: 0,
                content: null,
                attachmentName: 'aide.txt',
                emitter: 'user',
                wasModerated: false,
              }),
            );
            expect(chat.messages[1]).to.deepEqualInstance(
              new Message({
                index: 1,
                content: "Peux-tu m'aider ?",
                attachmentName: null,
                emitter: 'user',
                wasModerated: null,
              }),
            );
            expect(chat.messages.length).to.equal(2);
          });
        });

        context('when previous message was moderated', function () {
          it('should add the new user message', function () {
            const messages = [
              domainBuilder.llm.buildUserMessage({ content: 'Ordure, peux tu m aider ?', wasModerated: true }),
            ];
            const chat = domainBuilder.llm.buildChat({ messages });
            chat.addUserMessage("Peux-tu m'aider ?");

            expect(chat.messages.length).to.equal(2);
            expect(chat.messages[1]).to.deepEqualInstance(
              new Message({
                index: 1,
                content: "Peux-tu m'aider ?",
                attachmentName: null,
                emitter: 'user',
                wasModerated: null,
              }),
            );
          });
        });
      });

      it('should add user message to the messages and increment index attribute accordingly', function () {
        const messages = [
          domainBuilder.llm.buildUserMessage({ index: 0, content: 'Peux tu m aider ?' }),
          domainBuilder.llm.buildAssistantMessage({ index: 1, content: 'oui bien sur' }),
        ];
        const chat = domainBuilder.llm.buildChat({ messages });
        chat.addUserMessage('patate');

        expect(chat.messages[2]).to.deepEqualInstance(
          new Message({
            index: 2,
            content: 'patate',
            attachmentName: null,
            emitter: 'user',
            wasModerated: null,
          }),
        );
      });
    });
  });

  describe('#addAssistantMessage', function () {
    context('when message has content', function () {
      context('when chat has no messages', function () {
        it('throws', function () {
          const chat = domainBuilder.llm.buildChat();

          expect(() => chat.addAssistantMessage('chocolat')).to.throw(IncorrectMessagesOrderingError);
        });
      });

      context('when previous message is already an assistant message', function () {
        it('throws', function () {
          const messages = [
            domainBuilder.llm.buildUserMessage({ content: 'Parle avec toi-même pour voir' }),
            domainBuilder.llm.buildAssistantMessage({ content: 'Très bien. Salut ChatPix, ça va ?' }),
          ];
          const chat = domainBuilder.llm.buildChat({ messages });

          expect(() => chat.addAssistantMessage('Oui et toi ?')).to.throw(IncorrectMessagesOrderingError);
        });
      });

      it('adds the message', function () {
        const messages = [domainBuilder.llm.buildUserMessage({ content: '1 + 1 = 3 😌' })];
        const chat = domainBuilder.llm.buildChat({ messages });

        chat.addAssistantMessage(
          'Révolutionnaire. Toutes mes félicitations pour ce travail de recherche exceptionnel.',
        );

        expect(chat.messages[1]).to.deepEqualInstance(
          new Message({
            index: 1,
            content: 'Révolutionnaire. Toutes mes félicitations pour ce travail de recherche exceptionnel.',
            attachmentName: null,
            emitter: 'assistant',
            wasModerated: null,
          }),
        );
      });
    });

    context('when message has no content', function () {
      it('throws', function () {
        const messages = [domainBuilder.llm.buildUserMessage({ content: 'Ça donne quoi " ".trim() en javascript ?' })];
        const chat = domainBuilder.llm.buildChat({ messages });

        expect(() => chat.addAssistantMessage(null)).to.throw(NoAttachmentNorMessageProvidedError);
      });
    });
  });

  describe('#updateTokenConsumption', function () {
    it('adds to corresponding total the token counts in param', function () {
      // given
      const configurationDTO = Symbol('configurationDTO');
      const chat = new Chat({
        id: 'some-chat-id',
        userId: 123,
        configurationId: 'abc123',
        configuration: new Configuration(configurationDTO),
        haveVictoryConditionsBeenFulfilled: false,
        totalInputTokens: 1_000,
        totalOutputTokens: 10_000,
        messages: [
          new Message({
            index: 0,
            content: 'message user 1',
            emitter: 'user',
          }),
          new Message({
            index: 1,
            content: 'message llm 1',
            emitter: 'assistant',
          }),
        ],
      });

      // when
      chat.updateTokenConsumption(2_000, 5_000);

      // then
      expect(chat.toDTO()).to.deep.equal({
        id: 'some-chat-id',
        userId: 123,
        assessmentId: undefined,
        challengeId: undefined,
        moduleId: undefined,
        passageId: undefined,
        configurationId: 'abc123',
        configuration: configurationDTO,
        haveVictoryConditionsBeenFulfilled: false,
        totalInputTokens: 3_000,
        totalOutputTokens: 15_000,
        messages: [
          {
            index: 0,
            content: 'message user 1',
            attachmentName: undefined,
            emitter: 'user',
            wasModerated: undefined,
          },
          {
            index: 1,
            content: 'message llm 1',
            attachmentName: undefined,
            emitter: 'assistant',
            wasModerated: undefined,
          },
        ],
      });
    });
  });

  describe('#isAttachmentValid', function () {
    context('when configuration has no attachment', function () {
      it('returns false', function () {
        // given
        const chat = new Chat({
          id: 'some-chat-id',
          configuration: new Configuration({ id: 'some-config-id' }),
          messages: [],
        });

        // when
        const isAttachmentValid = chat.isAttachmentValid('myAttachmentName.pdf');

        // then
        expect(isAttachmentValid).to.be.false;
      });
    });

    context('when configuration has an attachment', function () {
      let chat;
      beforeEach(function () {
        chat = new Chat({
          id: 'some-chat-id',
          configuration: new Configuration({ id: 'some-config-id', attachment: { name: 'Le plan de ma maison.txt' } }),
          messages: [],
        });
      });

      context('success cases', function () {
        it('returns true when attachment name and extension is strictly identical', function () {
          // when
          const isAttachmentValid = chat.isAttachmentValid('Le plan de ma maison.txt');

          // then
          expect(isAttachmentValid).to.be.true;
        });

        it('returns true when attachment name has a prefix, but still contains the original expected name, and extension is identical', function () {
          // when
          const isAttachmentValid = chat.isAttachmentValid('(1) Le plan de ma maison.txt');

          // then
          expect(isAttachmentValid).to.be.true;
        });

        it('returns true when attachment name has a suffix, but still contains the original expected name, and extension is identical', function () {
          // when
          const isAttachmentValid = chat.isAttachmentValid('Le plan de ma maison COPIE(2).txt');

          // then
          expect(isAttachmentValid).to.be.true;
        });

        it('returns true when attachment name has both a suffix and a prefix, but still contains the original expected name, and extension is identical', function () {
          // when
          const isAttachmentValid = chat.isAttachmentValid('1_ Le plan de ma maison COPIE(2).txt');

          // then
          expect(isAttachmentValid).to.be.true;
        });
      });

      context('fail cases', function () {
        it('returns false when attachment name is OK but extension is wrong', function () {
          // when
          const isAttachmentValid = chat.isAttachmentValid('Le plan de ma maison.jpeg');

          // then
          expect(isAttachmentValid).to.be.false;
        });
        it('returns false when extension is ok but attachment name is wrong', function () {
          // when
          const isAttachmentValid = chat.isAttachmentValid('Le plan de mon jardin.txt');

          // then
          expect(isAttachmentValid).to.be.false;
        });
        it('returns false when extension is ok but attachment name is wrong, even if it contains all of the original name', function () {
          // when
          const isAttachmentValid = chat.isAttachmentValid('Le plan (COPIE)1 de ma maison.txt');

          // then
          expect(isAttachmentValid).to.be.false;
        });
      });
    });
  });

  describe('#toDTO', function () {
    it('should return the DTO version of the Chat model', function () {
      // given
      const chat = domainBuilder.llm.buildChat({
        id: 'some-chat-id',
        userId: 123,
        assessmentId: 456,
        challengeId: '789',
        haveVictoryConditionsBeenFulfilled: false,
        configurationId: 'abc123',
        configuration: domainBuilder.llm.buildConfiguration(),
        totalInputTokens: 2_000,
        totalOutputTokens: 5_000,
        messages: [
          domainBuilder.llm.buildUserMessage({ index: 0, content: 'message user 1', wasModerated: true }),
          domainBuilder.llm.buildAssistantMessage({ index: 1, content: 'message llm 1' }),
          domainBuilder.llm.buildUserMessage({ index: 2, content: 'message user 2', attachmentName: 'file.txt' }),
          domainBuilder.llm.buildAssistantMessage({ index: 3, content: 'message llm 2' }),
        ],
      });

      // when
      const dto = chat.toDTO();

      // then
      expect(dto).to.deep.equal({
        id: 'some-chat-id',
        userId: 123,
        assessmentId: 456,
        challengeId: '789',
        moduleId: null,
        passageId: null,
        configurationId: 'abc123',
        configuration: chat.configuration.toDTO(),
        haveVictoryConditionsBeenFulfilled: false,
        totalInputTokens: 2_000,
        totalOutputTokens: 5_000,
        messages: [
          {
            index: 0,
            content: 'message user 1',
            emitter: 'user',
            wasModerated: true,
            attachmentName: null,
          },
          {
            index: 1,
            content: 'message llm 1',
            emitter: 'assistant',
            attachmentName: null,
            wasModerated: null,
          },
          {
            index: 2,
            content: 'message user 2',
            emitter: 'user',
            attachmentName: 'file.txt',
            wasModerated: false,
          },
          {
            index: 3,
            content: 'message llm 2',
            emitter: 'assistant',
            attachmentName: null,
            wasModerated: null,
          },
        ],
      });
    });
  });

  describe('#fromDTO', function () {
    it('should return a Chat model', function () {
      // given
      const dto = {
        id: 'some-chat-id',
        userId: 123,
        configurationId: 'abc123',
        configuration: {},
        haveVictoryConditionsBeenFulfilled: false,
        messages: [
          {
            index: 0,
            content: 'message user 1',
            emitter: 'user',
            wasModerated: true,
          },
          {
            index: 1,
            content: 'message llm 1',
            emitter: 'assistant',
          },
          {
            index: 2,
            content: 'message user 2',
            emitter: 'user',
            attachmentName: 'file.txt',
          },
          {
            index: 3,
            content: 'message llm 2',
            emitter: 'assistant',
          },
        ],
      };

      // when
      const chat = Chat.fromDTO(dto);

      // then
      expect(chat).to.deepEqualInstance(
        new Chat({
          id: 'some-chat-id',
          userId: 123,
          configurationId: 'abc123',
          configuration: new Configuration({}), // Configuration model has no enumerable properties
          haveVictoryConditionsBeenFulfilled: false,
          messages: [
            new Message({
              index: 0,
              content: 'message user 1',
              emitter: 'user',
              wasModerated: true,
            }),
            new Message({
              index: 1,
              content: 'message llm 1',
              emitter: 'assistant',
            }),
            new Message({
              index: 2,
              attachmentName: 'file.txt',
              content: 'message user 2',
              emitter: 'user',
            }),
            new Message({
              index: 3,
              content: 'message llm 2',
              emitter: 'assistant',
            }),
          ],
        }),
      );
    });
  });
});
