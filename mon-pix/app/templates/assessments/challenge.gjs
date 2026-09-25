import { array } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import CertificationBanner from 'mon-pix/components/certification-banner';
import Content from 'mon-pix/components/challenge/content';
import FocusedCertificationChallengeInstructions from 'mon-pix/components/focused-certification-challenge-instructions';
import LevelupNotif from 'mon-pix/components/levelup-notif';
import TimedChallengeInstructions from 'mon-pix/components/timed-challenge-instructions';
import AssessmentBanner from 'mon-pix/components/ui/assessment/banner';
<template>
  {{pageTitle @controller.pageTitle}}

  {{#if @controller.couldDisplayInfoAlert}}
    <div
      class="challenge__info-alert challenge__info-alert--hide challenge__info-alert--could-show"
      tabindex="0"
      role="alert"
      aria-live="assertive"
    >
      <div class="challenge-info-alert__icon"></div>
      {{#if @model.assessment.certificationCourse.isAdjustedForAccessibility}}
        <p class="challenge-info-alert__title">
          {{t "pages.challenge.is-focused-challenge.info-alert.adjusted-course-title"}}
        </p>
      {{else}}
        <p class="challenge-info-alert__title">
          {{t "pages.challenge.is-focused-challenge.info-alert.title"}}
        </p>
        <p class="challenge-info-alert__subtitle">
          {{t "pages.challenge.is-focused-challenge.info-alert.subtitle"}}
        </p>
      {{/if}}
    </div>
  {{/if}}

  <main class="challenge" role="main">
    {{#if @model.assessment.isCertification}}
      <CertificationBanner
        @certificationNumber={{@model.assessment.certificationNumber}}
        @certification={{@model.assessment.certificationCourse}}
        @shouldBlurBanner={{@controller.shouldBlurBanner}}
      />
    {{else}}
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
    {{/if}}

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
    {{/if}}
  </main>

  {{#if @model.challenge.focused}}
    <div
      class="challenge__info-alert challenge__info-alert--hide
        {{if @controller.displayInfoAlertForFocusOut 'challenge__info-alert--show'}}
        {{if @controller.couldDisplayInfoAlert 'challenge__info-alert--could-show'}}"
      tabindex="0"
      role="alert"
      aria-live="assertive"
    >
      <div class="challenge-info-alert__icon"></div>
      {{#if @model.assessment.certificationCourse.isAdjustedForAccessibility}}
        <p class="challenge-info-alert__title">
          {{t "pages.challenge.is-focused-challenge.info-alert.adjusted-course-title"}}
        </p>
      {{else}}
        <p class="challenge-info-alert__title">
          {{t "pages.challenge.is-focused-challenge.info-alert.title"}}
        </p>
        <p class="challenge-info-alert__subtitle">
          {{t "pages.challenge.is-focused-challenge.info-alert.subtitle"}}
        </p>
      {{/if}}
    </div>
  {{/if}}

  {{#if @controller.showLevelup}}
    <LevelupNotif @level={{@controller.newLevel}} @competenceName={{@controller.competenceLeveled}} />
  {{/if}}
</template>
