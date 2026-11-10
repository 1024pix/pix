import { PixIcon, PixNotificationAlert } from '@1024pix/nebulix-ember';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import QcmProposals from 'mon-pix/components/proposals/qcm-proposals';

export default class ChallengeItemQcm extends Component {
  @service intl;

  checkedValues = new Set();

  _hasError() {
    return this.checkedValues.size < 2;
  }

  _getAnswerValue() {
    return Array.from(this.checkedValues).join(',');
  }

  get errorMessage() {
    return this.intl.t('pages.challenge.skip-error-message.qcm');
  }

  @action
  answerChanged(checkboxName) {
    if (this.checkedValues.has(checkboxName)) {
      this.checkedValues.delete(checkboxName);
    } else {
      this.checkedValues.add(checkboxName);
    }

    this.args.setAnswerValue(this._getAnswerValue());
    this.args.setAnswerError(this._hasError());
  }
  <template>
    <fieldset class="rounded-panel__row challenge-response {{if @answer 'challenge-response--locked'}}">
      <h2 class="sr-only">{{t "pages.challenge.parts.answer-input"}}</h2>
      <legend class="challenge-response__instructions">{{t "pages.challenge.parts.answer-instructions.qcm"}}</legend>
      <div class="challenge-proposals">
        <QcmProposals
          @answer={{@answer}}
          @answerValue={{@answer.value}}
          @proposals={{@challenge.proposals}}
          @answerChanged={{this.answerChanged}}
          @shuffleSeed={{@assessment.id}}
          @isAnswerFieldDisabled={{@isAnswerFieldDisabled}}
          @shuffled={{@challenge.shuffled}}
        />
      </div>

      {{#if @answer}}
        <div class="challenge-response__locked-overlay">
          <PixIcon @name="lock" @plainIcon={{true}} @ariaHidden={{true}} class="challenge-response-locked__icon" />
        </div>
      {{/if}}

      {{yield to="timeGauge"}}
    </fieldset>

    {{#if @displayErrorMessage}}
      <PixNotificationAlert role="alert" class="challenge-response__alert" @type="error" @withIcon={{true}}>
        {{this.errorMessage}}
      </PixNotificationAlert>
    {{/if}}
  </template>
}
