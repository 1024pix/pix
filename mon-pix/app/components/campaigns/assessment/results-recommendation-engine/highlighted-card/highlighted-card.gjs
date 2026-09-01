import { t } from 'ember-intl';

import Card from '../training/card';

<template>
  <div class="highlighted-card-container">
    <div class="highlighted-card-tag">
      <p class="highlighted-card-tag__text">{{t "pages.skill-review.recommended-engine.highlighted-card.editor-label"}}
        <span class="highlighted-card-tag__text--bold">{{@highlightedTraining.editorName}}</span>
      </p>
    </div>
    <div class="highlighted-card">
      <h2 class="highlighted-card__title">{{t "pages.skill-review.recommended-engine.highlighted-card.title"}}</h2>
      <p class="highlighted-card__subtitle">{{t "pages.skill-review.recommended-engine.highlighted-card.subtitle"}}</p>
      <Card @isHighlighted={{true}} @training={{@highlightedTraining}} @onCardClick={{@onCardClick}} />
    </div>
  </div>
</template>
