import { t } from 'ember-intl';

<template>
  <p class="screen-reader-only">{{t "charts.participants-by-stage.loader"}}</p>
  <div class="participants-by-stage" aria-hidden="true">
    <div class="participants-by-stage__stars--loader placeholder-box"></div>
    <div class="participants-by-stage__values--loader placeholder-box"></div>
    <div class="participants-by-stage__graph--loader placeholder-box"></div>
  </div>
  <div class="participants-by-stage" aria-hidden="true">
    <div class="participants-by-stage__stars--loader placeholder-box"></div>
    <div class="participants-by-stage__values--loader placeholder-box"></div>
    <div class="participants-by-stage__graph--loader placeholder-box"></div>
  </div>
  <div class="participants-by-stage" aria-hidden="true">
    <div class="participants-by-stage__stars--loader placeholder-box"></div>
    <div class="participants-by-stage__values--loader placeholder-box"></div>
    <div class="participants-by-stage__graph--loader placeholder-box"></div>
  </div>
</template>
