import { t } from 'ember-intl';

<template>
  <div class="instructions-content" tabindex="0">
    <div class="instructions-content__illustration--type-columns">
      <img src="/images/illustrations/certification-instructions-steps/regular-challenge-round.svg" alt="" />

      <div>
        <p class="instructions-content__title">
          {{t "pages.certification-instructions.steps.3.paragraphs.1.title"}}
        </p>

        <p class="instructions-content__paragraph">
          {{t "pages.certification-instructions.steps.3.paragraphs.1.text" htmlSafe=true}}
        </p>
      </div>
    </div>

    <div class="instructions-content__illustration--type-columns">
      <img src="/images/illustrations/certification-instructions-steps/focus-challenge-round.svg" alt="" />

      <div>
        <p class="instructions-content__title">
          {{t "pages.certification-instructions.steps.3.paragraphs.2.title"}}
        </p>

        <p class="instructions-content__paragraph">
          {{t "pages.certification-instructions.steps.3.paragraphs.2.text" htmlSafe=true}}
        </p>
      </div>
    </div>
  </div>
</template>
