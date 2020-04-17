import { classNames } from '@ember-decorators/component';
import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import config from 'mon-pix/config/environment';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';
import _ from 'lodash';

@classic
@classNames('challenge-statement')
export default class ChallengeStatement extends Component {
  @service mailGenerator;

  challenge = null;
  assessment = null;
  selectedAttachmentUrl = null;

  didReceiveAttrs() {
    this.selectedAttachmentUrl =  _.get(this.challenge, 'attachments.firstObject');
  }

  @computed('challenge.instruction')
  get challengeInstruction() {
    const instruction = this.challenge.instruction;
    if (!instruction) {
      return null;
    }
    return instruction.replace('${EMAIL}', this._formattedEmailForInstruction());
  }

  @computed('challenge.hasValidEmbedDocument')
  get challengeEmbedDocument() {
    if (this.challenge.hasValidEmbedDocument) {
      return {
        url: this.challenge.embedUrl,
        title: this.challenge.embedTitle,
        height: this.challenge.embedHeight
      };
    }
    return undefined;
  }

  @computed('challenge.id')
  get id() {
    return 'challenge_statement_' + this.challenge.id;

  }

  @computed('challenge.attachments')
  get attachmentsData() {
    return this.challenge.attachments;
  }

  @action
  selectAttachementUrl(attachementUrl) {
    this.set('selectedAttachmentUrl', attachementUrl);
  }

  _formattedEmailForInstruction() {
    return this.mailGenerator
      .generateEmail(this.challenge.id, this.assessment.id, window.location.hostname, config.environment);
  }
}
