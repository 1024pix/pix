import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import { dump } from 'js-yaml';
import filter from 'lodash/filter';
import isEmpty from 'lodash/isEmpty';
import ChallengeActions from 'mon-pix/components/challenge-actions';
import QrocmProposal from 'mon-pix/components/proposals/qrocm-proposal';
import TimeoutGauge from 'mon-pix/components/timeout-gauge';
import proposalsAsBlocks from 'mon-pix/utils/proposals-as-blocks';

import ChallengeItemGeneric from './challenge-item-generic';

export default class ChallengeItemQrocm extends ChallengeItemGeneric {
  <template>
    <form {{on "submit" this.validateAnswer}}>

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
            @isAnswerFieldDisabled={{this.isAnswerFieldDisabled}}
          />
        </div>

        {{#if @answer}}
          <div class="challenge-response__locked-overlay">
            <PixIcon @name="lock" @plainIcon={{true}} @ariaHidden={{true}} class="challenge-response-locked__icon" />
          </div>
        {{/if}}

        {{#if this.displayTimer}}
          <div class="timeout-gauge-wrapper">
            <TimeoutGauge
              @allottedTime={{@challenge.timer}}
              @hasTimeoutChallenge={{@assessment.hasTimeoutChallenge}}
              @setChallengeAsTimedOut={{this.setChallengeAsTimedOut}}
            />
          </div>
        {{/if}}
      </div>

      {{#if this.errorMessage}}
        <PixNotificationAlert role="alert" class="challenge-response__alert" @type="error" @withIcon={{true}}>
          {{this.errorMessage}}
        </PixNotificationAlert>
      {{/if}}

      {{#if @assessment}}
        <ChallengeActions
          @challenge={{@challenge}}
          @answer={{@answer}}
          @isValidateActionLoading={{this.isValidateActionLoading}}
          @isSkipActionLoading={{this.isSkipActionLoading}}
          @isCertification={{@assessment.isCertification}}
          @resumeAssessment={{this.resumeAssessment}}
          @validateAnswer={{this.validateAnswer}}
          @skipChallenge={{this.skipChallenge}}
          @hasChallengeTimedOut={{this.hasChallengeTimedOut}}
          @hasFocusedOutOfWindow={{@hasFocusedOutOfWindow}}
          @isDisabled={{this.isAnswerFieldDisabled}}
          @hasOngoingChallengeLiveAlert={{@assessment.hasOngoingChallengeLiveAlert}}
          @certificationVersion={{@assessment.certificationCourse.version}}
          @isAdjustedCourseForAccessibility={{@assessment.certificationCourse.isAdjustedForAccessibility}}
        />
      {{/if}}
    </form>
  </template>
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

  _getErrorMessage() {
    return this.intl.t('pages.challenge.skip-error-message.qrocm');
  }

  @action
  answerChanged() {
    this.errorMessage = null;
  }

  @action
  onChangeSelect(value) {
    this.answersValue = value;
  }
}
