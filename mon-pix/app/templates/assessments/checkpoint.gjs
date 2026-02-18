import PixBannerAlert from '@1024pix/pix-ui/components/pix-banner-alert';
import PixProgressBar from '@1024pix/pix-ui/components/pix-progress-bar';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import AssessmentBanner from 'mon-pix/components/assessment-banner';
import CheckpointContinue from 'mon-pix/components/checkpoint-continue';
import ComparisonWindow from 'mon-pix/components/comparison-window';
import InElement from 'mon-pix/components/in-element';
import LevelupNotif from 'mon-pix/components/levelup-notif';
import ResultItem from 'mon-pix/components/result-item';

<template>
  {{pageTitle @controller.pageTitle}}

  {{#if @controller.displayShareResultsBanner}}
    <InElement @destinationId="pix-layout-banner-container">
      <PixBannerAlert>
        {{t "pages.checkpoint.sharing-results.information-banner"}}
      </PixBannerAlert>
    </InElement>
  {{/if}}

  <div class="background-banner-wrapper challenge">

    <div class="challenge__banner">
      <AssessmentBanner
        @assessment={{@model}}
        @displayHomeLink={{@controller.displayHomeLink}}
        @displayTextToSpeechActivationButton={{false}}
      />
    </div>

    <div class="checkpoint__container rounded-panel--over-background-banner">
      <div class="checkpoint__header">
        {{#if @controller.shouldDisplayAnswers}}
          <PixProgressBar
            class="checkpoint__progression-gauge"
            @value={{@controller.completionRate}}
            @label={{t
              "pages.checkpoint.completion-percentage.label"
              completion=@controller.completionRate
              htmlSafe=true
            }}
            @subtitle={{t "pages.checkpoint.completion-percentage.caption"}}
            @themeMode="dark"
          />
          <div class="checkpoint__continue-wrapper">
            <CheckpointContinue @assessmentId={{@model.id}} @nextPageButtonText={{@controller.nextPageButtonText}} />
          </div>
        {{/if}}
      </div>

      <main class="rounded-panel rounded-panel--strong checkpoint__content" role="main">
        {{#if @controller.shouldDisplayAnswers}}
          <div class="rounded-panel-one-line-header">
            <h2 class="rounded-panel-header-text__content rounded-panel-title rounded-panel-title--all-small-caps">
              {{t "pages.checkpoint.answers.header"}}
            </h2>
          </div>

          <div class="assessment-results__list">
            {{#each @model.answersSinceLastCheckpoints as |answer|}}
              <ResultItem @answer={{answer}} @openAnswerDetails={{@controller.openComparisonWindow}} />
            {{/each}}
          </div>
          <CheckpointContinue @assessmentId={{@model.id}} @nextPageButtonText={{@controller.nextPageButtonText}} />
        {{else}}
          <div class="checkpoint-no-answer">
            <h1 class="checkpoint-no-answer__header">
              {{t "pages.checkpoint.answers.already-finished.info"}}
            </h1>
            <p class="checkpoint-no-answer__info">
              {{t "pages.checkpoint.answers.already-finished.explanation"}}
            </p>
            <CheckpointContinue @assessmentId={{@model.id}} @nextPageButtonText={{@controller.nextPageButtonText}} />
          </div>
        {{/if}}
      </main>
    </div>

    {{#if @controller.shouldDisplayAnswers}}
      <ComparisonWindow
        @showModal={{@controller.isShowingModal}}
        @answer={{@controller.answer}}
        @closeComparisonWindow={{@controller.closeComparisonWindow}}
      />
    {{/if}}
  </div>

  {{#if @controller.showLevelup}}
    <LevelupNotif @level={{@controller.newLevel}} @competenceName={{@controller.competenceLeveled}} />
  {{/if}}
</template>
