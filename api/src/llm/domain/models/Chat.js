import { assertGreaterOrEqualToZero } from '../../../shared/domain/models/asserts.js';
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
   * @param {boolean} params.hasAttachmentContextBeenAdded
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
    hasAttachmentContextBeenAdded,
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
    this.hasAttachmentContextBeenAdded = hasAttachmentContextBeenAdded;
    this.messages = messages;
    this.totalInputTokens = totalInputTokens;
    this.totalOutputTokens = totalOutputTokens;
  }

  get countedMessages() {
    const countedMessages = [];
    let hasExpectedAttachmentAlreadyBeenAdded = false;
    for (const message of this.messages) {
      if (!message.isFromUser) continue;

      const isFirstValidAttachment =
        message.isAttachment &&
        this.isAttachmentValid(message.attachmentName) &&
        !hasExpectedAttachmentAlreadyBeenAdded;
      if (isFirstValidAttachment) {
        hasExpectedAttachmentAlreadyBeenAdded = true;
        if (message.shouldBeCountedAsAPrompt) {
          countedMessages.push(message);
        }
        continue;
      }

      if (!message.shouldBeCountedAsAPrompt) continue;
      if (message.isAttachment && hasExpectedAttachmentAlreadyBeenAdded) continue;
      countedMessages.push(message);
    }
    return countedMessages;
  }

  get currentPromptsCount() {
    return this.countedMessages.length;
  }

  get messagesToForwardToLLM() {
    return this.messages.filter((message) => message.shouldBeForwardedToLLM).map((message) => message.toLLMHistory());
  }

  get isPreview() {
    return !this.userId;
  }

  get hasVictoryConditions() {
    return this.configuration.hasVictoryConditions;
  }

  /**
   * @param {string=} message
   * @param {boolean=} shouldBeCountedAsAPrompt
   * @param {boolean=} shouldBeForwardedToLLM
   * @param {boolean=} haveVictoryConditionsBeenFulfilled
   * @param {boolean} wasModerated
   */
  addUserMessage(
    message,
    shouldBeCountedAsAPrompt,
    shouldBeForwardedToLLM,
    haveVictoryConditionsBeenFulfilled,
    wasModerated,
  ) {
    if (!message) return;
    this.messages.push(
      new Message({
        index: this.messages.length,
        content: message,
        isFromUser: true,
        shouldBeCountedAsAPrompt,
        shouldBeForwardedToLLM,
        shouldBeRenderedInPreview: true,
        haveVictoryConditionsBeenFulfilled,
        wasModerated,
      }),
    );
  }

  /**
   * @param {string} message
   * @param {boolean} shouldBeForwardedToLLM
   * @param {boolean} hasErrorOccurred
   */
  addLLMMessage(message, shouldBeForwardedToLLM, hasErrorOccurred) {
    if (!message) return;
    this.messages.push(
      new Message({
        index: this.messages.length,
        content: message,
        isFromUser: false,
        shouldBeForwardedToLLM,
        shouldBeRenderedInPreview: true,
        shouldBeCountedAsAPrompt: false,
        hasErrorOccurred,
      }),
    );
  }

  /**
   * @param {string} attachmentName
   * @param {string} message
   *
   * @returns {boolean}
   */
  addAttachmentContextMessages(attachmentName, message) {
    const attachmentContext = this.configuration.attachmentContext;
    const isAttachmentValid = this.isAttachmentValid(attachmentName);
    this.messages.push(
      new Message({
        index: this.messages.length,
        attachmentName,
        isFromUser: true,
        hasAttachmentBeenSubmittedAlongWithAPrompt: !!message,
        shouldBeForwardedToLLM: isAttachmentValid && !this.hasAttachmentContextBeenAdded,
        shouldBeRenderedInPreview: true,
        shouldBeCountedAsAPrompt: !message,
      }),
    );
    if (isAttachmentValid && !this.hasAttachmentContextBeenAdded) {
      this.messages.push(
        new Message({
          index: this.messages.length,
          attachmentName,
          attachmentContext,
          isFromUser: false,
          shouldBeForwardedToLLM: true,
          shouldBeRenderedInPreview: false,
          shouldBeCountedAsAPrompt: false,
        }),
      );
      this.hasAttachmentContextBeenAdded = true;
    }

    return isAttachmentValid;
  }

  isAttachmentValid(attachmentName) {
    if (!this.configuration.hasAttachment) {
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

  updateTokenConsumption(inputTokens, outputTokens) {
    // FIXME this can be removed after some time, this guard was for the chats in cache at the time the feature was introduced
    // The decision taken was to not update token consumption at all on an already cached chat
    this.totalInputTokens = Number.isInteger(this.totalInputTokens) ? this.totalInputTokens + inputTokens : undefined;
    this.totalOutputTokens = Number.isInteger(this.totalOutputTokens)
      ? this.totalOutputTokens + outputTokens
      : undefined;
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
      hasAttachmentContextBeenAdded: this.hasAttachmentContextBeenAdded,
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
   * @param {string=} params.attachmentContext
   * @param {boolean} params.isFromUser
   * @param {boolean} params.shouldBeForwardedToLLM
   * @param {boolean} params.shouldBeRenderedInPreview
   * @param {boolean} params.shouldBeCountedAsAPrompt
   * @param {boolean=} params.hasAttachmentBeenSubmittedAlongWithAPrompt
   * @param {boolean=} params.haveVictoryConditionsBeenFulfilled
   * @param {boolean=} params.wasModerated
   * @param {boolean=} params.hasErrorOccurred
   */
  constructor({
    index,
    content,
    attachmentName,
    attachmentContext,
    isFromUser,
    shouldBeForwardedToLLM,
    shouldBeRenderedInPreview,
    shouldBeCountedAsAPrompt,
    hasAttachmentBeenSubmittedAlongWithAPrompt,
    haveVictoryConditionsBeenFulfilled,
    wasModerated,
    hasErrorOccurred,
  }) {
    assertGreaterOrEqualToZero(index, 'index shall be greater or equal to 0');
    this.index = index;
    this.content = content;
    this.isFromUser = isFromUser;
    this.attachmentName = attachmentName;
    this.attachmentContext = attachmentContext;
    this.shouldBeForwardedToLLM = !!shouldBeForwardedToLLM;
    this.shouldBeRenderedInPreview = !!shouldBeRenderedInPreview;
    this.shouldBeCountedAsAPrompt = !!shouldBeCountedAsAPrompt;
    this.hasAttachmentBeenSubmittedAlongWithAPrompt = hasAttachmentBeenSubmittedAlongWithAPrompt;
    this.haveVictoryConditionsBeenFulfilled = haveVictoryConditionsBeenFulfilled;
    this.wasModerated = wasModerated;
    this.hasErrorOccurred = hasErrorOccurred;
  }

  get isAttachment() {
    return !!this.attachmentName && this.isFromUser;
  }

  get isAttachmentContent() {
    return !!this.attachmentName && !this.isFromUser;
  }

  get #contentForLLMHistory() {
    if (this.content) return this.content;
    if (this.isAttachment) {
      return `<system_notification>L'utilisateur a téléversé une pièce jointe : <attachment_name>${this.attachmentName}</attachment_name></system_notification>`;
    }
    if (this.isAttachmentContent) {
      return `<read_attachment_tool>Lecture de la pièce jointe, ${this.attachmentName} : <attachment_content>${this.attachmentContext}</attachment_content></read_attachment_tool>`;
    }
    throw new Error('chat message should have content or attachment');
  }

  toDTO() {
    return {
      index: this.index,
      content: this.content,
      attachmentName: this.attachmentName,
      attachmentContext: this.attachmentContext,
      isFromUser: this.isFromUser,
      shouldBeForwardedToLLM: this.shouldBeForwardedToLLM,
      shouldBeRenderedInPreview: this.shouldBeRenderedInPreview,
      shouldBeCountedAsAPrompt: this.shouldBeCountedAsAPrompt,
      hasAttachmentBeenSubmittedAlongWithAPrompt: this.hasAttachmentBeenSubmittedAlongWithAPrompt,
      haveVictoryConditionsBeenFulfilled: this.haveVictoryConditionsBeenFulfilled,
      wasModerated: this.wasModerated,
      hasErrorOccurred: this.hasErrorOccurred,
    };
  }

  toLLMHistory() {
    return {
      content: this.#contentForLLMHistory,
      role: this.isFromUser ? 'user' : 'assistant',
    };
  }
}
