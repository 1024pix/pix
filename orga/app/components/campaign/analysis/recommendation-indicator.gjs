import { t } from 'ember-intl';

import multiply from '../../../helpers/multiply';
import sum from '../../../helpers/sum';

const RECOMMENDED = 75;
const STRONGLY_RECOMMENDED = 50;
const VERY_STRONGLY_RECOMMENDED = 25;

function label(value) {
  if (value <= VERY_STRONGLY_RECOMMENDED)
    return 'pages.campaign-review.table.analysis.recommendations.very-strongly-recommended';
  if (value <= STRONGLY_RECOMMENDED) return 'pages.campaign-review.table.analysis.recommendations.strongly-recommended';
  if (value <= RECOMMENDED) return 'pages.campaign-review.table.analysis.recommendations.recommended';
  return 'pages.campaign-review.table.analysis.recommendations.moderately-recommended';
}

function bubblesCount(value) {
  if (value <= VERY_STRONGLY_RECOMMENDED) return 4;
  if (value <= STRONGLY_RECOMMENDED) return 3;
  if (value <= RECOMMENDED) return 2;
  return 1;
}

function bubbles(value) {
  return new Array(bubblesCount(value));
}

function bubbleWidth(value) {
  return 12 * bubblesCount(value);
}

<template>
  <div class="recommendation-indicator">
    <svg height="10" width={{bubbleWidth @value}} aria-label={{t (label @value)}} role="img">
      {{#each (bubbles @value) as |bubble index|}}
        <circle cx={{sum (multiply 12 index) 5}} cy="5" r="5" class="recommendation-indicator__bubble"></circle>
      {{/each}}
    </svg>
  </div>
</template>
