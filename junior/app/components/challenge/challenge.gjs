import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { pageTitle } from 'ember-page-title';
import ENV from 'junior/config/environment';

import Bubble from '../bubble';
import DelayedElement from '../delayed-element';
import Header from '../header';
import RobotDialog from '../robot-dialog';
import ChallengeContent from './challenge-content';
import ChallengeLayout from './challenge-layout';
const CHALLENGE_DISPLAY_DELAY = ENV.APP.CHALLENGE_DISPLAY_DELAY;

export default class Challenge extends Component {
  @service store;
  @service storeRequest;
  @service router;
  @service intl;
  @tracked answerHasBeenValidated = false;
  @tracked answer = null;
  @tracked answerValue = null;
  @tracked displayValidationWarning = false;
  validationWarning = null;

  get challengeItemDisplayDelay() {
    return this.args.challenge.instructions.length * CHALLENGE_DISPLAY_DELAY;
  }

  get layoutColor() {
    if (this.answer?.result === 'ok') {
      return 'success';
    }
    if (this.answer?.result === 'ko') {
      return 'error';
    }
    return 'default';
  }

  get answerButtonColor() {
    if (this.answer?.result === 'ok') {
      return 'success';
    }
    return '';
  }

  bubbleDisplayDelay(index) {
    return (index || 0) * CHALLENGE_DISPLAY_DELAY;
  }

  get disableCheckButton() {
    const autoReplyAndAnswerNotValidated =
      this.args.challenge.hasEmbedInternalValidation && !this.answerHasBeenValidated;

    return autoReplyAndAnswerNotValidated || this.answerValue === null || this.answerValue === '';
  }

  get disableLessonButton() {
    return this.args.challenge.hasEmbed ? this.answerValue === null || this.answerValue === '' : false;
  }

  get robotMood() {
    if (this.answer?.result === 'ok') {
      return 'happy';
    }
    if (this.answer?.result === 'ko') {
      return 'sad';
    }
    if (this.displayValidationWarning) {
      return 'retry';
    }
    return 'default';
  }

  get robotFeedback() {
    const feedback = {};

    if (this.answer?.result === 'ok') {
      feedback.message = this.intl.t('pages.challenge.messages.correct-answer');
      feedback.status = 'success';
    } else if (this.answer?.result === 'ko') {
      feedback.message = this.intl.t('pages.challenge.messages.wrong-answer');
      feedback.status = 'error';
    } else if (this.displayValidationWarning) {
      feedback.message = this.validationWarning;
      feedback.status = 'warning';
    }
    return feedback;
  }

  @action
  setAnswerValue(value) {
    this.answerValue = value ?? null;
  }

  @action
  setValidationWarning(errorValue) {
    this.validationWarning = errorValue;
  }

  get #assessmentId() {
    return this.args.assessment?.id;
  }

  get #isPreview() {
    return !this.#assessmentId;
  }

  get hasBeenAnswered() {
    return this.answer !== null;
  }

  @action
  async validateAnswer() {
    if (this.validationWarning) {
      this.displayValidationWarning = true;
      return;
    } else {
      this.displayValidationWarning = false;
    }

    const data = { challenge: this.args.challenge, value: this.answerValue };
    const meta = {};
    if (this.#assessmentId) meta.assessmentId = this.#assessmentId;
    if (this.#isPreview) meta.isPreview = this.#isPreview;
    const bodyOptions = { meta };

    try {
      const { content } = await this.storeRequest.createRecord('activity-answer', data, { bodyOptions });
      this.answer = content.data;
      this.answerHasBeenValidated = true;
      this.scrollToTop();
    } catch (error) {
      console.log(error);
    }
  }

  scrollToTop() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }

  @action
  async skipChallenge() {
    this.setAnswerValue('#ABAND#');
    await this.validateAnswer();
    this.resume();
  }

  @action
  resume() {
    this.answerHasBeenValidated = false;
    this.answerValue = null;
    this.answer = null;
    this.router.replaceWith('assessment.resume');
  }

  <template>
    {{pageTitle (t "pages.challenge.title")}}
    <ChallengeLayout @color={{this.layoutColor}}>
      <Header>
        <RobotDialog @class={{this.robotMood}}>
          {{#each @challenge.instructions as |instruction index|}}
            <DelayedElement @shouldDisplayIn={{this.bubbleDisplayDelay index}}>
              <Bubble @message={{instruction}} @oralization={{@oralization}} />
            </DelayedElement>
          {{/each}}

          {{#if this.robotFeedback.message}}
            <Bubble
              @message={{this.robotFeedback.message}}
              @status={{this.robotFeedback.status}}
              @oralization={{@oralization}}
              aria-live="polite"
            />
          {{/if}}
        </RobotDialog>
      </Header>
      <DelayedElement @shouldDisplayIn={{this.challengeItemDisplayDelay}}>
        <ChallengeContent
          @setAnswerValue={{this.setAnswerValue}}
          @setValidationWarning={{this.setValidationWarning}}
          @validateAnswer={{this.validateAnswer}}
          @skipChallenge={{this.skipChallenge}}
          @challenge={{@challenge}}
          @assessment={{@assessment}}
          @disableCheckButton={{this.disableCheckButton}}
          @disableLessonButton={{this.disableLessonButton}}
          @answerHasBeenValidated={{this.answerHasBeenValidated}}
          @activity={{@activity}}
          @resume={{this.resume}}
          @isDisabled={{this.hasBeenAnswered}}
          @responseColor="{{this.answerButtonColor}}"
        />
      </DelayedElement>
    </ChallengeLayout>
  </template>
}
