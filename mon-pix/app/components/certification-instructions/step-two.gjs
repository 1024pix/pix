import { t } from 'ember-intl';

<template>
  <div class="instructions-content instructions-content--type-columns" tabindex="0">
    <div class="instructions-content__illustration">
      <img src="/images/illustrations/certification-instructions-steps/clock.svg" alt="" />

      <p class="instructions-content__legend--bold">
        {{t
          "pages.certification-instructions.steps.2.legend.strong-text"
          maximumAssessmentLength=@maximumAssessmentLength
        }}
      </p>

      <p class="instructions-content__legend">{{@durationLegend}}</p>
    </div>

    <div class="instructions-content__text">
      <p>
        {{t
          "pages.certification-instructions.steps.2.paragraphs.1"
          htmlSafe=true
          maximumAssessmentLength=@maximumAssessmentLength
        }}
      </p>

      <p>
        {{t "pages.certification-instructions.steps.2.paragraphs.2" duration=@durationText htmlSafe=true}}

        <br />
        <span class="instructions-content__paragraph--light">
          <em>{{t "pages.certification-instructions.steps.2.paragraphs.3"}}</em>
        </span>
      </p>

      <p>
        <em>{{t
            "pages.certification-instructions.steps.2.paragraphs.4"
            htmlSafe=true
            minimumAssessmentLength=@minimumAssessmentLength
          }}</em>
      </p>
    </div>
  </div>
</template>
