import { PixBlock, PixNotificationAlert } from '@1024pix/nebulix-ember';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import isInteger from 'lodash/isInteger';
import AssessmentsLiveAlert from 'mon-pix/components/assessments/live-alert';
import ChallengeActions from 'mon-pix/components/challenge/challenge-actions';
import ChallengeWrapper from 'mon-pix/components/challenge/challenge-wrapper';
import CertificationFeedbackPanel from 'mon-pix/components/challenge/feedback/certification-feedback-panel';
import FeedbackPanel from 'mon-pix/components/challenge/feedback/feedback-panel';
import FocusedOutNotification from 'mon-pix/components/challenge/focusedOutNotification';
import ChallengeItem from 'mon-pix/components/challenge/item';
import ModeBanner from 'mon-pix/components/challenge/mode-banner';
import ChallengeStatement from 'mon-pix/components/challenge-statement';
import { getAutoReplyMessage } from 'mon-pix/utils/embed-auto-reply-message';

export default class ChallengeContent extends Component {
  @tracked isLiveAlertButtonEnabled = true;
  @tracked isValidateActionLoading = false;
  @tracked isSkipActionLoading = false;
  @tracked hasChallengeTimedOut = this.args.assessment.hasTimeoutChallenge || false;
  @tracked answerValue = '';
  @tracked hasError = true;
  @tracked displayErrorMessage = false;
  @tracked autoReplyErrorMessage = '';

  @service router;
  @service store;
  @service currentUser;
  @service intl;

  constructor() {
    super(...arguments);
    if (this.args.challenge.autoReply) {
      window.addEventListener('message', this._receiveAutoReplyMessage);
    }
  }

  willDestroy() {
    super.willDestroy(...arguments);
    window.removeEventListener('message', this._receiveAutoReplyMessage);
  }

  _receiveAutoReplyMessage = (event) => {
    const message = getAutoReplyMessage(event);
    if (message == null) return;

    if (message.validity != null) this.autoReplyErrorMessage = message.validity;

    if (message.answer == null) return;
    this.answerValue = String(message.answer);
    this.hasError = this.answerValue.length < 1;
  };

  get autoReplyDisplayedErrorMessage() {
    return this.autoReplyErrorMessage || this.intl.t('pages.challenge.skip-error-message.qroc-auto-reply');
  }

  get hasAnswer() {
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
  }

  @action
  setAnswerError(value) {
    this.hasError = value;
  }

  @action
  hideErrorMessage() {
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
        <ModeBanner @isFocusedChallenge={{@challenge.focused}} />
        <PixBlock @condensed={{true}} class="challenge-item">
          <ChallengeStatement
            @challenge={{@challenge}}
            @assessment={{@assessment}}
            @isTextToSpeechActivated={{@isTextToSpeechActivated}}
          />

          {{#unless @challenge.autoReply}}
            <ChallengeWrapper @hasAnswer={{this.hasAnswer}} @isCertification={{@assessment.isCertification}}>
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
                @hideErrorMessage={{this.hideErrorMessage}}
                @displayErrorMessage={{this.displayErrorMessage}}
                @displayTimer={{this.displayTimer}}
                @setChallengeAsTimedOut={{this.setChallengeAsTimedOut}}
                @isAnswerFieldDisabled={{this.hasAnswer}}
              />
            </ChallengeWrapper>
          {{else if this.displayErrorMessage}}
            <PixNotificationAlert role="alert" class="challenge-response__alert" @type="error" @withIcon={{true}}>
              {{this.autoReplyDisplayedErrorMessage}}
            </PixNotificationAlert>
          {{/unless}}
        </PixBlock>

        {{#if @assessment}}
          <FocusedOutNotification
            @hasFocusedOutOfWindow={{@hasFocusedOutOfWindow}}
            @isCertification={{@assessment.isCertification}}
            @certificationVersion={{@assessment.certificationCourse.version}}
            @isAdjustedCourseForAccessibility={{@assessment.certificationCourse.isAdjustedForAccessibility}}
          />

          <ChallengeActions
            @challenge={{@challenge}}
            @isValidateActionLoading={{this.isValidateActionLoading}}
            @isSkipActionLoading={{this.isSkipActionLoading}}
            @answer={{@answer}}
            @resumeAssessment={{this.resumeAssessment}}
            @skipChallenge={{this.skipChallenge}}
            @hasChallengeTimedOut={{this.hasChallengeTimedOut}}
            @isDisabled={{this.hasAnswer}}
            @hasFocusedOutOfWindow={{@hasFocusedOutOfWindow}}
            @hasOngoingChallengeLiveAlert={{@assessment.hasOngoingChallengeLiveAlert}}
            @hasOngoingCompanionLiveAlert={{@assessment.hasOngoingCompanionLiveAlert}}
          />
        {{/if}}

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
