import PixBannerAlert from '@1024pix/pix-ui/components/pix-banner-alert';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import CheckpointContinue from 'mon-pix/components/checkpoint-continue';
import ComparisonWindow from 'mon-pix/components/comparison-window';
import InElement from 'mon-pix/components/in-element';
import LevelupNotif from 'mon-pix/components/levelup-notif';
import ResultItem from 'mon-pix/components/result-item';
import AssessmentBanner from 'mon-pix/components/ui/assessment/banner';

<template>
  {{pageTitle @controller.pageTitle}}

  {{#if @controller.displayShareResultsBanner}}
    <InElement @destinationId="pix-layout-banner-container">
      <PixBannerAlert>
        {{t "pages.checkpoint.sharing-results.information-banner"}}
      </PixBannerAlert>
    </InElement>
  {{/if}}

  <main class="challenge">
    <AssessmentBanner
      @assessment={{@model}}
      @displayHomeLink={{@controller.displayHomeLink}}
      @completionRate={{@controller.completionRate}}
      @displayTextToSpeechActivationButton={{false}}
      @showGlobalProgression={{true}}
    />

    <div class="checkpoint__container">
      <div class="rounded-panel rounded-panel--strong checkpoint__content" role="div">
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
      </div>
    </div>

    {{#if @controller.shouldDisplayAnswers}}
      <ComparisonWindow
        @showModal={{@controller.isShowingModal}}
        @answer={{@controller.answer}}
        @closeComparisonWindow={{@controller.closeComparisonWindow}}
      />
    {{/if}}
  </main>

  {{#if @controller.showLevelup}}
    <LevelupNotif @level={{@controller.newLevel}} @competenceName={{@controller.competenceLeveled}} />
  {{/if}}
</template>
