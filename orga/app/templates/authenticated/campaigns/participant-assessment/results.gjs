import pageTitle from 'ember-page-title/helpers/page-title';
import Results from 'pix-orga/components/participant/assessment/results';
<template>
  {{pageTitle @controller.pageTitle}}

  <Results @results={{@model}} @class="participant-results" />
</template>
