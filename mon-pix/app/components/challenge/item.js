import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import ENV from 'mon-pix/config/environment';

const FOCUSEDOUT_EVENT_NAME = 'focusedout';
const FOCUSEDOUT_INTERVAL = 1000;

export default class Item extends Component {
  @service currentUser;
  @service router;
  @service store;

  constructor() {
    super(...arguments);
    if (this.isFocusedChallenge && !this.args.answer) {
      this._setFocusOutEventListener();
    }
  }

  @action
  hideOutOfFocusBorder() {
    if (this.isFocusedChallenge) {
      this.args.onFocusIntoChallenge();
    }
  }

  @action
  showOutOfFocusBorder(event) {
    if (this.isFocusedChallenge && !this.args.answer) {
      // linked to a Firefox issue where the mouseleave is triggered
      // when hovering the select options on mouse navigation
      // see: https://stackoverflow.com/questions/46831247/select-triggers-mouseleave-event-on-parent-element-in-mozilla-firefox
      if (this.shouldPreventFirefoxSelectMouseLeaveBehavior(event)) {
        return;
      }
      this.args.onFocusOutOfChallenge();
    }
  }

  shouldPreventFirefoxSelectMouseLeaveBehavior(event) {
    return event.relatedTarget === null;
  }

  _setFocusOutEventListener() {
    document.addEventListener(FOCUSEDOUT_EVENT_NAME, this._focusedoutListener);

    this._hadFocus = document.hasFocus();
    this._pollHasFocusInterval = setInterval(this._pollHasFocus, FOCUSEDOUT_INTERVAL);
  }

  _pollHasFocus = () => {
    const hasFocus = document.hasFocus();
    if (!hasFocus && this._hadFocus) {
      const hasFocusOutEvent = new CustomEvent(FOCUSEDOUT_EVENT_NAME);
      document.dispatchEvent(hasFocusOutEvent);
    }
    this._hadFocus = hasFocus;
  };

  _focusedoutListener = () => {
    this.args.onFocusOutOfWindow();
    this.clearFocusOutEventListener();
  };

  clearFocusOutEventListener = () => {
    clearInterval(this._pollHasFocusInterval);
    document.removeEventListener(FOCUSEDOUT_EVENT_NAME, this._focusedoutListener);
  };

  get isFocusedChallenge() {
    return ENV.APP.FT_FOCUS_CHALLENGE_ENABLED && this.args.challenge.focused;
  }

  _findOrCreateAnswer(challenge, assessment) {
    let answer = assessment.get('answers').findBy('challenge.id', challenge.id);
    if (!answer) {
      answer = this.store.createRecord('answer', { assessment, challenge });
    }
    return answer;
  }

  _isAssessmentEndedBySupervisorOrByFinalization(error) {
    return (
      error?.errors?.[0]?.detail === 'Le surveillant a mis fin à votre test de certification.' ||
      error?.errors?.[0]?.detail === 'La session a été finalisée par votre centre de certification.'
    );
  }

  @action
  async answerValidated(challenge, assessment, answerValue, answerTimeout, answerFocusedOut) {
    const answer = this._findOrCreateAnswer(challenge, assessment);
    answer.setProperties({
      value: answerValue.trim(),
      timeout: answerTimeout,
      focusedOut: answerFocusedOut,
    });

    try {
      await answer.save();

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

      if (this._isAssessmentEndedBySupervisorOrByFinalization(error)) {
        this.router.transitionTo('authenticated.certifications.results', assessment.certificationCourse.get('id'));
        return;
      }

      this.router.transitionTo('error', error);
    }
  }

  @action
  resumeAssessment(assessment) {
    this.router.transitionTo('assessments.resume', assessment.get('id'));
  }
}
