import { t } from 'ember-intl';

<template>
  <div class="instructions-content" tabindex="0">
    <span class="instructions-content__title">{{t "pages.certification-instructions.steps.5.text"}}</span>
    <ul class="instructions-content__list">
      <li>{{t "pages.certification-instructions.steps.5.list.1" htmlSafe=true}}</li>
      <li>{{t "pages.certification-instructions.steps.5.list.2" htmlSafe=true}}</li>
      <li>{{t "pages.certification-instructions.steps.5.list.3" htmlSafe=true}}</li>
      <li>{{t "pages.certification-instructions.steps.5.list.4" htmlSafe=true}}</li>
      <li>{{t "pages.certification-instructions.steps.5.list.5" htmlSafe=true}}</li>
      <li>{{t "pages.certification-instructions.steps.5.list.6" htmlSafe=true}}</li>
      <li>{{t "pages.certification-instructions.steps.5.list.7" htmlSafe=true}}</li>
    </ul>
    <p class="instructions-content__paragraph--light">
      <em>{{t "pages.certification-instructions.steps.5.pix-companion"}}</em>
    </p>

  </div>
</template>
