import { t } from 'ember-intl';

<template>
  <p class="screen-reader-only">{{t "charts.participants-by-stage.loader"}}</p>
  <div class="participants-by-status__loader" aria-hidden="true">
    <span class="participants-by-status__loader--chart placeholder-doughnut"></span>
    <span class="participants-by-status__loader--legend placeholder-box"></span>
    <span class="participants-by-status__loader--legend placeholder-box"></span>
  </div>
</template>
