import { action } from '@ember/object';
import { service } from '@ember/service';
import { ensureSafeComponent } from '@embroider/util';
import Component from '@glimmer/component';
import ChallengeStatement from 'mon-pix/components/challenge-statement';
import ENV from 'mon-pix/config/environment';

import ChallengeItemQcm from '../challenge-item/challenge-item-qcm';
import ChallengeItemQcu from '../challenge-item/challenge-item-qcu';
import ChallengeItemQroc from '../challenge-item/challenge-item-qroc';
import ChallengeItemQrocm from '../challenge-item/challenge-item-qrocm';

const FOCUSEDOUT_EVENT_NAME = 'focusedout';
const FOCUSEDOUT_INTERVAL = 1000;

export default class Item extends Component {
  <template>
    <article
      class="rounded-panel rounded-panel--no-margin-bottom challenge-item"
      data-challenge-id="{{@challenge.id}}"
      role="article"
    >
      <ChallengeStatement
        @challenge={{@challenge}}
        @assessment={{@assessment}}
        @isTextToSpeechActivated={{@isTextToSpeechActivated}}
      />

      <this.challengeComponent
        @challenge={{@challenge}}
        @answer={{@answer}}
        @assessment={{@assessment}}
        @timeoutChallenge={{@timeoutChallenge}}
        @resetAllChallengeInfo={{@resetAllChallengeInfo}}
        @resetChallengeInfoOnResume={{@resetChallengeInfoOnResume}}
        @hasFocusedOutOfWindow={{@hasFocusedOutOfWindow}}
        @answerValidated={{this.answerValidated}}
        @resumeAssessment={{this.resumeAssessment}}
        @isFocusedChallenge={{this.isFocusedChallenge}}
      />
    </article>
  </template>
  @service currentUser;
  @service router;
  @service store;

  constructor() {
    super(...arguments);
    if (this.isFocusedChallenge && !this.args.answer) {
      this._setFocusOutEventListener();
    }
  }

  get challengeComponent() {
    let result;
    const challenge = this.args.challenge;
    const challengeType = challenge.get('type').toUpperCase();

    if (['QCUIMG', 'QCU'].includes(challengeType)) {
      result = ChallengeItemQcu;
    } else if (['QCMIMG', 'QCM'].includes(challengeType)) {
      result = ChallengeItemQcm;
    } else if (['QROC'].includes(challengeType)) {
      result = ChallengeItemQroc;
    } else if (['QROCM', 'QROCM-IND', 'QROCM-DEP'].includes(challengeType)) {
      result = ChallengeItemQrocm;
    }

    return ensureSafeComponent(result, this);
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

  @action
  async answerValidated(challenge, assessment, answerValue, answerTimeout, answerFocusedOut) {
    if (assessment.hasOngoingChallengeLiveAlert) {
      return;
    }

    this.args.onChallengeSubmit();

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

  @action
  resumeAssessment(assessment) {
    this.router.transitionTo('assessments.resume', assessment.get('id'));
  }

  willDestroy() {
    super.willDestroy(...arguments);
    this.clearFocusOutEventListener();
  }
}
