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

    <div>
      <p class="element-flashcards-outro-card__question">{{t "pages.modulix.flashcards.answerDirection"}}</p>
      <ul class="element-flashcards-outro-card__counter">
        <li class="element-flashcards-outro-card__counter__yes">
          {{t "pages.modulix.flashcards.counter.yes" totalYes=@counters.yes}}
        </li>
        <li class="element-flashcards-outro-card__counter__almost">
          {{t "pages.modulix.flashcards.counter.almost" totalAlmost=@counters.almost}}
        </li>
        <li class="element-flashcards-outro-card__counter__no">
          {{t "pages.modulix.flashcards.counter.no" totalNo=@counters.no}}
        </li>
      </ul>
    </div>

    <div class="element-flashcards-outro-card__footer">
      <PixButton @triggerAction={{@onRetry}} @iconBefore="refresh" @variant="tertiary" @size="small">
        {{t "pages.modulix.buttons.flashcards.retry"}}
      </PixButton>
    </div>
  </div>
</template>
