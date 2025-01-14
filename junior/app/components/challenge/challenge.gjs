import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { pageTitle } from 'ember-page-title';
import ENV from 'junior/config/environment';

import Bubble from '../bubble';
import DelayedElement from '../delayed-element';
import IdentifiedLearner from '../identified-learner';
import RobotDialog from '../robot-dialog';
import ChallengeContent from './challenge-content';
import ChallengeLayout from './challenge-layout';
const CHALLENGE_DISPLAY_DELAY = ENV.APP.CHALLENGE_DISPLAY_DELAY;

export default class Challenge extends Component {
  @service store;
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

  bubbleDisplayDelay(index) {
    return (index || 0) * CHALLENGE_DISPLAY_DELAY;
  }

  get disableCheckButton() {
    return this.answerValue === null || this.answerValue === '';
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

  _createActivityAnswer(challenge) {
    return this.store.createRecord('activity-answer', { challenge });
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

    this.answer = this._createActivityAnswer(this.args.challenge);
    this.answer.value = this.answerValue;
    try {
      await this.answer.save({ adapterOptions: { assessmentId: this.#assessmentId, isPreview: this.#isPreview } });
      this.answerHasBeenValidated = true;
      this.scrollToTop();
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      this.answer.rollbackAttributes();
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
    <ChallengeLayout>
      <div class="header_container">
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
        <IdentifiedLearner />
      </div>
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
        />
      </DelayedElement>
    </ChallengeLayout>
  </template>
}
