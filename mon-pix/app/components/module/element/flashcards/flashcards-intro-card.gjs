import { PixButton } from '@1024pix/nebulix-ember';
import { t } from 'ember-intl';

<template>
  <div class="element-flashcards-intro-card">
    {{#if @introImage}}
      <div class="element-flashcards-intro-card__image">
        <img
          src={{@introImage.url}}
          width={{@introImage.information.width}}
          height={{@introImage.information.height}}
          alt=""
        />
      </div>
    {{/if}}

    <h4 class="element-flashcards-intro-card__title">{{@title}}</h4>

    <div class="element-flashcards-intro-card__footer">
      <PixButton @triggerAction={{@onStart}} @variant="primary" @size="small">
        {{t "pages.modulix.buttons.flashcards.start"}}
      </PixButton>
    </div>
  </div>
</template>
