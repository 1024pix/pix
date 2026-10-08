import { PixBannerAlert } from '@1024pix/nebulix-ember';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import CheckpointContinue from 'mon-pix/components/assessments/answer-button-continue';
import AnswerStatuses from 'mon-pix/components/assessments/answer-statuses';
import ComparisonWindow from 'mon-pix/components/comparison-window';
import InElement from 'mon-pix/components/in-element';
import LevelupNotif from 'mon-pix/components/levelup-notif';
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

  <main>
    <AssessmentBanner
      @assessment={{@model}}
      @displayHomeLink={{@controller.displayHomeLink}}
      @completionRate={{@controller.completionRate}}
      @displayTextToSpeechActivationButton={{false}}
      @showGlobalProgression={{true}}
    />

    <AnswerStatuses
      @answers={{@model.answersSinceLastCheckpoints}}
      @openAnswerDetails={{@controller.openComparisonWindow}}
      @shouldDisplayAnswers={{@controller.shouldDisplayAnswers}}
      @assessmentId={{@model.id}}
      @nextPageButtonText={{@controller.nextPageButtonText}}
    />

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
