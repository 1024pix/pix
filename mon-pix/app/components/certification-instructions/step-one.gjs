import { t } from 'ember-intl';

<template>
  <div class="instructions-content" tabindex="0">
    <h3 class="instructions-content__title--bold">
      {{t "pages.certification-instructions.steps.1.question"}}
    </h3>

    <p class="instructions-content__paragraph">
      {{t "pages.certification-instructions.steps.1.paragraphs.1.text" htmlSafe=true}}
    </p>

    <p class="instructions-content__paragraph">
      {{t "pages.certification-instructions.steps.1.paragraphs.2.text" htmlSafe=true}}
    </p>

    <p class="instructions-content__paragraph">
      {{t "pages.certification-instructions.steps.1.paragraphs.3.text" htmlSafe=true}}
    </p>
  </div>
</template>
