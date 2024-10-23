import { t } from 'ember-intl';

<template>
  <div class="instructions-content instructions-content--type-columns" tabindex="0">
    <div class="instructions-content__illustration">
      <img src="/images/illustrations/certification-instructions-steps/clock.svg" alt="" />

      <p class="instructions-content__legend--bold">
        {{t "pages.certification-instructions.steps.2.legend.strong-text"}}
      </p>

      <p class="instructions-content__legend">{{t "pages.certification-instructions.steps.2.legend.text"}}</p>
    </div>

    <div class="instructions-content__text">
      <p>
        {{t "pages.certification-instructions.steps.2.paragraphs.1" htmlSafe=true}}
      </p>

      <p>
        {{t "pages.certification-instructions.steps.2.paragraphs.2" htmlSafe=true}}

        <br />
        <span class="instructions-content__paragraph--light">
          <em>{{t "pages.certification-instructions.steps.2.paragraphs.3"}}</em>
        </span>
      </p>

      <p>
        <em>{{t "pages.certification-instructions.steps.2.paragraphs.4" htmlSafe=true}}</em>
      </p>
    </div>
  </div>
</template>
