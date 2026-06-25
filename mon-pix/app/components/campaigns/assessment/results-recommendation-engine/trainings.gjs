import { t } from 'ember-intl';
import onIntersect from 'mon-pix/modifiers/on-intersect';

import TrainingCard from './training/card';

<template>
  <section class="results-recommendation-engine-training" {{onIntersect @onFullyVisible threshold=1}}>
    <h2 class="results-recommendation-engine-training__title">{{t
        "pages.skill-review.recommended-engine.trainings.title"
      }}</h2>
    <p class="results-recommendation-engine-training__description">{{t
        "pages.skill-review.recommended-engine.trainings.description"
      }}</p>

    <ul class="results-recommendation-engine-training__list">
      {{#each @trainings as |training|}}
        <li><TrainingCard
            @training={{training}}
            @onCardClick={{@onCardClick}}
            @onModalButtonClick={{@onModalButtonClick}}
            @onModalAccordionClick={{@onModalAccordionClick}}
          /></li>
      {{/each}}
    </ul>
  </section>
</template>
