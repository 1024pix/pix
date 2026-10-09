import { PixButtonLink } from '@1024pix/nebulix-ember';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import ComparisonWindow from 'mon-pix/components/assessments/comparison-window';
import ResultItem from 'mon-pix/components/assessments/result-item';
import AssessmentBanner from 'mon-pix/components/ui/assessment/banner';
<template>
  {{pageTitle (t "pages.assessment-results.title")}}

  <main>
    <AssessmentBanner
      @assessment={{@model}}
      @displayHomeLink={{false}}
      @isEnded={{true}}
      @displayTextToSpeechActivationButton={{false}}
    />

    <div class="assessment-results__content">
      <p class="assessment-results__title">
        {{t "pages.assessment-results.answers.header"}}
      </p>

      <div class="assessment-results__list">
        {{#each @model.answers as |answer|}}
          <ResultItem @answer={{answer}} @openAnswerDetails={{@controller.openComparisonWindow}} />
        {{/each}}
      </div>

      <div class="assessment-results__index-link-container">
        {{#if @model.isDemo}}
          <PixButtonLink
            @href="https://app.pix.org/inscription"
            class="assessment-results__index-link__element assessment-results__index-a-link"
          >
            <span class="assessment-results__link-back">{{t
                "pages.assessment-results.actions.continue-pix-experience"
              }}</span>
          </PixButtonLink>
        {{else}}
          <PixButtonLink @route="authenticated">
            <span class="assessment-results__link-back">{{t
                "pages.assessment-results.actions.return-to-homepage"
              }}</span>
          </PixButtonLink>
        {{/if}}
      </div>
    </div>

    <ComparisonWindow
      @answer={{@controller.answer}}
      @closeComparisonWindow={{@controller.closeComparisonWindow}}
      @showModal={{@controller.isShowingModal}}
    />

  </main>
</template>
