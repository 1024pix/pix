import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import AssessmentsLiveAlert from '../assessments/live-alert';
import CertificationFeedbackPanel from '../certification-feedback-panel';
import FeedbackPanel from '../feedback-panel';
import ChallengeItem from './item';

export default class ChallengeContent extends Component {
  @tracked isLiveAlertButtonEnabled = true;

  constructor(...args) {
    super(...args);
    console.log('content', this.args.challenge.id, this.args.challenge.type);
  }

  @action
  handleChallengeSubmit() {
    this.isLiveAlertButtonEnabled = false;
  }

  <template>
    <div
      class="focus-zone-warning
        {{if @isFocusedChallengeAndUserHasFocusedOutOfChallenge 'focus-zone-warning--triggered'}}"
      data-challenge-id="{{@challenge.id}}"
      {{on "mouseenter" @hideOutOfFocusBorder}}
      {{on "mouseleave" @showOutOfFocusBorder}}
    >

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
        @onChallengeSubmit={{this.handleChallengeSubmit}}
      />

      {{#unless @assessment.hasOngoingCompanionLiveAlert}}
        <div class="challenge__feedback" role="complementary">
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
