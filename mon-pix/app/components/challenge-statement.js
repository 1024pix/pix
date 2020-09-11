import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import config from 'mon-pix/config/environment';
import Component from '@glimmer/component';
import get from 'lodash/get';

export default class ChallengeStatement extends Component {
  @service mailGenerator;

  @tracked selectedAttachmentUrl;
  @tracked displayAlternativeInstruction = false;

  constructor() {
    super(...arguments);
    this._initialiseDefaultAttachment();
  }

  get challengeInstruction() {
    const instruction = this.args.challenge.instruction;
    if (!instruction) {
      return null;
    }
    return instruction.replace('${EMAIL}', this._formattedEmailForInstruction());
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

  @action
  toggleAlternativeInstruction() {
    this.displayAlternativeInstruction = !this.displayAlternativeInstruction;
  }

  @action
  chooseAttachmentUrl(attachementUrl) {
    this.selectedAttachmentUrl = attachementUrl;
  }

  _initialiseDefaultAttachment() {
    this.selectedAttachmentUrl = get(this.args.challenge, 'attachments.firstObject');
  }

  _formattedEmailForInstruction() {
    return this.mailGenerator
      .generateEmail(this.args.challenge.id, this.args.assessment.id, window.location.hostname, config.environment);
  }
}
