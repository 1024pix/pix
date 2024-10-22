import { t } from 'ember-intl';

<template>
  <div class="instructions-content-with-images" tabindex="0">
    <div class="instructions-content-with-images__legend">
      <img
        class="instructions-content__image"
        src="/images/illustrations/certification-instructions-steps/clock.svg"
        alt=""
      />
      <p>
        <span class="instructions-content-with-images__legend--bold">
          {{t "pages.certification-instructions.steps.2.legend.strong-text"}}
        </span>

        {{t "pages.certification-instructions.steps.2.legend.text"}}
      </p>
    </div>

    <div class="instructions-content">
      <p class="instructions-content__paragraph">
        {{t "pages.certification-instructions.steps.2.paragraphs.1" htmlSafe=true}}
      </p>

      <p>
        {{t "pages.certification-instructions.steps.2.paragraphs.2.text" htmlSafe=true}}

        <br />
        <span class="instructions-content__text--light">
          {{t "pages.certification-instructions.steps.2.paragraphs.2.light"}}
        </span>
      </p>

      <p class="instructions-content__paragraph">
        <em>{{t "pages.certification-instructions.steps.2.paragraphs.3" htmlSafe=true}}</em>
      </p>
    </div>
  </div>
</template>
