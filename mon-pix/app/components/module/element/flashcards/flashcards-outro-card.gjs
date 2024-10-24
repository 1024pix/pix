import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixMessage from '@1024pix/pix-ui/components/pix-message';
import { t } from 'ember-intl';

<template>
  <div class="element-flashcards-outro-card">

    <div class="element-flashcards-outro-card__header">
      <PixMessage class="element-flashcards-outro-card__alert" @type="success" @withIcon="true">
        {{t "pages.modulix.flashcards.completed"}}
      </PixMessage>
      <p class="element-flashcards-outro-card__title">{{@title}}</p>
    </div>

    <div class="element-flashcards-outro-card__text">

    </div>

    <div class="element-flashcards-outro-card__footer">
      <PixButton @triggerAction={{@onRetry}} @iconBefore="refresh" @variant="tertiary" @size="small">
        {{t "pages.modulix.buttons.flashcards.retry"}}
      </PixButton>
    </div>
  </div>
</template>
