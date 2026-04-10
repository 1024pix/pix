import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import AssessmentBanner from 'mon-pix/components/assessment-banner';
import CertificationBanner from 'mon-pix/components/certification-banner';
import CertificationTechnicalError from 'mon-pix/components/certifications/certification-technical-error';
import Content from 'mon-pix/components/challenge/content';
import FocusedCertificationChallengeInstructions from 'mon-pix/components/focused-certification-challenge-instructions';
import LevelupNotif from 'mon-pix/components/levelup-notif';
import ProgressBar from 'mon-pix/components/progress-bar';
import TimedChallengeInstructions from 'mon-pix/components/timed-challenge-instructions';
<template>
  {{pageTitle @controller.pageTitle}}

  {{#if @controller.hasCertificationTechnicalError}}
    <CertificationTechnicalError
      @certificationNumber={{@model.assessment.certificationNumber}}
      @isToBeCancelled={{@controller.isCertificationtoBeCancelled}}
    />
  {{else}}

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

  <div class="background-banner-wrapper challenge">

    <div class="challenge__banner">
      {{#if @model.assessment.isCertification}}
        <CertificationBanner
          @certificationNumber={{@model.assessment.certificationNumber}}
          @certification={{@model.assessment.certificationCourse}}
          @shouldBlurBanner={{@controller.shouldBlurBanner}}
        />
      {{else}}
        <AssessmentBanner
          @assessment={{@model.assessment}}
          @displayHomeLink={{@controller.displayHomeLink}}
          @isTextToSpeechActivated={{@controller.isTextToSpeechActivated}}
          @toggleTextToSpeech={{@controller.toggleTextToSpeech}}
          @displayTextToSpeechActivationButton={{true}}
        />
      {{/if}}
    </div>

    <main class="challenge__content rounded-panel--over-background-banner" role="main">
      <ProgressBar @assessment={{@model.assessment}} @currentChallengeNumber={{@model.currentChallengeNumber}} />

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
  </div>

  {{#if @controller.showLevelup}}
    <LevelupNotif @level={{@controller.newLevel}} @competenceName={{@controller.competenceLeveled}} />
  {{/if}}
  {{/if}}
</template>
