import PixButton from '@1024pix/pix-ui/components/pix-button';
import { t } from 'ember-intl';

<template>
  <div class="element-flashcards-intro-card">
    {{#if @introImage}}
      <div class="element-flashcards-intro-card__image">
        <img src={{@introImage.url}} alt="" />
      </div>
    {{/if}}

    <div class="element-flashcards-intro-card__text">
      <p class="element-flashcards-intro-card__title">{{@title}}</p>
    </div>

    <div class="element-flashcards-intro-card__footer">
      <PixButton @triggerAction={{@onStart}} @variant="primary" @size="small">
        {{t "pages.modulix.buttons.flashcards.start"}}
      </PixButton>
    </div>
  </div>
</template>
