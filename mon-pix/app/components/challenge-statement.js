import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import config from 'mon-pix/config/environment';
import Component from '@glimmer/component';
import sortBy from 'lodash/sortBy';
import ENV from 'mon-pix/config/environment';

const PREFERRED_ATTACHMENT_FORMATS = ['docx', 'xlsx', 'pptx'];

export default class ChallengeStatement extends Component {
  @service mailGenerator;
  @service intl;

  @tracked selectedAttachmentUrl;
  @tracked displayAlternativeInstruction = false;

  @tracked displayTagHelp = false;

  constructor() {
    super(...arguments);
    this._initialiseDefaultAttachment();
  }

  get isFocusedChallengeToggleEnabled() {
    return ENV.APP.FT_FOCUS_CHALLENGE_ENABLED;
  }

  get challengeInstruction() {
    const instruction = this.args.challenge.instruction;
    if (!instruction) {
      return null;
    }

    const formattedEmailInstruction = this._formatEmail(instruction);
    const formattedInstruction = this._formatLink(formattedEmailInstruction);
    return formattedInstruction;
  }

  get linkTitle() {
    return this.intl.t('pages.challenge.statement.external-link-title');
  }

  get challengeEmbedDocument() {
    if (this.args.challenge && this.args.challenge.hasValidEmbedDocument) {
      return {
        url: this.args.challenge.embedUrl,
        title: this.args.challenge.embedTitle,
        height: this.args.challenge.embedHeight,
      };
    }
    return undefined;
  }

  get id() {
    return 'challenge_statement_' + this.args.challenge.id;
  }

  get isFocusedChallenge() {
    return this.args.challenge.focused;
  }

  @action
  hideTagHelp() {
    this.displayTagHelp = false;
  }

  @action
  showTagHelp() {
    this.displayTagHelp = true;
  }

  @action
  toggleAlternativeInstruction() {
    this.displayAlternativeInstruction = !this.displayAlternativeInstruction;
  }

  @action
  chooseAttachmentUrl(attachementUrl) {
    this.selectedAttachmentUrl = attachementUrl;
  }

  get orderedAttachments() {
    if (!this.args.challenge.attachments || !Array.isArray(this.args.challenge.attachments)) {
      return [];
    }

    return sortBy(this.args.challenge.attachments,
      (attachmentUrl) => {
        const extension = attachmentUrl.split('.').pop();
        const newFirstChar = PREFERRED_ATTACHMENT_FORMATS.indexOf(extension) >= 0 ? 'A' : 'Z';
        return newFirstChar + extension;
      });
  }

  _initialiseDefaultAttachment() {
    this.selectedAttachmentUrl = this.orderedAttachments[0];
  }

  _formattedEmailForInstruction() {
    return this.mailGenerator
      .generateEmail(this.args.challenge.id, this.args.assessment.id, window.location.hostname, config.environment);
  }

  _formatEmail(instruction) {
    return instruction.replace('${EMAIL}', this._formattedEmailForInstruction());
  }

  _formatLink(instruction) {
    const externalLinkRegex = /(\[(.*?)\]\((.*?)\))+/g;
    return instruction.replace(externalLinkRegex, this._insertLinkTitle.bind(this));
  }

  _insertLinkTitle(markdownLink) {
    const markdownLinkWithoutLastChar = markdownLink.substring(0, markdownLink.length - 1);
    return markdownLinkWithoutLastChar + ' "' + this.linkTitle + '")';
  }
}
