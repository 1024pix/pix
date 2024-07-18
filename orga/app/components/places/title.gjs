import dayjs from 'dayjs';
import { t } from 'ember-intl';

function todayDate() {
  return dayjs().format('D MMM YYYY');
}

<template>
  <div class="places-page-header">
    <h1 class="page-title">{{t "pages.places.title"}}</h1>
    <span class="places-page-header__date">{{t "pages.places.before-date"}}
      {{todayDate}}</span>
  </div>
</template>
