import { classNames } from '@ember-decorators/component';
import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import config from 'mon-pix/config/environment';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';

@classic
@classNames('challenge-statement')
export default class ChallengeStatement extends Component {
  @service mailGenerator;

  challenge = null;
  assessment = null;

  didReceiveAttrs() {
    this.set('selectedAttachmentUrl', this.get('challenge.attachments.firstObject'));
  }

  @computed('challenge.instruction')
  get challengeInstruction() {
    const instruction = this.get('challenge.instruction');
    if (!instruction) {
      return null;
    }
    return instruction.replace('${EMAIL}', this._formattedEmailForInstruction());
  }

  @computed('challenge.hasValidEmbedDocument')
  get challengeEmbedDocument() {
    if (this.get('challenge.hasValidEmbedDocument')) {
      return {
        url: this.get('challenge.embedUrl'),
        title: this.get('challenge.embedTitle'),
        height: this.get('challenge.embedHeight')
      };
    }
    return undefined;
  }

  init() {
    super.init(...arguments);
    this.id = 'challenge_statement_' + this.get('challenge.id');
  }

  @computed('challenge.attachments')
  get attachmentsData() {
    return this.get('challenge.attachments');
  }

  @action
  selectAttachementUrl(attachementUrl) {
    this.set('selectedAttachmentUrl', attachementUrl);
  }

  _formattedEmailForInstruction() {
    return this.mailGenerator
      .generateEmail(this.get('challenge.id'), this.get('assessment.id'), window.location.hostname, config.environment);
  }
}
