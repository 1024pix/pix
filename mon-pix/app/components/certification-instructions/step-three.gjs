import { t } from 'ember-intl';

<template>
  <div class="instructions-content-with-images" tabindex="0">
    <div class="instructions-content__images">
      <img
        class="instructions-content__image"
        src="/images/illustrations/certification-instructions-steps/regular-challenge-round.svg"
        alt={{t "pages.certification-instructions.steps.3.images.regular-challenge"}}
      />
      <img
        class="instructions-content__image"
        src="/images/illustrations/certification-instructions-steps/focus-challenge-round.svg"
        alt={{t "pages.certification-instructions.steps.3.images.focus-challenge"}}
      />
    </div>
    <dl class="instructions-description-list">
      <dt class="instructions-content__title--bold">
        {{t "pages.certification-instructions.steps.3.paragraphs.1.title"}}
      </dt>
      <dd>
        {{t "pages.certification-instructions.steps.3.paragraphs.1.text" htmlSafe=true}}
      </dd>

      <dt class="instructions-content__title--bold">
        {{t "pages.certification-instructions.steps.3.paragraphs.2.title"}}
      </dt>
      <dd>
        {{t "pages.certification-instructions.steps.3.paragraphs.2.text" htmlSafe=true}}
      </dd>
    </dl>
  </div>
</template>
