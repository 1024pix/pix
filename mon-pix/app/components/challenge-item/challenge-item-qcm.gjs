import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import t from 'ember-intl/helpers/t';
import ChallengeActions from 'mon-pix/components/challenge-actions';
import QcmProposals from 'mon-pix/components/proposals/qcm-proposals';
import TimeoutGauge from 'mon-pix/components/timeout-gauge';

import ChallengeItemGeneric from './challenge-item-generic';

export default class ChallengeItemQcm extends ChallengeItemGeneric {
  <template>
    <form {{on "submit" this.validateAnswer}}>

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
            @isAnswerFieldDisabled={{this.isAnswerFieldDisabled}}
            @shuffled={{@challenge.shuffled}}
          />
        </div>

        {{#if @answer}}
          <div class="challenge-response__locked-overlay">
            <PixIcon @name="lock" @plainIcon={{true}} @ariaHidden={{true}} class="challenge-response-locked__icon" />
          </div>
        {{/if}}

        {{#if this.displayTimer}}
          <TimeoutGauge
            @allottedTime={{@challenge.timer}}
            @hasTimeoutChallenge={{@assessment.hasTimeoutChallenge}}
            @setChallengeAsTimedOut={{this.setChallengeAsTimedOut}}
          />
        {{/if}}
      </fieldset>

      {{#if this.errorMessage}}
        <PixNotificationAlert role="alert" class="challenge-response__alert" @type="error" @withIcon={{true}}>
          {{this.errorMessage}}
        </PixNotificationAlert>
      {{/if}}

      {{#if @assessment}}
        <ChallengeActions
          @challenge={{@challenge}}
          @isValidateActionLoading={{this.isValidateActionLoading}}
          @isSkipActionLoading={{this.isSkipActionLoading}}
          @answer={{@answer}}
          @isCertification={{@assessment.isCertification}}
          @resumeAssessment={{this.resumeAssessment}}
          @validateAnswer={{this.validateAnswer}}
          @skipChallenge={{this.skipChallenge}}
          @hasChallengeTimedOut={{this.hasChallengeTimedOut}}
          @hasFocusedOutOfWindow={{@hasFocusedOutOfWindow}}
          @isDisabled={{this.isAnswerFieldDisabled}}
          @hasOngoingChallengeLiveAlert={{@assessment.hasOngoingChallengeLiveAlert}}
          @hasOngoingCompanionLiveAlert={{@assessment.hasOngoingCompanionLiveAlert}}
          @certificationVersion={{@assessment.certificationCourse.version}}
          @isAdjustedCourseForAccessibility={{@assessment.certificationCourse.isAdjustedForAccessibility}}
        />
      {{/if}}
    </form>
  </template>
  @service intl;
  checkedValues = new Set();

  _hasError() {
    return this.checkedValues.size < 2;
  }

  _getAnswerValue() {
    return Array.from(this.checkedValues).join(',');
  }

  _getErrorMessage() {
    return this.intl.t('pages.challenge.skip-error-message.qcm');
  }

  @action
  answerChanged(checkboxName) {
    if (this.checkedValues.has(checkboxName)) {
      this.checkedValues.delete(checkboxName);
    } else {
      this.checkedValues.add(checkboxName);
    }
    this.errorMessage = null;
  }
}
