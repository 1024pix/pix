import { assertGreaterOrEqualToZero, assertNotNullOrUndefined } from '../../../shared/domain/models/asserts.js';
import {
  IncorrectMessagesOrderingError,
  MaxPromptsReachedError,
  NoAttachmentNeededError,
  NoAttachmentNorMessageProvidedError,
  TooLargeMessageInputError,
} from '../errors.js';
import { Configuration } from './Configuration.js';

export class Chat {
  /**
   * @param {Object} params
   * @param {string} params.id
   * @param {number=} params.userId
   * @param {number=} params.assessmentId
   * @param {string=} params.challengeId
   * @param {number=} params.passageId
   * @param {number=} params.moduleId
   * @param {string} params.configurationId
   * @param {Configuration} params.configuration
   * @param {boolean=} params.haveVictoryConditionsBeenFulfilled
   * @param {number|undefined} params.totalInputTokens
   * @param {number|undefined} params.totalOutputTokens
   * @param {Message[]} params.messages
   */
  constructor({
    id,
    userId,
    assessmentId,
    challengeId,
    passageId,
    moduleId,
    configurationId,
    configuration,
    haveVictoryConditionsBeenFulfilled,
    messages = [],
    totalInputTokens,
    totalOutputTokens,
  }) {
    this.id = id;
    this.userId = userId;
    this.assessmentId = assessmentId;
    this.challengeId = challengeId;
    this.passageId = passageId;
    this.moduleId = moduleId;
    this.configurationId = configurationId;
    this.configuration = configuration;
    this.messages = messages.toSorted((messA, messB) => messA.index - messB.index);
    this.haveVictoryConditionsBeenFulfilled = haveVictoryConditionsBeenFulfilled;
    this.totalInputTokens = totalInputTokens;
    this.totalOutputTokens = totalOutputTokens;
  }

  static get ATTACHMENT_STATUS() {
    return {
      NONE: 'NONE',
      SUCCESS: 'SUCCESS',
      FAILURE: 'FAILURE',
    };
  }

  get hasAttachmentContextBeenAdded() {
    assertNotNullOrUndefined(
      this.configuration.attachmentName,
      'Configuration must have an attachment config setup to call this getter',
    );
    return this.messages.some((message) => this.isAttachmentValid(message.attachmentName));
  }

  get isPreview() {
    return !this.userId;
  }

  get hasVictoryConditions() {
    return this.configuration.hasVictoryConditions;
  }

  get currentUserPromptsCount() {
    const userMessages = this.messages.filter((message) => message.emitter === 'user');

    if (!this.configuration.hasAttachment) return userMessages.length;

    let isAttachmentAlreadyInContext = false;
    let count = 0;
    for (const message of userMessages) {
      if (!message.attachmentName) {
        count++;
        continue;
      }

      // valid attachment should only count once
      if (this.isAttachmentValid(message.attachmentName) && !isAttachmentAlreadyInContext) {
        isAttachmentAlreadyInContext = true;
        count++;
        continue;
      }

      const isAttachmentOnly = !message.content;
      if (isAttachmentAlreadyInContext && isAttachmentOnly) continue;

      count++;
    }

    return count;
  }

  get messagesForInference() {
    const messagesForInference = [];
    let isAttachmentAlreadyInContext = false;
    for (const message of this.messages) {
      if (message.wasModerated) continue;

      const isAssistantMessage = message.emitter === 'assistant';
      const noAttachmentExpectedForConfig = !this.configuration.hasAttachment;
      const noAttachmentInMessage = !message.attachmentName;
      if (isAssistantMessage || noAttachmentExpectedForConfig || noAttachmentInMessage) {
        messagesForInference.push({
          role: message.emitter,
          content: message.content,
        });
        continue;
      }

      if (this.isAttachmentValid(message.attachmentName) && !isAttachmentAlreadyInContext) {
        messagesForInference.push(
          {
            role: 'user',
            content: `<system_notification>L'utilisateur a téléversé une pièce jointe : <attachment_name>${message.attachmentName}</attachment_name></system_notification>`,
          },
          {
            role: 'assistant',
            content: `<read_attachment_tool>Lecture de la pièce jointe, ${message.attachmentName} : <attachment_content>${this.configuration.attachmentContext}</attachment_content></read_attachment_tool>`,
          },
        );
        isAttachmentAlreadyInContext = true;
      }

      if (isAttachmentAlreadyInContext && message.content) {
        messagesForInference.push({
          role: message.emitter,
          content: message.content,
        });
      }
    }

    return messagesForInference;
  }

  get shouldSendForInference() {
    if (this.messagesForInference.length === 0) return false;

    const lastMessage = this.messages.at(-1);
    const isFromUser = lastMessage.emitter === 'user';
    if (!isFromUser) return false;

    if (!this.configuration.hasAttachment) return true;

    const hasContent = !!lastMessage.content;
    const hasAttachment = !!lastMessage.attachmentName;
    if (this.hasAttachmentContextBeenAdded) {
      return hasContent;
    }

    if (hasAttachment) return false; // since hasAttachmentContextBeenAdded is false, it means the attachment was invalid
    return hasContent;
  }

  get lastAttachmentStatus() {
    const lastMessage = this.messages.at(-1);
    if (!lastMessage?.attachmentName) return Chat.ATTACHMENT_STATUS.NONE;
    return this.isAttachmentValid(lastMessage.attachmentName)
      ? Chat.ATTACHMENT_STATUS.SUCCESS
      : Chat.ATTACHMENT_STATUS.FAILURE;
  }

  get lastUserMessage() {
    return this.messages.findLast((message) => message.emitter === 'user');
  }

  /**
   * @param {string=} content
   * @param {string=} attachmentName
   */
  addUserMessage(content, attachmentName) {
    if (!content && !attachmentName) {
      throw new NoAttachmentNorMessageProvidedError();
    }
    if (attachmentName && !this.configuration.hasAttachment) {
      throw new NoAttachmentNeededError();
    }
    if (content) {
      if (content.length > this.configuration.inputMaxChars) {
        throw new TooLargeMessageInputError();
      }

      if (this.currentUserPromptsCount >= this.configuration.inputMaxPrompts) {
        throw new MaxPromptsReachedError();
      }
    }

    if (this.messagesForInference.at(-1)?.role === 'user') {
      throw new IncorrectMessagesOrderingError();
    }

    this.messages.push(
      new Message({
        index: this.messages.length,
        content,
        emitter: 'user',
        attachmentName: attachmentName ?? null,
        wasModerated: null,
      }),
    );
  }

  /**
   * @param {string=} content
   */
  addAssistantMessage(content) {
    if (!content) {
      throw new NoAttachmentNorMessageProvidedError();
    }

    if (this.messages.length === 0) {
      throw new IncorrectMessagesOrderingError();
    }

    if (this.messages.at(-1).emitter === 'assistant') {
      throw new IncorrectMessagesOrderingError();
    }

    this.messages.push(
      new Message({
        index: this.messages.length,
        content,
        emitter: 'assistant',
        attachmentName: null,
        wasModerated: null,
      }),
    );
  }

  /**
   * @param {number} inputTokens
   * @param {number} outputTokens
   */
  updateTokenConsumption(inputTokens, outputTokens) {
    this.totalInputTokens += inputTokens;
    this.totalOutputTokens += outputTokens;
  }

  /**
   * @param {string} attachmentName
   */
  isAttachmentValid(attachmentName) {
    if (!this.configuration.hasAttachment || !attachmentName) {
      return false;
    }
    const fileExtension = attachmentName.split('.').at(-1);
    const attachmentFilename = attachmentName.split('.').slice(0, -1).join('');
    const fileExtensionFromConfig = this.configuration.attachmentName.split('.').at(-1);
    const attachmentFilenameFromConfig = this.configuration.attachmentName.split('.').slice(0, -1).join('');
    if (fileExtension !== fileExtensionFromConfig) {
      return false;
    }
    return attachmentFilename.includes(attachmentFilenameFromConfig);
  }

  toDTO() {
    return {
      id: this.id,
      userId: this.userId,
      assessmentId: this.assessmentId,
      challengeId: this.challengeId,
      moduleId: this.moduleId,
      passageId: this.passageId,
      configurationId: this.configurationId,
      configuration: this.configuration.toDTO(),
      haveVictoryConditionsBeenFulfilled: this.haveVictoryConditionsBeenFulfilled,
      messages: this.messages.map((message) => message.toDTO()),
      totalInputTokens: this.totalInputTokens,
      totalOutputTokens: this.totalOutputTokens,
    };
  }

  static fromDTO(chatDTO) {
    return new Chat({
      ...chatDTO,
      configuration: Configuration.fromDTO(chatDTO.configuration),
      messages: chatDTO.messages.map((messageDTO) => new Message(messageDTO)),
    });
  }
}

export class Message {
  /**
   * @constructor
   * @param {Object} params
   * @param {string=} params.index
   * @param {string=} params.content
   * @param {string=} params.attachmentName
   * @param {'user' | 'assistant'} params.emitter
   * @param {boolean=} params.wasModerated
   */
  constructor({ index, content, attachmentName, emitter, wasModerated }) {
    assertGreaterOrEqualToZero(index, 'index shall be greater or equal to 0');
    this.index = index;
    this.content = content;
    this.emitter = emitter;
    this.attachmentName = attachmentName;
    this.wasModerated = wasModerated;
  }

  toDTO() {
    return {
      index: this.index,
      content: this.content,
      attachmentName: this.attachmentName,
      emitter: this.emitter,
      wasModerated: this.wasModerated,
    };
  }
}
