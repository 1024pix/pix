import { t } from 'ember-intl';

<template>
  <div class="instructions-content" tabindex="0">
    <p class="instructions-content__paragraph">
      {{t "pages.certification-instructions.steps.4.text" htmlSafe=true}}
    </p>
    <ol class="instructions-content-list">
      <li>{{t "pages.certification-instructions.steps.4.list.1"}}</li>
      <li>{{t "pages.certification-instructions.steps.4.list.2"}}</li>
      <li>{{t "pages.certification-instructions.steps.4.list.3"}}</li>
      <li>{{t "pages.certification-instructions.steps.4.list.4"}}</li>
    </ol>
  </div>
</template>
