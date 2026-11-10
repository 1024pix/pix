import { PixBlock } from '@1024pix/nebulix-ember';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import AssessmentsLiveAlert from '../assessments/live-alert';
import CertificationFeedbackPanel from '../certification-feedback-panel';
import ChallengeStatement from '../challenge-statement';
import FeedbackPanel from '../feedback-panel';
import ChallengeItem from './item';

export default class ChallengeContent extends Component {
  @tracked isLiveAlertButtonEnabled = true;

  @service router;
  @service store;
  @service currentUser;

  @action
  handleChallengeSubmit() {
    this.isLiveAlertButtonEnabled = false;
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

  @action
  resumeAssessment(assessment) {
    this.router.transitionTo('assessments.resume', assessment.get('id'));
  }

  <template>
    <div
      class="focus-zone-warning
        {{if @isFocusedChallengeAndUserHasFocusedOutOfChallenge 'focus-zone-warning--triggered'}}"
      data-challenge-id="{{@challenge.id}}"
      {{on "mouseenter" @hideOutOfFocusBorder}}
      {{on "mouseleave" @showOutOfFocusBorder}}
    >
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
          @answerValidated={{this.answerValidated}}
          @resumeAssessment={{this.resumeAssessment}}
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

      {{#if @assessment.hasOngoingCompanionLiveAlert}}
        <AssessmentsLiveAlert @message={{t "pages.challenge.live-alerts.companion.message"}} />
      {{/if}}
    </div>

    {{#if @isFocusedChallengeAndUserHasFocusedOutOfChallenge}}
      <div class="focus-zone-warning__overlay" />
    {{/if}}
  </template>
}
