import { array } from '@ember/helper';
import pageTitle from 'ember-page-title/helpers/page-title';
import Content from 'mon-pix/components/challenge/content';
import FocusOutAlertBanner from 'mon-pix/components/challenge/focus-out-alert-banner';
import TimedChallengeInstructions from 'mon-pix/components/challenge/timed-challenge-instructions';
import FocusedCertificationChallengeInstructions from 'mon-pix/components/focused-certification-challenge-instructions';
import LevelupNotif from 'mon-pix/components/levelup-notif';
import AssessmentBanner from 'mon-pix/components/ui/assessment/banner';

<template>
  {{pageTitle @controller.pageTitle}}

  <main role="main">
    <AssessmentBanner
      @assessment={{@model.assessment}}
      @completionRate={{@model.assessment.globalProgression}}
      @showGlobalProgression={{@model.assessment.globalProgression}}
      @displayHomeLink={{@controller.displayHomeLink}}
      @isTextToSpeechActivated={{@controller.isTextToSpeechActivated}}
      @currentChallengeNumber={{@model.currentChallengeNumber}}
      @toggleTextToSpeech={{@controller.toggleTextToSpeech}}
      @displayTextToSpeechActivationButton={{true}}
    />

    <div class="challenge__display">
      {{#if @controller.displayTimedChallengeInstructions}}
        <TimedChallengeInstructions
          @hasUserConfirmedWarning={{@controller.setUserTimedChallengeConfirmation}}
          @time={{@model.challenge.timer}}
        />
      {{/if}}

      {{#if @controller.displayFocusedCertificationChallengeWarning}}
        <FocusedCertificationChallengeInstructions
          @hasUserConfirmedWarning={{@controller.setUserFocusCertificationChallengeConfirmation}}
        />
      {{/if}}

      {{#if @controller.displayChallenge}}
        {{! SAFARI >=26.4 WORKAROUND: forces unmount/mount of content when challenge changes }}
        {{#each (array @model.challenge)}}
          <Content
            @answer={{@model.answer}}
            @assessment={{@model.assessment}}
            @challenge={{@model.challenge}}
            @focusedOutOfWindow={{@controller.focusedOutOfWindow}}
            @hasFocusedOutOfWindow={{@controller.hasFocusedOutOfWindow}}
            @hideOutOfFocusBorder={{@controller.hideOutOfFocusBorder}}
            @isFocusedChallengeAndUserHasFocusedOutOfChallenge={{@controller.isFocusedChallengeAndUserHasFocusedOutOfChallenge}}
            @isTextToSpeechActivated={{@controller.isTextToSpeechActivated}}
            @resetAllChallengeInfo={{@controller.resetAllChallengeInfo}}
            @resetChallengeInfoOnResume={{@controller.resetChallengeInfoOnResume}}
            @setFocusedOutOfChallenge={{@controller.setFocusedOutOfChallenge}}
            @showOutOfFocusBorder={{@controller.showOutOfFocusBorder}}
            @submitLiveAlert={{@controller.submitLiveAlert}}
            @timeoutChallenge={{@controller.timeoutChallenge}}
          />
        {{/each}}

        {{#if @controller.displayInfoAlertForFocusOut}}
          <FocusOutAlertBanner />
        {{/if}}
      {{/if}}
    </div>
  </main>

  {{#if @controller.showLevelup}}
    <LevelupNotif @level={{@controller.newLevel}} @competenceName={{@controller.competenceLeveled}} />
  {{/if}}
</template>
