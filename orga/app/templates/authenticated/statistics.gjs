import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import Statistics from 'pix-orga/components/statistics/index';
<template>
  {{pageTitle (t "pages.statistics.title")}}

  <Statistics @model={{@controller.model}} />
</template>
