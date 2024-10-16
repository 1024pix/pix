import { t } from 'ember-intl';

<template>
  <p class="screen-reader-only">{{t "charts.participants-by-day.loader"}}</p>
  <div class="participants-by-day--loader placeholder-box" aria-hidden="true"></div>
  <ul class="participants-by-day__legend" aria-hidden="true">
    <li class="participants-by-day__legend--loader placeholder-box" aria-hidden="true"></li>
    <li class="participants-by-day__legend--loader placeholder-box" aria-hidden="true"></li>
  </ul>
</template>
