import { PixBlock } from '@1024pix/nebulix-ember';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import isInteger from 'lodash/isInteger';

import AssessmentsLiveAlert from '../assessments/live-alert';
import CertificationFeedbackPanel from '../certification-feedback-panel';
import ChallengeActions from '../challenge-actions';
import ChallengeStatement from '../challenge-statement';
import FeedbackPanel from '../feedback-panel';
import FocusedOutNotification from './focusedOutNotification';
import ChallengeItem from './item';

export default class ChallengeContent extends Component {
  @tracked isLiveAlertButtonEnabled = true;
  @tracked isValidateActionLoading = false;
  @tracked isSkipActionLoading = false;
  @tracked hasChallengeTimedOut = this.args.assessment.hasTimeoutChallenge || false;
  @tracked answerValue = '';
  @tracked hasError = true;
  @tracked displayErrorMessage = false;

  @service router;
  @service store;
  @service currentUser;

  get isAnswerFieldDisabled() {
    return !!this.args.answer;
  }

  get displayTimer() {
    return this.isTimedChallengeWithoutAnswer;
  }

  get _isTimedChallenge() {
    return isInteger(this.args.challenge.timer);
  }

  get isTimedChallengeWithoutAnswer() {
    return this._isTimedChallenge && !this.args.answer;
  }

  _getTimeout() {
    if (this._isTimedChallenge) {
      if (this.hasChallengeTimedOut) {
        return -1;
      } else {
        return this.args.challenge.timer;
      }
    } else {
      return null;
    }
  }

  @action
  setChallengeAsTimedOut() {
    this.hasChallengeTimedOut = true;
    this.args.timeoutChallenge();
  }

  @action
  handleChallengeSubmit() {
    this.isLiveAlertButtonEnabled = false;
  }

  @action
  resumeAssessment() {
    this.args.resetChallengeInfoOnResume();
    return this.router.transitionTo('assessments.resume', this.args.assessment.get('id'));
  }

  @action
  setAnswerValue(value) {
    this.answerValue = value;
    if (this.displayErrorMessage) this.displayErrorMessage = false;
  }

  @action
  setAnswerError(value) {
    this.hasError = value;
    if (this.displayErrorMessage) this.displayErrorMessage = false;
  }

  @action
  validateAnswer(event) {
    event.preventDefault();
    if (this.hasError && !this.hasChallengeTimedOut) {
      this.displayErrorMessage = true;
      return;
    }

    this.isValidateActionLoading = true;
    this.displayErrorMessage = false;

    try {
      return this.answerValidated(
        this.args.challenge,
        this.args.assessment,
        this.answerValue,
        this._getTimeout(),
        this.args.hasFocusedOutOfWindow,
      ).finally(() => {
        this.args.resetAllChallengeInfo();
      });
    } catch {
      this.isValidateActionLoading = false;
    }
  }

  @action
  skipChallenge() {
    this.isSkipActionLoading = true;
    this.displayErrorMessage = false;

    try {
      return this.answerValidated(
        this.args.challenge,
        this.args.assessment,
        '#ABAND#',
        this._getTimeout(),
        this.args.hasFocusedOutOfWindow,
      ).finally(() => {
        this.args.resetAllChallengeInfo();
      });
    } catch {
      this.isSkipActionLoading = false;
    }
  }

  @action
  async answerValidated(challenge, assessment, answerValue, answerTimeout, answerFocusedOut) {
    if (assessment.hasOngoingChallengeLiveAlert) {
      return;
    }

    this.handleChallengeSubmit();

    const answer = this.store.createRecord('answer', { assessment, challenge });
    answer.setProperties({
      value: answerValue.trim(),
      timeout: answerTimeout,
      focusedOut: answerFocusedOut,
    });

    try {
      await answer.save();
      assessment.orderedChallengeIdsAnswered.push(challenge.id);

      let queryParams = { queryParams: {} };
      const levelup = await answer.get('levelup');

      if (this.currentUser.user && !this.currentUser.user.isAnonymous && levelup) {
        queryParams = {
          queryParams: {
            newLevel: levelup.level,
            competenceLeveled: levelup.competenceName,
          },
        };
      }

      this.router.transitionTo('assessments.resume', assessment.get('id'), queryParams);
    } catch (error) {
      answer.rollbackAttributes();

      const apiError = error?.errors?.[0];
      const isCertificationEnded =
        apiError?.code === 'CERTIFICATION_DURATION_EXCEEDED' ||
        apiError?.detail === 'Le surveillant a mis fin à votre test de certification.' ||
        apiError?.detail === 'La session a été finalisée par votre centre de certification.';

      if (isCertificationEnded) {
        this.router.transitionTo('authenticated.certifications.results', assessment.certificationCourse.get('id'));
        return;
      }

      this.router.transitionTo('error', error);
    }
  }

  <template>
    <div
      class="focus-zone-warning
        {{if @isFocusedChallengeAndUserHasFocusedOutOfChallenge 'focus-zone-warning--triggered'}}"
      data-challenge-id="{{@challenge.id}}"
      {{on "mouseenter" @hideOutOfFocusBorder}}
      {{on "mouseleave" @showOutOfFocusBorder}}
    >
      <form {{on "submit" this.validateAnswer}}>
        <PixBlock class="challenge-item">
          <ChallengeStatement
            @challenge={{@challenge}}
            @assessment={{@assessment}}
            @isTextToSpeechActivated={{@isTextToSpeechActivated}}
          />

          <ChallengeItem
            @challenge={{@challenge}}
            @assessment={{@assessment}}
            @answer={{@answer}}
            @timeoutChallenge={{@timeoutChallenge}}
            @resetAllChallengeInfo={{@resetAllChallengeInfo}}
            @resetChallengeInfoOnResume={{@resetChallengeInfoOnResume}}
            @onFocusIntoChallenge={{fn @setFocusedOutOfChallenge false}}
            @onFocusOutOfChallenge={{fn @setFocusedOutOfChallenge true}}
            @onFocusOutOfWindow={{@focusedOutOfWindow}}
            @hasFocusedOutOfWindow={{@hasFocusedOutOfWindow}}
            @isFocusedChallengeAndUserHasFocusedOutOfChallenge={{@isFocusedChallengeAndUserHasFocusedOutOfChallenge}}
            @isTextToSpeechActivated={{@isTextToSpeechActivated}}
            @setAnswerValue={{this.setAnswerValue}}
            @setAnswerError={{this.setAnswerError}}
            @displayErrorMessage={{this.displayErrorMessage}}
            @displayTimer={{this.displayTimer}}
            @setChallengeAsTimedOut={{this.setChallengeAsTimedOut}}
            @isAnswerFieldDisabled={{this.isAnswerFieldDisabled}}
          />
        </PixBlock>
        {{#unless @assessment.hasOngoingCompanionLiveAlert}}
          <div role="complementary">
            {{#if @assessment.isCertification}}
              <CertificationFeedbackPanel
                @submitLiveAlert={{@submitLiveAlert}}
                @assessment={{@assessment}}
                @isEnabled={{this.isLiveAlertButtonEnabled}}
              />
            {{else}}
              <FeedbackPanel @assessment={{@assessment}} @challenge={{@challenge}} />
            {{/if}}
          </div>
        {{/unless}}

        {{#if @assessment}}
          <ChallengeActions
            @challenge={{@challenge}}
            @isValidateActionLoading={{this.isValidateActionLoading}}
            @isSkipActionLoading={{this.isSkipActionLoading}}
            @answer={{@answer}}
            @resumeAssessment={{this.resumeAssessment}}
            @validateAnswer={{this.validateAnswer}}
            @skipChallenge={{this.skipChallenge}}
            @hasChallengeTimedOut={{this.hasChallengeTimedOut}}
            @isDisabled={{this.isAnswerFieldDisabled}}
            @hasFocusedOutOfWindow={{@hasFocusedOutOfWindow}}
            @hasOngoingChallengeLiveAlert={{@assessment.hasOngoingChallengeLiveAlert}}
            @hasOngoingCompanionLiveAlert={{@assessment.hasOngoingCompanionLiveAlert}}
          />

          <FocusedOutNotification
            @hasFocusedOutOfWindow={{@hasFocusedOutOfWindow}}
            @isCertification={{@assessment.isCertification}}
            @certificationVersion={{@assessment.certificationCourse.version}}
            @isAdjustedCourseForAccessibility={{@assessment.certificationCourse.isAdjustedForAccessibility}}
          />
        {{/if}}
      </form>
      {{#if @assessment.hasOngoingCompanionLiveAlert}}
        <AssessmentsLiveAlert @message={{t "pages.challenge.live-alerts.companion.message"}} />
      {{/if}}
    </div>

    {{#if @isFocusedChallengeAndUserHasFocusedOutOfChallenge}}
      <div class="focus-zone-warning__overlay" />
    {{/if}}
  </template>
}
