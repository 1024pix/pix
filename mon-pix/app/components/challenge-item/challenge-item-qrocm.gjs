import { PixIcon, PixNotificationAlert } from '@1024pix/nebulix-ember';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import { dump } from 'js-yaml';
import filter from 'lodash/filter';
import isEmpty from 'lodash/isEmpty';
import QrocmProposal from 'mon-pix/components/proposals/qrocm-proposal';
import proposalsAsBlocks from 'mon-pix/utils/proposals-as-blocks';

export default class ChallengeItemQrocm extends Component {
  @service intl;

  @tracked answersValue = {};

  constructor() {
    super(...arguments);
    this.answersValue = this._extractProposals();

    if (this.args.answer) {
      this.answersValue = this.args.answer._valuesAsMap;
    }
  }

  _extractProposals() {
    const proposals = proposalsAsBlocks(this.args.challenge.proposals);
    const inputFieldsNames = {};

    proposals.forEach(({ input }) => {
      if (input) {
        inputFieldsNames[input] = '';
      }
    });

    return inputFieldsNames;
  }

  _hasError() {
    const allAnswers = this.answersValue;
    return this._hasEmptyAnswerFields(allAnswers);
  }

  _hasEmptyAnswerFields(answers) {
    return filter(answers, isEmpty).length;
  }

  _getAnswerValue() {
    return dump(this.answersValue);
  }

  get errorMessage() {
    return this.intl.t('pages.challenge.skip-error-message.qrocm');
  }

  @action
  answerChanged() {
    this.args.setAnswerValue(this._getAnswerValue());
    this.args.setAnswerError(this._hasError());
  }

  @action
  onChangeSelect(value) {
    this.answersValue = value;
    this.args.setAnswerValue(this._getAnswerValue());
    this.args.setAnswerError(this._hasError());
  }

  <template>
    <div class="rounded-panel__row challenge-response {{if @answer 'challenge-response--locked'}}">
      <h2 class="sr-only">{{t "pages.challenge.parts.answer-input"}}</h2>
      <div class="challenge-proposals">
        <QrocmProposal
          @answer={{@answer}}
          @format={{@challenge.format}}
          @proposals={{@challenge.proposals}}
          @answersValue={{this.answersValue}}
          @answerChanged={{this.answerChanged}}
          @onChangeSelect={{this.onChangeSelect}}
          @isAnswerFieldDisabled={{@isAnswerFieldDisabled}}
        />
      </div>

      {{#if @answer}}
        <div class="challenge-response__locked-overlay">
          <PixIcon @name="lock" @plainIcon={{true}} @ariaHidden={{true}} class="challenge-response-locked__icon" />
        </div>
      {{/if}}

      {{yield to="timeGauge"}}
    </div>
    {{#if @displayErrorMessage}}
      <PixNotificationAlert role="alert" class="challenge-response__alert" @type="error" @withIcon={{true}}>
        {{this.errorMessage}}
      </PixNotificationAlert>
    {{/if}}
  </template>
}
