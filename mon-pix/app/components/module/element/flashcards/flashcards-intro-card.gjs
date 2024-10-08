import PixButton from '@1024pix/pix-ui/components/pix-button';
import { t } from 'ember-intl';

<template>
  <div class="element-flashcards__intro-card">
    {{#if @introImage}}
      <div class="element-flashcards__intro-card__image">
        <img src={{@introImage.url}} alt="" />
      </div>
    {{/if}}

    <div class="element-flashcards__intro-card__text">
      <p class="element-flashcards__intro-card__title">{{@title}}</p>
    </div>

    <div class="element-flashcards__intro-card__footer">
      <PixButton @triggerAction={{@onStart}} @variant="primary" @size="small">
        {{t "pages.modulix.buttons.flashcards.start"}}
      </PixButton>
    </div>
  </div>
</template>
